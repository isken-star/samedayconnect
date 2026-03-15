import { CourierJobStatus } from "@prisma/client";
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

  const job = await db.job.findFirst({
    where: {
      id: parsed.data.id,
      courierId: courier.id,
    },
    select: { id: true, status: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  if (job.status !== CourierJobStatus.PENDING) {
    return NextResponse.json({ error: "Only pending jobs can be declined." }, { status: 409 });
  }

  await db.job.update({
    where: { id: job.id },
    data: { status: CourierJobStatus.DECLINED },
  });

  const response = NextResponse.json({ ok: true, status: CourierJobStatus.DECLINED });
  await refreshCourierSessionInRoute(request, response);
  return response;
}
