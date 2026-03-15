"use client";

import { useState } from "react";

type AvailabilityStatus = "AVAILABLE" | "BUSY" | "OFF";

interface AvailabilityPanelProps {
  initialStatus: AvailabilityStatus;
  initialBusyUntil: string | null;
}

function toIsoOffset(minutesFromNow: number): string {
  return new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString();
}

function endOfDayIso(): string {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 0, 0);
  return end.toISOString();
}

export function AvailabilityPanel({ initialStatus, initialBusyUntil }: AvailabilityPanelProps) {
  const [status, setStatus] = useState<AvailabilityStatus>(initialStatus);
  const [busyUntil, setBusyUntil] = useState<string>(initialBusyUntil ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(nextStatus: AvailabilityStatus, nextBusyUntil: string | null) {
    setSaving(true);
    setError(null);
    const response = await fetch("/api/courier/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        busyUntil: nextStatus === "BUSY" ? nextBusyUntil : null,
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | { status?: AvailabilityStatus; busyUntil?: string | null; error?: string }
      | null;

    setSaving(false);
    if (!response.ok || !result?.status) {
      setError(result?.error ?? "Could not save status.");
      return;
    }

    setStatus(result.status);
    setBusyUntil(result.busyUntil ?? "");
    setSaved(true);
  }

  function onChangeStatus(nextStatus: AvailabilityStatus) {
    const nextBusyUntil =
      nextStatus === "BUSY" ? busyUntil || toIsoOffset(120) : null;
    void persist(nextStatus, nextBusyUntil);
  }

  return (
    <section className="glass-card space-y-4 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Availability</h2>
        {saving ? <span className="text-xs text-[var(--text-subtle)]">Saving...</span> : null}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(["AVAILABLE", "BUSY", "OFF"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChangeStatus(item)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              status === item
                ? "border-[var(--border-strong)] bg-[linear-gradient(90deg,rgba(75,183,255,0.14),rgba(255,94,201,0.16))] text-[var(--text-main)]"
                : "border-[var(--border-strong)] bg-[var(--surface-soft)] text-[var(--text-subtle)]"
            }`}
          >
            {item === "AVAILABLE" ? "Available" : item === "BUSY" ? "Busy" : "Off"}
          </button>
        ))}
      </div>

      {status === "BUSY" ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--text-main)]">Busy until</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "30m", value: toIsoOffset(30) },
              { label: "1h", value: toIsoOffset(60) },
              { label: "2h", value: toIsoOffset(120) },
              { label: "End of day", value: endOfDayIso() },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => void persist("BUSY", preset.value)}
                className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] px-3 py-1.5 text-sm text-[var(--text-main)]"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <label className="block space-y-1">
            <span className="text-xs text-[var(--text-subtle)]">Custom time</span>
            <input
              type="datetime-local"
              className="app-input px-3 py-2 text-sm"
              value={busyUntil ? new Date(busyUntil).toISOString().slice(0, 16) : ""}
              onChange={(event) => {
                const value = event.target.value ? new Date(event.target.value).toISOString() : "";
                setBusyUntil(value);
              }}
              onBlur={() => {
                if (busyUntil) {
                  void persist("BUSY", busyUntil);
                }
              }}
            />
          </label>
        </div>
      ) : null}

      {error ? <p className="status-error text-sm">{error}</p> : null}
      {saved ? <p className="text-xs text-[var(--success-text)]">Saved</p> : null}
    </section>
  );
}
