import { JobType, type QuoteResult } from "@prisma/client";

export function getBookingJobTypeLabel(jobType: "SAME_DAY" | "DIRECT"): string {
  return jobType === "SAME_DAY" ? "Same Day Delivery" : "Direct Van Delivery (Dedicated)";
}

export function getBookingJobTypeDescription(jobType: "SAME_DAY" | "DIRECT"): string {
  return jobType === "SAME_DAY"
    ? "Urgent collection and delivery completed today."
    : "Dedicated vehicle delivery with no unnecessary stops.";
}

export function getSelectedQuoteResult(
  quoteResults: QuoteResult[],
  jobTypeChosen: "SAME_DAY" | "DIRECT",
): QuoteResult | null {
  return quoteResults.find((result) => result.jobType === jobTypeChosen) ?? null;
}

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function getVanSizeLabel(vanType: "SMALL" | "MEDIUM" | "LARGE"): string {
  const labels: Record<typeof vanType, string> = {
    SMALL: "Small Van",
    MEDIUM: "Medium Van",
    LARGE: "Large Van",
  };

  return labels[vanType];
}

export function formatReadySummary(input: {
  readyMode: "READY_NOW" | "PREBOOK";
  collectionDateTime: Date | null;
}): string {
  if (input.readyMode === "READY_NOW") {
    return "Ready now";
  }

  if (!input.collectionDateTime) {
    return "Pre-book";
  }

  return `Pre-book for ${input.collectionDateTime.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
}

export function parsePrismaDecimal(value: { toString(): string } | number): number {
  if (typeof value === "number") {
    return value;
  }

  return Number(value.toString());
}

export function toPrismaJobType(jobType: "same_day" | "direct"): JobType {
  return jobType === "same_day" ? JobType.SAME_DAY : JobType.DIRECT;
}

