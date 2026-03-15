import { NextResponse } from "next/server";

import { getAuthenticatedCourier, refreshCourierSessionInRoute } from "@/src/lib/courierAuth/session";
import { availabilityUpdateSchema } from "@/src/lib/courierAuth/schemas";
import { db } from "@/src/lib/db";

export async function POST(request: Request) {
  const courier = await getAuthenticatedCourier();
  if (!courier) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = availabilityUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid availability update.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const busyUntil =
    parsed.data.status === "BUSY" && parsed.data.busyUntil
      ? new Date(parsed.data.busyUntil)
      : null;

  const availability = await db.courierAvailability.upsert({
    where: { courierId: courier.id },
    update: {
      status: parsed.data.status,
      busyUntil,
    },
    create: {
      courierId: courier.id,
      status: parsed.data.status,
      busyUntil,
    },
  });

  const response = NextResponse.json({
    status: availability.status,
    busyUntil: availability.busyUntil?.toISOString() ?? null,
  });
  await refreshCourierSessionInRoute(request, response);
  return response;
}
