"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatGbp } from "@/src/lib/format/currency";

interface PendingJobItem {
  id: string;
  collectionPostcode: string;
  deliveryPostcodes: string[];
  vanType: "SMALL" | "MEDIUM" | "LARGE";
  jobType: "SAME_DAY" | "DIRECT";
  readyAt: string | null;
  quotedTotal: number;
}

function getRouteLabel(job: PendingJobItem): string {
  const firstDelivery = job.deliveryPostcodes[0] ?? "N/A";
  const extraStops = Math.max(0, job.deliveryPostcodes.length - 1);
  return `${job.collectionPostcode} → ${firstDelivery}${extraStops > 0 ? ` +${extraStops} stops` : ""}`;
}

export function PendingRequestsList({ jobs }: { jobs: PendingJobItem[] }) {
  const router = useRouter();
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(jobId: string, action: "accept" | "decline") {
    setBusyJobId(jobId);
    setError(null);
    const response = await fetch(`/api/courier/jobs/${jobId}/${action}`, { method: "POST" });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    setBusyJobId(null);
    if (!response.ok) {
      setError(result?.error ?? "Could not update this request.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="glass-card space-y-4 rounded-2xl p-4 sm:p-5">
      <h2 className="text-xl font-semibold">Pending requests</h2>
      {jobs.length === 0 ? (
        <p className="text-sm text-[var(--text-subtle)]">No pending requests right now.</p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => {
            const isBusy = busyJobId === job.id;
            return (
              <li
                key={job.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3"
              >
                <p className="font-medium text-[var(--text-main)]">{getRouteLabel(job)}</p>
                <p className="mt-1 text-sm text-[var(--text-subtle)]">
                  {job.vanType} • {job.jobType === "SAME_DAY" ? "Same Day" : "Direct"} •{" "}
                  {job.readyAt
                    ? `Ready ${new Date(job.readyAt).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}`
                    : "Ready now"}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-main)]">
                  {formatGbp(job.quotedTotal)}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void runAction(job.id, "accept")}
                    className="rounded-lg bg-[linear-gradient(to_right,rgba(67,211,137,0.94),rgba(16,185,129,0.94))] px-3 py-1.5 text-sm font-medium text-[var(--text-inverse)] shadow-[0_0_18px_rgba(34,197,94,0.18)] disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void runAction(job.id, "decline")}
                    className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] px-3 py-1.5 text-sm font-medium text-[var(--text-main)] disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {error ? <p className="status-error text-sm">{error}</p> : null}
    </section>
  );
}
