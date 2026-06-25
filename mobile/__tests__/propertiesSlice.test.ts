import { configureStore } from "@reduxjs/toolkit";
import propertiesReducer, { fetchProperties } from "../src/store/slices/propertiesSlice";

jest.mock("../src/services/api", () => ({
  get: jest.fn(),
}));

import api from "../src/services/api";

describe("propertiesSlice", () => {
  it("sets loading on pending", () => {
    const store = configureStore({ reducer: { properties: propertiesReducer } });
    store.dispatch({ type: fetchProperties.pending.type });
    expect(store.getState().properties.loading).toBe(true);
  });

  it("populates items on fulfilled", () => {
    const store = configureStore({ reducer: { properties: propertiesReducer } });
    const mockData = [{ id: "1", name: "Marina Tower A", location: "Dubai" }];
    store.dispatch({ type: fetchProperties.fulfilled.type, payload: mockData });
    expect(store.getState().properties.items).toHaveLength(1);
    expect(store.getState().properties.items[0].name).toBe("Marina Tower A");
  });
});
