import "server-only";

import type { Courier } from "@prisma/client";

import { db } from "@/src/lib/db";

export async function getCourierBySlug(slug: string): Promise<Courier | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  return db.courier.findFirst({
    where: {
      slug: normalizedSlug,
      isActive: true,
    },
  });
}

export async function getFirstActiveCourierSlug(): Promise<string | null> {
  const courier = await db.courier.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { slug: true },
  });

  return courier?.slug ?? null;
}
