import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getSelectedQuoteResult,
  parsePrismaDecimal,
  toPrismaJobType,
} from "@/src/lib/booking/helpers";
import { db } from "@/src/lib/db";

const bookingDraftSchema = z.object({
  quoteRequestId: z.string().uuid(),
  jobTypeChosen: z.enum(["same_day", "direct"]),
  communityShareOptIn: z.boolean(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bookingDraftSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check your booking details and try again.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const quoteRequest = await db.quoteRequest.findUnique({
    where: { id: parsed.data.quoteRequestId },
    include: {
      quoteResults: true,
    },
  });

  if (!quoteRequest) {
    return NextResponse.json({ error: "Quote request not found." }, { status: 404 });
  }

  const jobTypeChosen = toPrismaJobType(parsed.data.jobTypeChosen);
  const selectedQuote = getSelectedQuoteResult(quoteRequest.quoteResults, jobTypeChosen);

  if (!selectedQuote) {
    return NextResponse.json({ error: "Quote option not found." }, { status: 404 });
  }

  const bookingDraft = await db.bookingDraft.create({
    data: {
      quoteRequestId: quoteRequest.id,
      jobTypeChosen,
      communityShareOptIn: parsed.data.communityShareOptIn,
      quotedTotal: parsePrismaDecimal(selectedQuote.total),
      draftStops: {
        create: quoteRequest.deliveryPostcodes.map((postcode, index) => ({
          sequence: index + 1,
          kind: "DELIVERY",
          postcode,
        })),
      },
    },
  });

  return NextResponse.json({
    bookingDraftId: bookingDraft.id,
  });
}
