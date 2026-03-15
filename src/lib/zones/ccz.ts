import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon, multiPolygon } from "@turf/helpers";

import cczGeoJson from "./ccz.json";
import { normalizeUkPostcode } from "../postcode/uk";

type PolygonCoordinates = number[][][];
type MultiPolygonCoordinates = number[][][][];

const cczPostcodeFallbackPrefixes = new Set<string>([
  "EC1",
  "EC2",
  "EC3",
  "EC4",
  "WC1",
  "WC2",
  "SW1",
  "SE1",
  "W1",
]);

function getOutwardCode(postcode: string): string {
  const normalized = normalizeUkPostcode(postcode);
  return normalized.split(" ")[0] ?? normalized;
}

function getPolygonCoordinatesFromGeoJson(): {
  polygons: PolygonCoordinates[];
  multipolygons: MultiPolygonCoordinates[];
} {
  const polygons: PolygonCoordinates[] = [];
  const multipolygons: MultiPolygonCoordinates[] = [];
  const featureCollection = cczGeoJson as {
    type?: string;
    features?: Array<{
      geometry?: {
        type?: string;
        coordinates?: unknown;
      };
    }>;
  };

  if (featureCollection.type !== "FeatureCollection" || !Array.isArray(featureCollection.features)) {
    return { polygons, multipolygons };
  }

  for (const feature of featureCollection.features) {
    if (feature.geometry?.type === "Polygon" && Array.isArray(feature.geometry.coordinates)) {
      polygons.push(feature.geometry.coordinates as PolygonCoordinates);
    }

    if (feature.geometry?.type === "MultiPolygon" && Array.isArray(feature.geometry.coordinates)) {
      multipolygons.push(feature.geometry.coordinates as MultiPolygonCoordinates);
    }
  }

  return { polygons, multipolygons };
}

export function isInCongestionZone(lat: number, lng: number): boolean {
  const location = point([lng, lat]);
  const { polygons, multipolygons } = getPolygonCoordinatesFromGeoJson();

  // TODO: replace placeholder ccz.geojson with official CCZ boundary polygon.
  if (polygons.length === 0 && multipolygons.length === 0) {
    return false;
  }

  for (const poly of polygons) {
    if (booleanPointInPolygon(location, polygon(poly))) {
      return true;
    }
  }

  for (const multi of multipolygons) {
    if (booleanPointInPolygon(location, multiPolygon(multi))) {
      return true;
    }
  }

  return false;
}

export function isPostcodeLikelyInCongestionZone(postcode: string): boolean {
  const outward = getOutwardCode(postcode);
  for (const prefix of cczPostcodeFallbackPrefixes) {
    if (outward.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

export function isStopInCongestionZone(stop: {
  postcode: string;
  coordinates: { lat: number; lng: number } | null;
}): boolean {
  if (stop.coordinates) {
    return isInCongestionZone(stop.coordinates.lat, stop.coordinates.lng);
  }

  return isPostcodeLikelyInCongestionZone(stop.postcode);
}
