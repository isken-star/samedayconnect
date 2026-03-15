import "server-only";

import type { Coordinates, DistanceProvider, RouteDistanceResult } from "./provider";

const DIRECTIONS_BASE_URL = "https://maps.googleapis.com/maps/api/directions/json";
const GEOCODE_BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

export class GoogleDistanceProvider implements DistanceProvider {
  constructor(private readonly apiKey: string) {}

  async getRouteDistance(postcodes: string[]): Promise<RouteDistanceResult> {
    if (postcodes.length < 2) {
      throw new Error("At least two postcodes are required to build a route.");
    }

    const origin = postcodes[0];
    const destination = postcodes[postcodes.length - 1];
    const waypointStops = postcodes.slice(1, -1);
    const params = new URLSearchParams({
      origin,
      destination,
      units: "metric",
      key: this.apiKey,
      region: "uk",
    });

    if (waypointStops.length > 0) {
      params.set("waypoints", waypointStops.join("|"));
    }

    const response = await fetch(`${DIRECTIONS_BASE_URL}?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Google Directions API request failed.");
    }

    const json = (await response.json()) as {
      status: string;
      routes?: Array<{
        legs?: Array<{
          distance?: { value?: number };
        }>;
      }>;
    };

    if (json.status !== "OK" || !json.routes?.[0]?.legs?.length) {
      throw new Error("Google Directions API could not calculate this route.");
    }

    const totalMeters = json.routes[0].legs.reduce((sum, leg) => {
      return sum + (leg.distance?.value ?? 0);
    }, 0);

    if (totalMeters <= 0) {
      throw new Error("Google Directions API returned an invalid route distance.");
    }

    return { totalMeters };
  }

  async geocodePostcode(postcode: string): Promise<Coordinates | null> {
    const params = new URLSearchParams({
      address: postcode,
      components: "country:GB",
      key: this.apiKey,
      region: "uk",
    });

    const response = await fetch(`${GEOCODE_BASE_URL}?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Google Geocoding API request failed.");
    }

    const json = (await response.json()) as {
      status: string;
      results?: Array<{
        geometry?: {
          location?: Coordinates;
        };
      }>;
    };

    if (json.status === "ZERO_RESULTS") {
      return null;
    }

    const location = json.results?.[0]?.geometry?.location;
    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      throw new Error("Google Geocoding API returned invalid coordinates.");
    }

    return location;
  }
}
