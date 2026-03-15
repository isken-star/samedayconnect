import "server-only";

import type { Courier } from "@prisma/client";

import { db } from "@/src/lib/db";

export const COURIER_IMAGE_FALLBACKS = {
  profile: "/couriers/placeholders/profile.svg",
  van: "/couriers/placeholders/van.svg",
} as const;

export async function getActiveCourier(): Promise<Courier | null> {
  return db.courier.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export function resolveCourierImage(
  src: string | null | undefined,
  fallback: string,
): string {
  if (!src) {
    return fallback;
  }

  // Keep rendering deterministic and avoid remote host config coupling.
  if (src.startsWith("/")) {
    return src;
  }

  return fallback;
}
