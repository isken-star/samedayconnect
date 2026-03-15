export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteDistanceResult {
  totalMeters: number;
}

export interface DistanceProvider {
  getRouteDistance(postcodes: string[]): Promise<RouteDistanceResult>;
  geocodePostcode(postcode: string): Promise<Coordinates | null>;
}
