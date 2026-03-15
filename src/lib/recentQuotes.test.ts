import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearRecentQuotes,
  getRecentQuotesStorageKey,
  loadRecentQuotes,
  removeRecentQuote,
  saveRecentQuote,
  updateRecentQuote,
  type RecentQuoteItem,
} from "./recentQuotes";

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

function makeItem(overrides: Partial<RecentQuoteItem> = {}): RecentQuoteItem {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    collectionPostcode: overrides.collectionPostcode ?? "SW1A 1AA",
    deliveryPostcodes: overrides.deliveryPostcodes ?? ["M1 1AE"],
    vanType: overrides.vanType ?? "medium",
    readyMode: overrides.readyMode ?? "ready_now",
    calculatedAt: overrides.calculatedAt ?? "2026-03-08T10:00:00.000Z",
    quoteRequestId: overrides.quoteRequestId,
    selectedJobType: overrides.selectedJobType ?? "same_day",
    totals: overrides.totals ?? { same_day: 50, direct: 65 },
    collectionDate: overrides.collectionDate,
    readyTime: overrides.readyTime,
  };
}

describe("recentQuotes storage", () => {
  const storageKey = getRecentQuotesStorageKey();
  const localStorage = new MemoryStorage();

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("window", { localStorage });
  });

  it("parses valid storage", () => {
    const seeded = [makeItem({ id: "a" }), makeItem({ id: "b" })];
    localStorage.setItem(storageKey, JSON.stringify(seeded));

    expect(loadRecentQuotes()).toEqual(seeded);
  });

  it("handles malformed JSON gracefully", () => {
    localStorage.setItem(storageKey, "{not-json");
    expect(loadRecentQuotes()).toEqual([]);
  });

  it("saves newest first", () => {
    const older = makeItem({ id: "older" });
    saveRecentQuote(older);
    const newer = makeItem({ id: "newer" });
    saveRecentQuote(newer);

    const loaded = loadRecentQuotes();
    expect(loaded[0]?.id).toBe("newer");
    expect(loaded[1]?.id).toBe("older");
  });

  it("enforces max 10 items", () => {
    for (let index = 0; index < 12; index += 1) {
      saveRecentQuote(makeItem({ id: `item-${index}` }));
    }

    const loaded = loadRecentQuotes();
    expect(loaded).toHaveLength(10);
    expect(loaded[0]?.id).toBe("item-11");
    expect(loaded[9]?.id).toBe("item-2");
  });

  it("updates an existing entry and keeps newest ordering", () => {
    const one = makeItem({ id: "one", calculatedAt: "2026-03-08T08:00:00.000Z" });
    const two = makeItem({ id: "two", calculatedAt: "2026-03-08T09:00:00.000Z" });
    saveRecentQuote(one);
    saveRecentQuote(two);

    updateRecentQuote({
      ...one,
      totals: { same_day: 99, direct: 120 },
      calculatedAt: "2026-03-08T12:00:00.000Z",
    });

    const loaded = loadRecentQuotes();
    expect(loaded[0]?.id).toBe("one");
    expect(loaded[0]?.totals?.same_day).toBe(99);
  });

  it("removes and clears entries", () => {
    saveRecentQuote(makeItem({ id: "remove-me" }));
    saveRecentQuote(makeItem({ id: "keep-me" }));

    const afterRemove = removeRecentQuote("remove-me");
    expect(afterRemove.map((item) => item.id)).toEqual(["keep-me"]);

    clearRecentQuotes();
    expect(loadRecentQuotes()).toEqual([]);
  });
});
