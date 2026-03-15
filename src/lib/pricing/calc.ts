import { PRICING_CONFIG, type QuoteJobType, type VanSize } from "./config";

const METERS_PER_MILE = 1609.344;

export interface CalculateQuoteInput {
  meters: number;
  deliveriesCount: number;
  vanSize: VanSize;
  jobType: QuoteJobType;
  congestionApplied: boolean;
}

export interface QuoteBreakdown {
  milesRaw: number;
  distanceCharge: number;
  perMileRate: number;
  minimumCharge: number;
  minimumApplied: boolean;
  baseCharge: number;
  extraStopsCount: number;
  stopsFee: number;
  congestionApplied: boolean;
  congestionFee: number;
  total: number;
}

export function metersToMiles(meters: number): number {
  return meters / METERS_PER_MILE;
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateStopsFee(extraStopsCount: number): number {
  if (extraStopsCount <= 0) {
    return 0;
  }

  const {
    firstTierStops,
    firstTierPrice,
    additionalStopPrice,
  } = PRICING_CONFIG.stopFees;
  const firstTierCount = Math.min(extraStopsCount, firstTierStops);
  const remainingCount = Math.max(0, extraStopsCount - firstTierStops);

  return firstTierCount * firstTierPrice + remainingCount * additionalStopPrice;
}

export function calculateQuote(input: CalculateQuoteInput): QuoteBreakdown {
  const milesRaw = metersToMiles(input.meters);
  const perMileRate = PRICING_CONFIG.perMileRates[input.jobType][input.vanSize];
  const minimumCharge = PRICING_CONFIG.minimumCharges[input.jobType][input.vanSize];
  const distanceChargeRaw = milesRaw * perMileRate;
  const baseChargeRaw = Math.max(minimumCharge, distanceChargeRaw);
  const minimumApplied = minimumCharge > distanceChargeRaw;
  const extraStopsCount = Math.max(0, input.deliveriesCount - 1);
  const stopsFeeRaw = calculateStopsFee(extraStopsCount);
  const congestionFeeRaw = input.congestionApplied ? PRICING_CONFIG.congestionCharge.fee : 0;
  const totalRaw = baseChargeRaw + stopsFeeRaw + congestionFeeRaw;

  return {
    milesRaw,
    perMileRate: roundMoney(perMileRate),
    distanceCharge: roundMoney(distanceChargeRaw),
    minimumCharge: roundMoney(minimumCharge),
    minimumApplied,
    baseCharge: roundMoney(baseChargeRaw),
    extraStopsCount,
    stopsFee: roundMoney(stopsFeeRaw),
    congestionApplied: input.congestionApplied,
    congestionFee: roundMoney(congestionFeeRaw),
    total: roundMoney(totalRaw),
  };
}
