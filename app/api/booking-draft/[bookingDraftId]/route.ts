import { NextResponse } from "next/server";

import { bookingDraftUpdateSchema } from "@/src/lib/booking/schema";
import { db } from "@/src/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ bookingDraftId: string }> },
) {
  const { bookingDraftId } = await context.params;

  const bookingDraft = await db.bookingDraft.findUnique({
    where: { id: bookingDraftId },
    include: {
      draftStops: {
        orderBy: { sequence: "asc" },
      },
      quoteRequest: {
        include: {
          courier: true,
        },
      },
    },
  });

  if (!bookingDraft) {
    return NextResponse.json({ error: "Booking draft not found." }, { status: 404 });
  }

  return NextResponse.json({
    bookingDraft: {
      id: bookingDraft.id,
      jobTypeChosen: bookingDraft.jobTypeChosen,
      communityShareOptIn: bookingDraft.communityShareOptIn,
      quotedTotal: Number(bookingDraft.quotedTotal),
      currency: bookingDraft.currency,
      customerName: bookingDraft.customerName,
      customerEmail: bookingDraft.customerEmail,
      customerPhone: bookingDraft.customerPhone,
      collectionAddressLine1: bookingDraft.collectionAddressLine1,
      collectionContactName: bookingDraft.collectionContactName,
      collectionContactPhone: bookingDraft.collectionContactPhone,
      notes: bookingDraft.notes,
      reference: bookingDraft.reference,
      status: bookingDraft.status,
      draftStops: bookingDraft.draftStops,
      quoteRequest: {
        id: bookingDraft.quoteRequest.id,
        collectionPostcode: bookingDraft.quoteRequest.collectionPostcode,
        deliveryPostcodes: bookingDraft.quoteRequest.deliveryPostcodes,
        readyMode: bookingDraft.quoteRequest.readyMode,
        collectionDateTime: bookingDraft.quoteRequest.collectionDateTime?.toISOString() ?? null,
        selectedVanType: bookingDraft.quoteRequest.selectedVanType,
        courier: bookingDraft.quoteRequest.courier
          ? {
              businessName: bookingDraft.quoteRequest.courier.businessName,
              displayName: bookingDraft.quoteRequest.courier.displayName,
            }
          : null,
      },
    },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ bookingDraftId: string }> },
) {
  const { bookingDraftId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = bookingDraftUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the booking details and try again.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const existing = await db.bookingDraft.findUnique({
    where: { id: bookingDraftId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Booking draft not found." }, { status: 404 });
  }

  if (existing.status === "COMPLETED") {
    return NextResponse.json(
      { error: "This booking has already been completed." },
      { status: 409 },
    );
  }

  const updated = await db.$transaction(async (tx) => {
    await tx.bookingDraft.update({
      where: { id: bookingDraftId },
      data: {
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        customerPhone: parsed.data.customerPhone,
        collectionAddressLine1: parsed.data.collectionAddressLine1,
        collectionContactName: parsed.data.collectionContactName,
        collectionContactPhone: parsed.data.collectionContactPhone,
        notes: parsed.data.notes || null,
        reference: parsed.data.reference || null,
        status: "DRAFT",
        checkoutStartedAt: null,
      },
    });

    for (const stop of parsed.data.draftStops) {
      await tx.bookingDraftStop.update({
        where: {
          id: stop.id,
        },
        data: {
          addressLine1: stop.addressLine1,
          contactName: stop.contactName,
          contactPhone: stop.contactPhone,
        },
      });
    }

    return tx.bookingDraft.findUnique({
      where: { id: bookingDraftId },
      include: {
        draftStops: {
          orderBy: { sequence: "asc" },
        },
      },
    });
  });

  return NextResponse.json({
    bookingDraft: {
      id: updated?.id,
      customerName: updated?.customerName ?? null,
      customerEmail: updated?.customerEmail ?? null,
      customerPhone: updated?.customerPhone ?? null,
      collectionAddressLine1: updated?.collectionAddressLine1 ?? null,
      collectionContactName: updated?.collectionContactName ?? null,
      collectionContactPhone: updated?.collectionContactPhone ?? null,
      notes: updated?.notes ?? null,
      reference: updated?.reference ?? null,
      status: updated?.status ?? null,
      draftStops: updated?.draftStops ?? [],
    },
  });
}

