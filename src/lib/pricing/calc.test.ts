import { describe, expect, it } from "vitest";

import {
  calculateQuote,
  calculateRunningMilesFee,
  calculateStopsFee,
  metersToMiles,
} from "./calc";

describe("pricing calculator", () => {
  it("applies minimum when distance charge is lower", () => {
    const quote = calculateQuote({
      meters: 5000,
      deliveriesCount: 1,
      vanSize: "small",
      jobType: "same_day",
      congestionApplied: false,
    });

    expect(metersToMiles(5000)).toBeCloseTo(3.106856, 5);
    expect(quote.distanceCharge).toBe(5.28);
    expect(quote.minimumApplied).toBe(true);
    expect(quote.baseCharge).toBe(40);
    expect(quote.total).toBe(40);
  });

  it("calculates stop fee tiers exactly", () => {
    expect(calculateStopsFee(0)).toBe(0);
    expect(calculateStopsFee(1)).toBe(5);
    expect(calculateStopsFee(2)).toBe(10);
    expect(calculateStopsFee(3)).toBe(15);
    expect(calculateStopsFee(4)).toBe(18);
    expect(calculateStopsFee(5)).toBe(21);
  });

  it("adds congestion charge when applicable", () => {
    const quote = calculateQuote({
      meters: 10000,
      deliveriesCount: 2,
      vanSize: "medium",
      jobType: "direct",
      congestionApplied: true,
    });

    expect(quote.congestionFee).toBe(18);
    expect(quote.stopsFee).toBe(5);
    expect(quote.total).toBe(88);
  });

  it("rounds money values at the end", () => {
    const quote = calculateQuote({
      meters: 12345.6789,
      deliveriesCount: 1,
      vanSize: "large",
      jobType: "direct",
      congestionApplied: false,
    });

    expect(quote.distanceCharge).toBe(23.01);
    expect(quote.total).toBe(80);
  });

  it("charges running miles after the first 30 miles", () => {
    expect(calculateRunningMilesFee(30)).toBe(0);
    expect(calculateRunningMilesFee(39)).toBe(10);
    expect(calculateRunningMilesFee(40)).toBe(10);
    expect(calculateRunningMilesFee(41)).toBe(20);
    expect(calculateRunningMilesFee(55)).toBe(30);
  });

  it("adds hidden surcharge into the final total only", () => {
    const quote = calculateQuote({
      meters: 10000,
      deliveriesCount: 1,
      vanSize: "small",
      jobType: "same_day",
      congestionApplied: false,
      hiddenSurchargeFee: 20,
    });

    expect(quote.distanceCharge).toBe(10.56);
    expect(quote.baseCharge).toBe(40);
    expect(quote.total).toBe(60);
  });
});
