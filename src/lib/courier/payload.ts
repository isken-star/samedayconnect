import type { VanType } from "@prisma/client";

export const COURIER_VAN_PAYLOAD_KG: Record<VanType, number> = {
  SMALL: 400,
  MEDIUM: 800,
  LARGE: 1100,
};

export const COURIER_VAN_LABEL: Record<VanType, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
};

export function getCourierPayloadKg(vanType: VanType): number {
  return COURIER_VAN_PAYLOAD_KG[vanType];
}

export function getCourierVanLabel(vanType: VanType): string {
  return COURIER_VAN_LABEL[vanType];
}
