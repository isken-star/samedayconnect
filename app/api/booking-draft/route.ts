import { JobType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/src/lib/db";

const bookingDraftSchema = z.object({
  quoteRequestId: z.string().uuid(),
  jobTypeChosen: z.enum(["same_day", "direct"]),
  communityShareOptIn: z.boolean(),
});

function toPrismaJobType(jobType: "same_day" | "direct"): JobType {
  return jobType === "same_day" ? JobType.SAME_DAY : JobType.DIRECT;
}

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
    select: { id: true },
  });

  if (!quoteRequest) {
    return NextResponse.json({ error: "Quote request not found." }, { status: 404 });
  }

  const bookingDraft = await db.bookingDraft.create({
    data: {
      quoteRequestId: parsed.data.quoteRequestId,
      jobTypeChosen: toPrismaJobType(parsed.data.jobTypeChosen),
      communityShareOptIn: parsed.data.communityShareOptIn,
    },
  });

  return NextResponse.json({
    bookingDraftId: bookingDraft.id,
  });
}
