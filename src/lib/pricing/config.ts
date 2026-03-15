export type VanSize = "small" | "medium" | "large";
export type QuoteJobType = "same_day" | "direct";

type PriceTable = Record<VanSize, number>;

export interface PricingConfig {
  perMileRates: Record<QuoteJobType, PriceTable>;
  minimumCharges: Record<QuoteJobType, PriceTable>;
  runningMiles: {
    freeMiles: number;
    startedBlockMiles: number;
    chargePerBlock: number;
  };
  stopFees: {
    firstTierStops: number;
    firstTierPrice: number;
    additionalStopPrice: number;
  };
  congestionCharge: {
    label: "London Congestion Charge";
    fee: number;
  };
}

export const VAN_PAYLOADS: Record<VanSize, number> = {
  small: 400,
  medium: 800,
  large: 1100,
};

export const PRICING_CONFIG: PricingConfig = {
  perMileRates: {
    same_day: {
      small: 1.7,
      medium: 2.0,
      large: 2.4,
    },
    direct: {
      small: 2.1,
      medium: 2.5,
      large: 3.0,
    },
  },
  minimumCharges: {
    same_day: {
      small: 40,
      medium: 50,
      large: 60,
    },
    direct: {
      small: 50,
      medium: 65,
      large: 80,
    },
  },
  runningMiles: {
    freeMiles: 30,
    startedBlockMiles: 10,
    chargePerBlock: 10,
  },
  stopFees: {
    firstTierStops: 3,
    firstTierPrice: 5,
    additionalStopPrice: 3,
  },
  congestionCharge: {
    label: "London Congestion Charge",
    fee: 18,
  },
};
