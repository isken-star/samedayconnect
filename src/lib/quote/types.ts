import type { QuoteJobType, VanSize } from "../pricing/config";
import type { QuoteBreakdown } from "../pricing/calc";

export type ReadyMode = "ready_now" | "prebook";

export interface QuoteRequestPayload {
  collection_postcode: string;
  delivery_postcodes: string[];
  van_size: VanSize;
  job_type: QuoteJobType;
  ready_mode: ReadyMode;
  collection_date?: string;
  ready_time?: string;
  courier_id?: string;
}

export interface QuoteApiResponse {
  quoteRequestId: string;
  collectionPostcode: string;
  deliveryPostcodes: string[];
  selectedVanSize: VanSize;
  selectedJobType: QuoteJobType;
  readyMode: ReadyMode;
  collectionDateTime: string | null;
  options: {
    same_day: QuoteBreakdown;
    direct: QuoteBreakdown;
  };
}
