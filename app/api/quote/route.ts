import { JobType, ReadyMode, VanType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDistanceProvider } from "@/src/lib/distance";
import { db } from "@/src/lib/db";
import { normalizeAndValidatePostcodes } from "@/src/lib/postcode/uk";
import { calculateQuote } from "@/src/lib/pricing/calc";
import { isStopInCongestionZone } from "@/src/lib/zones/ccz";

const MAX_DELIVERIES = 10;
const ROUTE_FAILURE_MESSAGE =
  "We couldn’t calculate a route for those postcodes. Please check and try again.";

export const quoteInputSchema = z
  .object({
    collection_postcode: z.string().min(1, "Collection postcode is required."),
    delivery_postcodes: z
      .array(z.string().min(1, "Delivery postcode is required."))
      .min(1, "At least one delivery postcode is required.")
      .max(MAX_DELIVERIES, "For more than 10 stops, please contact us."),
    van_size: z.enum(["small", "medium", "large"]),
    job_type: z.enum(["same_day", "direct"]),
    ready_mode: z.enum(["ready_now", "prebook"]),
    collection_date: z.string().optional(),
    ready_time: z.string().optional(),
    courier_id: z.string().uuid().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.ready_mode === "prebook") {
      if (!value.collection_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Collection date is required for pre-book jobs.",
          path: ["collection_date"],
        });
      }

      if (!value.ready_time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ready time is required for pre-book jobs.",
          path: ["ready_time"],
        });
      }
    }
  });

function toPrismaVanType(vanSize: "small" | "medium" | "large"): VanType {
  const map: Record<typeof vanSize, VanType> = {
    small: VanType.SMALL,
    medium: VanType.MEDIUM,
    large: VanType.LARGE,
  };
  return map[vanSize];
}

function toPrismaReadyMode(readyMode: "ready_now" | "prebook"): ReadyMode {
  return readyMode === "ready_now" ? ReadyMode.READY_NOW : ReadyMode.PREBOOK;
}

function buildCollectionDateTime(collectionDate?: string, readyTime?: string): Date | null {
  if (!collectionDate || !readyTime) {
    return null;
  }

  const date = new Date(`${collectionDate}T${readyTime}:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

async function geocodeStops(postcodes: string[]) {
  const provider = getDistanceProvider();
  const geocoded = await Promise.all(
    postcodes.map(async (postcode) => {
      try {
        const coordinates = await provider.geocodePostcode(postcode);
        return { postcode, coordinates };
      } catch {
        return { postcode, coordinates: null };
      }
    }),
  );

  return geocoded;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = quoteInputSchema.safeParse(body);
  const hostCourierSlug = request.headers.get("x-courier-slug")?.trim().toLowerCase() ?? null;

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the quote details and try again.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const normalizedCollection = normalizeAndValidatePostcodes([parsed.data.collection_postcode]);
  const normalizedDeliveries = normalizeAndValidatePostcodes(parsed.data.delivery_postcodes);

  if (normalizedCollection.errors.length > 0 || normalizedDeliveries.errors.length > 0) {
    return NextResponse.json(
      {
        error: "Please check your postcodes and try again.",
        details: {
          collection: normalizedCollection.errors,
          deliveries: normalizedDeliveries.errors,
        },
      },
      { status: 400 },
    );
  }

  const collectionPostcode = normalizedCollection.normalized[0];
  const deliveryPostcodes = normalizedDeliveries.normalized;
  const orderedStops = [collectionPostcode, ...deliveryPostcodes];
  const provider = getDistanceProvider();

  let totalMeters = 0;
  try {
    const distance = await provider.getRouteDistance(orderedStops);
    totalMeters = distance.totalMeters;
  } catch {
    return NextResponse.json({ error: ROUTE_FAILURE_MESSAGE }, { status: 502 });
  }

  if (!Number.isFinite(totalMeters) || totalMeters <= 0) {
    return NextResponse.json({ error: ROUTE_FAILURE_MESSAGE }, { status: 502 });
  }

  const stopsWithCoordinates = await geocodeStops(orderedStops);
  const congestionApplied = stopsWithCoordinates.some((stop) => isStopInCongestionZone(stop));

  const sameDay = calculateQuote({
    meters: totalMeters,
    deliveriesCount: deliveryPostcodes.length,
    vanSize: parsed.data.van_size,
    jobType: "same_day",
    congestionApplied,
  });

  const direct = calculateQuote({
    meters: totalMeters,
    deliveriesCount: deliveryPostcodes.length,
    vanSize: parsed.data.van_size,
    jobType: "direct",
    congestionApplied,
  });

  const collectionDateTime = buildCollectionDateTime(
    parsed.data.collection_date,
    parsed.data.ready_time,
  );

  const saved = await db.$transaction(async (tx) => {
    const hostCourier = hostCourierSlug
      ? await tx.courier.findFirst({
          where: {
            slug: hostCourierSlug,
            isActive: true,
          },
          select: { id: true },
        })
      : null;

    const defaultCourier = parsed.data.courier_id
      ? null
      : await tx.courier.findFirst({
          where: { isActive: true },
          select: { id: true },
        });

    const quoteRequest = await tx.quoteRequest.create({
      data: {
        courierId: parsed.data.courier_id ?? hostCourier?.id ?? defaultCourier?.id,
        collectionPostcode,
        deliveryPostcodes,
        readyMode: toPrismaReadyMode(parsed.data.ready_mode),
        collectionDateTime,
        selectedVanType: toPrismaVanType(parsed.data.van_size),
      },
    });

    await tx.quoteResult.createMany({
      data: [
        {
          quoteRequestId: quoteRequest.id,
          jobType: JobType.SAME_DAY,
          miles: sameDay.milesRaw,
          perMileRate: sameDay.perMileRate,
          distanceCharge: sameDay.distanceCharge,
          minimumCharge: sameDay.minimumCharge,
          minimumApplied: sameDay.minimumApplied,
          extraStopsCount: sameDay.extraStopsCount,
          stopsFee: sameDay.stopsFee,
          congestionApplied: sameDay.congestionApplied,
          congestionFee: sameDay.congestionFee,
          total: sameDay.total,
        },
        {
          quoteRequestId: quoteRequest.id,
          jobType: JobType.DIRECT,
          miles: direct.milesRaw,
          perMileRate: direct.perMileRate,
          distanceCharge: direct.distanceCharge,
          minimumCharge: direct.minimumCharge,
          minimumApplied: direct.minimumApplied,
          extraStopsCount: direct.extraStopsCount,
          stopsFee: direct.stopsFee,
          congestionApplied: direct.congestionApplied,
          congestionFee: direct.congestionFee,
          total: direct.total,
        },
      ],
    });

    return quoteRequest;
  });

  return NextResponse.json({
    quoteRequestId: saved.id,
    collectionPostcode,
    deliveryPostcodes,
    selectedVanSize: parsed.data.van_size,
    selectedJobType: parsed.data.job_type,
    readyMode: parsed.data.ready_mode,
    collectionDateTime: collectionDateTime?.toISOString() ?? null,
    options: {
      same_day: sameDay,
      direct,
    },
  });
}
