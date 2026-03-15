import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { extractCourierSlugFromHost, normalizeHost } from "@/src/lib/domain";

import { getCourierBySlug } from "./getCourierBySlug";

export const getCurrentCourierContext = cache(async () => {
  const headerStore = await headers();
  const requestHost =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "";

  const courierSlug =
    headerStore.get("x-courier-slug")?.trim().toLowerCase() ??
    extractCourierSlugFromHost(requestHost);

  const courier = courierSlug ? await getCourierBySlug(courierSlug) : null;

  return {
    host: normalizeHost(requestHost),
    courierSlug: courierSlug ?? null,
    courier,
  };
});

