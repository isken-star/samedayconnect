import { CourierAvailabilityStatus, CourierJobStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedCourier, refreshCourierSessionInRoute } from "@/src/lib/courierAuth/session";
import { db } from "@/src/lib/db";
import { expireStalePendingJobs } from "@/src/lib/courierJobs/expirePending";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const courier = await getAuthenticatedCourier();
  if (!courier) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const params = await context.params;
  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid job id." }, { status: 400 });
  }

  await expireStalePendingJobs(courier.id);
  const now = new Date();
  const defaultBusyUntil = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const result = await db.$transaction(async (tx) => {
    const job = await tx.job.findFirst({
      where: {
        id: parsed.data.id,
        courierId: courier.id,
      },
      select: { id: true, status: true },
    });

    if (!job) {
      return { error: "Job not found.", status: 404 as const };
    }

    if (job.status !== CourierJobStatus.PENDING) {
      return { error: "Only pending jobs can be accepted.", status: 409 as const };
    }

    await tx.job.update({
      where: { id: job.id },
      data: {
        status: CourierJobStatus.ACCEPTED,
        acceptedAt: now,
      },
    });

    await tx.courierAvailability.upsert({
      where: { courierId: courier.id },
      update: {
        status: CourierAvailabilityStatus.BUSY,
        busyUntil: defaultBusyUntil,
      },
      create: {
        courierId: courier.id,
        status: CourierAvailabilityStatus.BUSY,
        busyUntil: defaultBusyUntil,
      },
    });

    return { status: 200 as const };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const response = NextResponse.json({
    ok: true,
    status: CourierJobStatus.ACCEPTED,
    busyUntil: defaultBusyUntil.toISOString(),
  });
  await refreshCourierSessionInRoute(request, response);
  return response;
}
