import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MarketStats } from "@/components/MarketStats";
import propertiesReducer from "@/store/slices/propertiesSlice";

function renderWithStore(properties: any[] = []) {
  const store = configureStore({
    reducer: { properties: propertiesReducer },
    preloadedState: {
      properties: { items: properties, selected: null, loading: false, error: null },
    },
  });
  return render(
    <Provider store={store}>
      <MarketStats />
    </Provider>
  );
}

describe("MarketStats", () => {
  test("renders market stats section", () => {
    renderWithStore();
    expect(screen.getByText("LISTED PROPERTIES")).toBeInTheDocument();
    expect(screen.getByText("TOTAL MARKET VALUE")).toBeInTheDocument();
    expect(screen.getByText("AVG. ANNUAL YIELD")).toBeInTheDocument();
  });

  test("shows 0 when no properties", () => {
    renderWithStore([]);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("shows correct property count", () => {
    const mockProperties = [
      { id: "1", name: "Marina Tower", location: "Dubai", totalValue: 1000000, rentalYieldBps: 600, active: true, onChainId: 1, description: "", imageUrl: "" },
      { id: "2", name: "Palm Villa", location: "Dubai", totalValue: 2000000, rentalYieldBps: 450, active: true, onChainId: 2, description: "", imageUrl: "" },
    ];
    renderWithStore(mockProperties);
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
