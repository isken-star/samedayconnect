import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";
import { getEmailProvider } from "@/src/lib/email";
import { joinApplicationSchema } from "@/src/lib/join/schema";

const JOIN_APPLICATION_NOTIFICATION_EMAIL = "info@samedayconnect.co.uk";

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
    select: {
      id: true,
      fullName: true,
      businessName: true,
      email: true,
      phone: true,
      areasCovered: true,
      vanType: true,
      insuranceConfirmed: true,
      message: true,
      createdAt: true,
    },
  });

  try {
    await getEmailProvider().sendJoinApplicationNotification({
      toEmail: JOIN_APPLICATION_NOTIFICATION_EMAIL,
      fullName: application.fullName,
      businessName: application.businessName,
      email: application.email,
      phone: application.phone,
      areasCovered: application.areasCovered,
      vanType: application.vanType,
      insuranceConfirmed: application.insuranceConfirmed,
      message: application.message,
      createdAt: application.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Join application notification failed:", error);
    return NextResponse.json(
      {
        error: "Your application was saved, but we could not send the notification email. Please try again shortly.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ applicationId: application.id }, { status: 200 });
}
