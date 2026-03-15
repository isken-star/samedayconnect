import { formatGbp } from "@/src/lib/format/currency";

interface UpcomingJobItem {
  id: string;
  collectionPostcode: string;
  deliveryPostcodes: string[];
  readyAt: string | null;
  quotedTotal: number;
}

export function UpcomingJobsList({ jobs }: { jobs: UpcomingJobItem[] }) {
  return (
    <section className="glass-card space-y-4 rounded-2xl p-4 sm:p-5">
      <h2 className="text-xl font-semibold">Upcoming jobs</h2>
      {jobs.length === 0 ? (
        <p className="text-sm text-[var(--text-subtle)]">No upcoming jobs yet.</p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3"
            >
              <p className="font-medium text-[var(--text-main)]">
                {job.collectionPostcode} → {job.deliveryPostcodes[0] ?? "N/A"}
              </p>
              <p className="mt-1 text-sm text-[var(--text-subtle)]">
                {job.readyAt
                  ? new Date(job.readyAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Ready now"}
              </p>
              <p className="mt-1 text-sm font-semibold">{formatGbp(job.quotedTotal)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
