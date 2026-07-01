// Tests for MarketStats calculation logic (pure unit tests, no DOM rendering)

interface Property {
  id: string;
  onChainId: number;
  name: string;
  location: string;
  description: string;
  totalValue: number;
  rentalYieldBps: number;
  imageUrl: string;
  active: boolean;
}

function computeStats(items: Property[]) {
  const totalValue = items.reduce((sum, p) => sum + p.totalValue, 0);
  const avgYield = items.length
    ? (items.reduce((sum, p) => sum + p.rentalYieldBps, 0) / items.length / 100).toFixed(2)
    : "0.00";
  return {
    count: items.length,
    totalValue,
    avgYield,
    totalValueLabel: `AED ${(totalValue / 1_000_000).toFixed(1)}M`,
  };
}

const mockProperties: Property[] = [
  { id: "1", onChainId: 1, name: "Marina Tower", location: "Dubai", description: "", totalValue: 15_000_000, rentalYieldBps: 650, imageUrl: "", active: true },
  { id: "2", onChainId: 2, name: "Palm Villa", location: "Dubai", description: "", totalValue: 25_000_000, rentalYieldBps: 580, imageUrl: "", active: true },
];

describe("MarketStats", () => {
  test("shows 0 stats when no properties", () => {
    const stats = computeStats([]);
    expect(stats.count).toBe(0);
    expect(stats.totalValue).toBe(0);
    expect(stats.avgYield).toBe("0.00");
  });

  test("shows correct property count", () => {
    const stats = computeStats(mockProperties);
    expect(stats.count).toBe(2);
  });

  test("calculates total market value correctly", () => {
    const stats = computeStats(mockProperties);
    expect(stats.totalValue).toBe(40_000_000);
    expect(stats.totalValueLabel).toBe("AED 40.0M");
  });

  test("calculates average yield correctly", () => {
    const stats = computeStats(mockProperties);
    const expected = ((650 + 580) / 2 / 100).toFixed(2);
    expect(stats.avgYield).toBe(expected);
  });
});
