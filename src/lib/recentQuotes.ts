import type { QuoteJobType, VanSize } from "@/src/lib/pricing/config";
import type { ReadyMode } from "@/src/lib/quote/types";

const STORAGE_KEY = "cc_recent_quotes_v2";
const MAX_RECENT_QUOTES = 10;

export interface RecentQuoteItem {
  id: string;
  collectionPostcode: string;
  deliveryPostcodes: string[];
  vanType: VanSize;
  readyMode: ReadyMode;
  collectionDate?: string;
  readyTime?: string;
  calculatedAt: string;
  quoteRequestId?: string;
  selectedJobType?: QuoteJobType;
  totals?: {
    same_day?: number;
    direct?: number;
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function parseStoredItems(raw: string | null): RecentQuoteItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is RecentQuoteItem => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const maybe = item as Partial<RecentQuoteItem>;
      return (
        typeof maybe.id === "string" &&
        typeof maybe.collectionPostcode === "string" &&
        Array.isArray(maybe.deliveryPostcodes) &&
        typeof maybe.vanType === "string" &&
        typeof maybe.readyMode === "string" &&
        typeof maybe.calculatedAt === "string"
      );
    });
  } catch {
    return [];
  }
}

function writeItems(items: RecentQuoteItem[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function dedupeAndClamp(items: RecentQuoteItem[]): RecentQuoteItem[] {
  const seen = new Set<string>();
  const unique: RecentQuoteItem[] = [];

  for (const item of items) {
    const key = item.id || item.quoteRequestId;
    if (key && seen.has(key)) {
      continue;
    }
    if (key) {
      seen.add(key);
    }
    unique.push(item);
    if (unique.length >= MAX_RECENT_QUOTES) {
      break;
    }
  }

  return unique;
}

export function loadRecentQuotes(): RecentQuoteItem[] {
  if (!canUseStorage()) {
    return [];
  }

  return parseStoredItems(window.localStorage.getItem(STORAGE_KEY));
}

export function saveRecentQuote(item: RecentQuoteItem): RecentQuoteItem[] {
  const current = loadRecentQuotes();
  const next = dedupeAndClamp([
    item,
    ...current.filter(
      (entry) => entry.id !== item.id && (!item.quoteRequestId || entry.quoteRequestId !== item.quoteRequestId),
    ),
  ]);
  writeItems(next);
  return next;
}

export function updateRecentQuote(item: RecentQuoteItem): RecentQuoteItem[] {
  const current = loadRecentQuotes();
  const existingIndex = current.findIndex((entry) => entry.id === item.id);

  if (existingIndex === -1) {
    return saveRecentQuote(item);
  }

  const next = [...current];
  next[existingIndex] = item;
  next.sort((a, b) => Date.parse(b.calculatedAt) - Date.parse(a.calculatedAt));
  const normalized = dedupeAndClamp(next);
  writeItems(normalized);
  return normalized;
}

export function removeRecentQuote(id: string): RecentQuoteItem[] {
  const next = loadRecentQuotes().filter((item) => item.id !== id);
  writeItems(next);
  return next;
}

export function clearRecentQuotes(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function getRecentQuotesStorageKey(): string {
  return STORAGE_KEY;
}
