"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus, Trash2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { saveRecentQuote } from "@/src/lib/recentQuotes";
import type { QuoteApiResponse, QuoteRequestPayload } from "@/src/lib/quote/types";

type ReadyMode = "ready_now" | "prebook";
type VanSize = "small" | "medium" | "large";
type JobType = "same_day" | "direct";

const VAN_OPTIONS: Array<{ value: VanSize; title: string; payload: string }> = [
  { value: "small", title: "Small Van", payload: "Up to 400kg payload" },
  { value: "medium", title: "Medium Van", payload: "Up to 800kg payload" },
  { value: "large", title: "Large Van", payload: "Up to 1100kg payload" },
];

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;
const QUOTE_FORM_BASE_CLASS = "quote-widget-card";
const QUOTE_FIELD_CLASS =
  "app-input px-3 py-2";
const QUOTE_TOGGLE_ACTIVE_CLASS =
  "border-[var(--border-strong)] bg-[linear-gradient(to_right,var(--headline-gradient-from),var(--headline-gradient-to))] text-[var(--text-inverse)] shadow-[0_0_18px_rgba(236,72,153,0.22)]";
const QUOTE_TOGGLE_INACTIVE_CLASS = "border-[var(--border-strong)] bg-[var(--surface-soft)] text-[var(--text-main)]";
const QUOTE_POPOVER_TRIGGER_CLASS =
  "app-input flex w-full items-center justify-between px-3 py-2 text-left";
const QUOTE_POPOVER_CLASS =
  "absolute z-30 mt-2 w-full min-w-[18rem] rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-card)] p-3 shadow-[0_16px_50px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:min-w-[20rem]";

function parseDateValue(value: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function formatDateValue(value: string): string {
  const parsed = parseDateValue(value);
  if (!parsed) {
    return "Select date";
  }
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTimeValue(value: string): string {
  if (!value) {
    return "Select time";
  }
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return "Select time";
  }
  const base = new Date();
  base.setHours(hours, minutes, 0, 0);
  return base.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function roundUpToQuarterHour(date: Date): Date {
  const next = new Date(date);
  const minutes = next.getMinutes();
  const rounded = Math.ceil(minutes / 15) * 15;
  next.setMinutes(rounded, 0, 0);
  return next;
}

interface QuoteWidgetProps {
  courierId?: string;
  trustChips?: readonly string[];
  ctaMicrocopy?: string;
  cardClassName?: string;
  initialValues?: QuoteWidgetInitialValues;
  autoSubmitNonce?: number;
  onQuoteSubmitted?: (submittedPayload: QuoteRequestPayload, submissionId: string) => void;
  onQuoteCalculated?: (
    response: QuoteApiResponse,
    submittedPayload: QuoteRequestPayload,
    submissionId: string,
  ) => void;
  onQuoteError?: (message: string, submissionId: string) => void;
}

export interface QuoteWidgetInitialValues {
  collectionPostcode: string;
  deliveryPostcodes: string[];
  readyMode: ReadyMode;
  collectionDate?: string;
  readyTime?: string;
  vanSize: VanSize;
  jobType: JobType;
}

export function QuoteWidget({
  courierId,
  trustChips,
  ctaMicrocopy,
  cardClassName,
  initialValues,
  autoSubmitNonce,
  onQuoteSubmitted,
  onQuoteCalculated,
  onQuoteError,
}: QuoteWidgetProps = {}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const datePopoverRef = useRef<HTMLDivElement>(null);
  const timePopoverRef = useRef<HTMLDivElement>(null);
  const [collectionPostcode, setCollectionPostcode] = useState(initialValues?.collectionPostcode ?? "");
  const [deliveryPostcodes, setDeliveryPostcodes] = useState<string[]>(
    initialValues?.deliveryPostcodes.length ? initialValues.deliveryPostcodes : [""],
  );
  const [readyMode, setReadyMode] = useState<ReadyMode>(initialValues?.readyMode ?? "ready_now");
  const [collectionDate, setCollectionDate] = useState(initialValues?.collectionDate ?? "");
  const [readyTime, setReadyTime] = useState(initialValues?.readyTime ?? "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => {
    const parsed = parseDateValue(initialValues?.collectionDate ?? "");
    return parsed ? new Date(parsed.getFullYear(), parsed.getMonth(), 1) : new Date();
  });
  const [vanSize, setVanSize] = useState<VanSize>(initialValues?.vanSize ?? "medium");
  const [jobType, setJobType] = useState<JobType>(initialValues?.jobType ?? "same_day");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAddStop = deliveryPostcodes.length < 10;
  const submitDisabled = useMemo(() => {
    if (submitting) {
      return true;
    }

    if (!collectionPostcode.trim()) {
      return true;
    }

    if (deliveryPostcodes.some((postcode) => !postcode.trim())) {
      return true;
    }

    if (readyMode === "prebook" && (!collectionDate || !readyTime)) {
      return true;
    }

    return false;
  }, [collectionDate, collectionPostcode, deliveryPostcodes, readyMode, readyTime, submitting]);

  const timeOptions = useMemo(() => {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 15) {
        options.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      }
    }
    return options;
  }, []);

  const monthMeta = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const mondayStartIndex = (firstDay.getDay() + 6) % 7;
    const selected = parseDateValue(collectionDate);

    const cells = Array.from({ length: 42 }, (_, index) => {
      const day = index - mondayStartIndex + 1;
      if (day < 1 || day > daysInMonth) {
        return null;
      }
      const date = new Date(year, month, day);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}`;
      const isSelected =
        !!selected &&
        selected.getFullYear() === date.getFullYear() &&
        selected.getMonth() === date.getMonth() &&
        selected.getDate() === date.getDate();
      const isToday = new Date().toDateString() === date.toDateString();
      return { label: day, value, isSelected, isToday };
    });

    return {
      monthLabel: visibleMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      cells,
    };
  }, [visibleMonth, collectionDate]);

  useEffect(() => {
    if (autoSubmitNonce === undefined || autoSubmitNonce === 0) {
      return;
    }

    formRef.current?.requestSubmit();
  }, [autoSubmitNonce]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (showDatePicker && datePopoverRef.current && !datePopoverRef.current.contains(target)) {
        setShowDatePicker(false);
      }
      if (showTimePicker && timePopoverRef.current && !timePopoverRef.current.contains(target)) {
        setShowTimePicker(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowDatePicker(false);
        setShowTimePicker(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showDatePicker, showTimePicker]);

  function updateDeliveryPostcode(index: number, value: string) {
    setDeliveryPostcodes((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const submissionId = crypto.randomUUID();

    const payload: QuoteRequestPayload = {
      courier_id: courierId,
      collection_postcode: collectionPostcode,
      delivery_postcodes: deliveryPostcodes,
      van_size: vanSize,
      job_type: jobType,
      ready_mode: readyMode,
      collection_date: readyMode === "prebook" ? collectionDate : undefined,
      ready_time: readyMode === "prebook" ? readyTime : undefined,
    };
    onQuoteSubmitted?.(payload, submissionId);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as (QuoteApiResponse & { error?: string }) | null;

      setSubmitting(false);
      if (!response.ok || !result?.quoteRequestId) {
        const message = result?.error ?? "We couldn’t create your quote. Please try again.";
        setError(message);
        onQuoteError?.(message, submissionId);
        return;
      }

      saveRecentQuote({
        id: submissionId,
        collectionPostcode: result.collectionPostcode,
        deliveryPostcodes: result.deliveryPostcodes,
        vanType: payload.van_size,
        readyMode: payload.ready_mode,
        collectionDate: payload.collection_date,
        readyTime: payload.ready_time,
        calculatedAt: new Date().toISOString(),
        quoteRequestId: result.quoteRequestId,
        selectedJobType: payload.job_type,
        totals: {
          same_day: result.options.same_day.total,
          direct: result.options.direct.total,
        },
      });

      if (onQuoteCalculated) {
        onQuoteCalculated(result, payload, submissionId);
        return;
      }

      router.push(`/quote/${encodeURIComponent(result.quoteRequestId)}`);
    } catch {
      setSubmitting(false);
      const message = "We couldn’t create your quote. Please try again.";
      setError(message);
      onQuoteError?.(message, submissionId);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={`${QUOTE_FORM_BASE_CLASS} space-y-6 ${cardClassName ?? ""}`.trim()}
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--text-main)]">Collection postcode</label>
        <input
          value={collectionPostcode}
          onChange={(event) => setCollectionPostcode(event.target.value)}
          className={QUOTE_FIELD_CLASS}
          placeholder="e.g. SW1A 1AA"
          required
        />
      </div>

      <div className="space-y-3">
        {deliveryPostcodes.map((postcode, index) => (
          <div key={`delivery-${index}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[var(--text-main)]">
                {index === 0 ? "Delivery postcode" : `Delivery stop ${index + 1}`}
              </label>
              {index > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    setDeliveryPostcodes((current) => current.filter((_, itemIndex) => itemIndex !== index))
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-2 py-1 text-xs text-[var(--text-subtle)] hover:bg-[var(--chip-bg)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              ) : null}
            </div>
            <input
              value={postcode}
              onChange={(event) => updateDeliveryPostcode(index, event.target.value)}
              className={QUOTE_FIELD_CLASS}
              placeholder="e.g. M1 1AE"
              required
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            if (!canAddStop) {
              setError("For more than 10 stops, please contact us.");
              return;
            }
            setDeliveryPostcodes((current) => [...current, ""]);
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4"
        >
          <Plus className="h-4 w-4" />
          + Add another stop
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--text-main)]">Ready now / Pre-book</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setReadyMode("ready_now");
              setShowDatePicker(false);
              setShowTimePicker(false);
            }}
            className={`rounded-xl border px-3 py-2 text-sm ${
              readyMode === "ready_now"
                ? QUOTE_TOGGLE_ACTIVE_CLASS
                : QUOTE_TOGGLE_INACTIVE_CLASS
            }`}
          >
            Ready now
          </button>
          <button
            type="button"
            onClick={() => setReadyMode("prebook")}
            className={`rounded-xl border px-3 py-2 text-sm ${
              readyMode === "prebook"
                ? QUOTE_TOGGLE_ACTIVE_CLASS
                : QUOTE_TOGGLE_INACTIVE_CLASS
            }`}
          >
            Pre-book
          </button>
        </div>
      </div>

      {readyMode === "prebook" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative space-y-2" ref={datePopoverRef}>
            <label className="block text-sm font-medium text-[var(--text-main)]">Collection date</label>
            <button
              type="button"
              onClick={() => {
                const selected = parseDateValue(collectionDate);
                setVisibleMonth(selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date());
                setShowTimePicker(false);
                setShowDatePicker((current) => !current);
              }}
              className={QUOTE_POPOVER_TRIGGER_CLASS}
              aria-haspopup="dialog"
              aria-expanded={showDatePicker}
            >
              <span>{formatDateValue(collectionDate)}</span>
              <CalendarDays className="h-4 w-4 text-[var(--accent-soft)]" />
            </button>

            {showDatePicker ? (
              <div className={QUOTE_POPOVER_CLASS}>
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                      )
                    }
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-1.5"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <p className="text-sm font-semibold">{monthMeta.monthLabel}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                      )
                    }
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-1.5"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--text-subtle)]">
                  {DAY_LABELS.map((day) => (
                    <span key={day} className="py-1 font-medium">
                      {day}
                    </span>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {monthMeta.cells.map((cell, index) =>
                    cell ? (
                      <button
                        key={cell.value}
                        type="button"
                        onClick={() => {
                          setCollectionDate(cell.value);
                          setShowDatePicker(false);
                        }}
                        className={`rounded-lg px-2 py-2 text-sm transition ${
                          cell.isSelected
                            ? "bg-[linear-gradient(to_right,var(--headline-gradient-from),var(--headline-gradient-to))] text-[var(--text-inverse)]"
                            : cell.isToday
                              ? "border border-[var(--border-strong)] text-[var(--text-main)]"
                              : "text-[var(--text-main)] hover:bg-[var(--chip-bg)]"
                        }`}
                      >
                        {cell.label}
                      </button>
                    ) : (
                      <span key={`empty-${index}`} />
                    ),
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <div className="relative space-y-2" ref={timePopoverRef}>
            <label className="block text-sm font-medium text-[var(--text-main)]">Ready time</label>
            <button
              type="button"
              onClick={() => {
                setShowDatePicker(false);
                setShowTimePicker((current) => !current);
              }}
              className={QUOTE_POPOVER_TRIGGER_CLASS}
              aria-haspopup="dialog"
              aria-expanded={showTimePicker}
            >
              <span>{formatTimeValue(readyTime)}</span>
              <Clock3 className="h-4 w-4 text-[var(--accent-soft)]" />
            </button>

            {showTimePicker ? (
              <div className={QUOTE_POPOVER_CLASS}>
                <div className="mb-3 flex flex-wrap gap-2">
                  {[
                    { label: "Now +30m", value: null as string | null },
                    { label: "09:00", value: "09:00" as string | null },
                    { label: "12:00", value: "12:00" as string | null },
                    { label: "15:00", value: "15:00" as string | null },
                    { label: "18:00", value: "18:00" as string | null },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        if (preset.value) {
                          setReadyTime(preset.value);
                        } else {
                          const next = roundUpToQuarterHour(new Date(Date.now() + 30 * 60 * 1000));
                          const nextValue = `${String(next.getHours()).padStart(2, "0")}:${String(
                            next.getMinutes(),
                          ).padStart(2, "0")}`;
                          setReadyTime(nextValue);
                        }
                        setShowTimePicker(false);
                      }}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-main)]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-1">
                  <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
                    {timeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setReadyTime(option);
                          setShowTimePicker(false);
                        }}
                        className={`rounded-md px-2 py-1.5 text-sm ${
                          readyTime === option
                            ? "bg-[linear-gradient(to_right,var(--headline-gradient-from),var(--headline-gradient-to))] text-[var(--text-inverse)]"
                            : "text-[var(--text-main)] hover:bg-[var(--chip-bg)]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--text-main)]">Vehicle size</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {VAN_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setVanSize(option.value)}
              className={`rounded-2xl border p-3 text-left transition ${
                vanSize === option.value
                  ? "border-[var(--border-strong)] bg-[linear-gradient(90deg,rgba(75,183,255,0.14),rgba(255,94,201,0.16))] text-[var(--text-main)] shadow-[0_0_0_1px_rgba(94,135,255,0.12)]"
                  : QUOTE_TOGGLE_INACTIVE_CLASS
              }`}
            >
              <p className="font-semibold">{option.title}</p>
              <p className="text-sm text-[var(--text-subtle)]">
                {option.payload}
              </p>
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--text-subtle)]">
          A larger van can carry smaller loads too — choose the size you need for your items.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--text-main)]">Service type</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setJobType("same_day")}
              className={`rounded-2xl border p-3 text-left transition ${
              jobType === "same_day"
                ? "border-[var(--border-strong)] bg-[linear-gradient(90deg,rgba(75,183,255,0.14),rgba(255,94,201,0.16))] text-[var(--text-main)] shadow-[0_0_0_1px_rgba(94,135,255,0.12)]"
                : QUOTE_TOGGLE_INACTIVE_CLASS
            }`}
          >
            <p className="font-semibold">Same Day Delivery</p>
            <p className="text-sm text-[var(--text-subtle)]">
              Collected today, delivered today.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setJobType("direct")}
            className={`rounded-2xl border p-3 text-left transition ${
              jobType === "direct"
                ? "border-[var(--border-strong)] bg-[linear-gradient(90deg,rgba(75,183,255,0.14),rgba(255,94,201,0.16))] text-[var(--text-main)] shadow-[0_0_0_1px_rgba(94,135,255,0.12)]"
                : QUOTE_TOGGLE_INACTIVE_CLASS
            }`}
          >
            <p className="font-semibold">Direct Van Delivery — Fastest</p>
            <p className="text-sm text-[var(--text-subtle)]">
              Straight from collection to delivery. No other stops.
            </p>
          </button>
        </div>
      </div>

      {trustChips && trustChips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {trustChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-medium text-[var(--text-main)]"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}

      {error ? <p className="status-error text-sm">{error}</p> : null}

      <button
        type="submit"
        disabled={submitDisabled}
        className="gradient-button inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Zap className="h-4 w-4" />
        {submitting ? "Calculating..." : "Get Quote"}
      </button>

      {ctaMicrocopy ? <p className="text-sm text-[var(--text-subtle)]">{ctaMicrocopy}</p> : null}
    </form>
  );
}
