import { formatGbp } from "@/src/lib/format/currency";

interface CompletedJobItem {
  id: string;
  collectionPostcode: string;
  deliveryPostcodes: string[];
  completedAt: string | null;
  quotedTotal: number;
}

export function CompletedJobsList({ jobs }: { jobs: CompletedJobItem[] }) {
  return (
    <section className="glass-card space-y-4 rounded-2xl p-4 sm:p-5">
      <h2 className="text-xl font-semibold">Completed history</h2>
      {jobs.length === 0 ? (
        <p className="text-sm text-[var(--text-subtle)]">No completed jobs yet.</p>
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
                {job.completedAt
                  ? `Completed ${new Date(job.completedAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}`
                  : "Completed"}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{formatGbp(job.quotedTotal)}</p>
                <button
                  type="button"
                  className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-medium text-[var(--text-main)]"
                >
                  Request review
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
