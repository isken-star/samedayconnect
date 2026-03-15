import { CourierJobStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { getAuthenticatedCourier } from "@/src/lib/courierAuth/session";
import { db } from "@/src/lib/db";
import { expireStalePendingJobs } from "@/src/lib/courierJobs/expirePending";
import { AvailabilityPanel } from "@/src/components/courier/dashboard/AvailabilityPanel";
import { PendingRequestsList } from "@/src/components/courier/dashboard/PendingRequestsList";
import { UpcomingJobsList } from "@/src/components/courier/dashboard/UpcomingJobsList";
import { CompletedJobsList } from "@/src/components/courier/dashboard/CompletedJobsList";

export default async function CourierDashboardPage() {
  const courier = await getAuthenticatedCourier();
  if (!courier) {
    redirect("/courier/login");
  }

  await expireStalePendingJobs(courier.id);
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [availability, pendingJobs, upcomingJobs, completedJobs] = await Promise.all([
    db.courierAvailability.findUnique({
      where: { courierId: courier.id },
    }),
    db.job.findMany({
      where: {
        courierId: courier.id,
        status: CourierJobStatus.PENDING,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.job.findMany({
      where: {
        courierId: courier.id,
        status: CourierJobStatus.ACCEPTED,
        OR: [
          { readyAt: null },
          {
            readyAt: {
              gte: now,
              lte: nextWeek,
            },
          },
        ],
      },
      orderBy: { readyAt: "asc" },
      take: 20,
    }),
    db.job.findMany({
      where: {
        courierId: courier.id,
        status: CourierJobStatus.COMPLETED,
      },
      orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
      take: 30,
    }),
  ]);

  return (
    <div className="space-y-6">
      <AvailabilityPanel
        initialStatus={availability?.status ?? "AVAILABLE"}
        initialBusyUntil={availability?.busyUntil?.toISOString() ?? null}
      />

      <PendingRequestsList
        jobs={pendingJobs.map((job) => ({
          id: job.id,
          collectionPostcode: job.collectionPostcode,
          deliveryPostcodes: job.deliveryPostcodes,
          vanType: job.vanType,
          jobType: job.jobType,
          readyAt: job.readyAt?.toISOString() ?? null,
          quotedTotal: Number(job.quotedTotal),
        }))}
      />

      <UpcomingJobsList
        jobs={upcomingJobs.map((job) => ({
          id: job.id,
          collectionPostcode: job.collectionPostcode,
          deliveryPostcodes: job.deliveryPostcodes,
          readyAt: job.readyAt?.toISOString() ?? null,
          quotedTotal: Number(job.quotedTotal),
        }))}
      />

      <CompletedJobsList
        jobs={completedJobs.map((job) => ({
          id: job.id,
          collectionPostcode: job.collectionPostcode,
          deliveryPostcodes: job.deliveryPostcodes,
          completedAt: job.completedAt?.toISOString() ?? null,
          quotedTotal: Number(job.quotedTotal),
        }))}
      />
    </div>
  );
}
