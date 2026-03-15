import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ quoteId: string }> },
) {
  const { quoteId } = await context.params;

  const quoteRequest = await db.quoteRequest.findUnique({
    where: { id: quoteId },
    include: { quoteResults: true },
  });

  if (!quoteRequest) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  const sameDay = quoteRequest.quoteResults.find((item) => item.jobType === "SAME_DAY");
  const direct = quoteRequest.quoteResults.find((item) => item.jobType === "DIRECT");

  if (!sameDay || !direct) {
    return NextResponse.json({ error: "This quote is incomplete." }, { status: 409 });
  }

  return NextResponse.json({
    quoteRequestId: quoteRequest.id,
    collectionPostcode: quoteRequest.collectionPostcode,
    deliveryPostcodes: quoteRequest.deliveryPostcodes,
    readyMode: quoteRequest.readyMode,
    collectionDateTime: quoteRequest.collectionDateTime?.toISOString() ?? null,
    selectedVanType: quoteRequest.selectedVanType,
    options: {
      same_day: {
        milesRaw: sameDay.miles,
        distanceCharge: Number(sameDay.distanceCharge),
        minimumCharge: Number(sameDay.minimumCharge),
        minimumApplied: sameDay.minimumApplied,
        extraStopsCount: sameDay.extraStopsCount,
        stopsFee: Number(sameDay.stopsFee),
        congestionApplied: sameDay.congestionApplied,
        congestionFee: Number(sameDay.congestionFee),
        total: Number(sameDay.total),
      },
      direct: {
        milesRaw: direct.miles,
        distanceCharge: Number(direct.distanceCharge),
        minimumCharge: Number(direct.minimumCharge),
        minimumApplied: direct.minimumApplied,
        extraStopsCount: direct.extraStopsCount,
        stopsFee: Number(direct.stopsFee),
        congestionApplied: direct.congestionApplied,
        congestionFee: Number(direct.congestionFee),
        total: Number(direct.total),
      },
    },
  });
}
