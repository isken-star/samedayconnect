import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";
import { joinApplicationSchema } from "@/src/lib/join/schema";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = joinApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the form and try again.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const application = await db.joinApplication.create({
    data: {
      fullName: parsed.data.fullName,
      businessName: parsed.data.businessName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      areasCovered: parsed.data.areasCovered,
      vanType: parsed.data.vanType,
      insuranceConfirmed: parsed.data.insuranceConfirmed,
      message: parsed.data.message ? parsed.data.message : null,
    },
    select: { id: true },
  });

  return NextResponse.json({ applicationId: application.id }, { status: 200 });
}
