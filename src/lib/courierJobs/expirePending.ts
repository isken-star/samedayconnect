import { CourierJobStatus } from "@prisma/client";

import { db } from "@/src/lib/db";

export const PENDING_JOB_EXPIRY_MS = 5 * 60 * 1000;

export async function expireStalePendingJobs(courierId: string) {
  const threshold = new Date(Date.now() - PENDING_JOB_EXPIRY_MS);
  await db.job.updateMany({
    where: {
      courierId,
      status: CourierJobStatus.PENDING,
      createdAt: {
        lt: threshold,
      },
    },
    data: {
      status: CourierJobStatus.EXPIRED,
    },
  });
}
