import "server-only";

import { GoogleDistanceProvider } from "./google";
import type { DistanceProvider } from "./provider";

let distanceProviderInstance: DistanceProvider | null = null;

export function getDistanceProvider(): DistanceProvider {
  if (distanceProviderInstance) {
    return distanceProviderInstance;
  }

  const providerName = process.env.DISTANCE_PROVIDER ?? "google";
  if (providerName !== "google") {
    throw new Error(`Unsupported distance provider: ${providerName}`);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured.");
  }

  distanceProviderInstance = new GoogleDistanceProvider(apiKey);
  return distanceProviderInstance;
}
