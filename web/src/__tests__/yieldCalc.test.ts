// Unit tests for yield calculation logic

function calcAnnualYield(valueAed: number, rentalYieldBps: number): number {
  return (valueAed * rentalYieldBps) / 10000;
}

function calcMonthlyYield(valueAed: number, rentalYieldBps: number): number {
  return calcAnnualYield(valueAed, rentalYieldBps) / 12;
}

function calcHolderShare(tokenAmount: number, totalSupply: number): number {
  return tokenAmount / totalSupply;
}

describe("Yield Calculations", () => {
  test("calculates annual yield correctly", () => {
    // 1,000,000 AED property at 6% yield (600 bps)
    expect(calcAnnualYield(1_000_000, 600)).toBe(60_000);
  });

  test("calculates monthly yield correctly", () => {
    expect(calcMonthlyYield(1_000_000, 600)).toBeCloseTo(5000);
  });

  test("calculates holder share correctly", () => {
    // holding 1000 tokens out of 1,000,000 total = 0.1%
    expect(calcHolderShare(1000, 1_000_000)).toBe(0.001);
  });

  test("returns zero yield for zero value", () => {
    expect(calcAnnualYield(0, 600)).toBe(0);
  });

  test("handles max yield bps (10000 = 100%)", () => {
    expect(calcAnnualYield(100_000, 10000)).toBe(100_000);
  });
});
