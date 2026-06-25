import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMyPortfolio } from "@/lib/api";

export interface Holding {
  id: string;
  name: string;
  location: string;
  tokenAmount: number;
  valueAed: number;
  rentalYieldBps: number;
}

interface PortfolioState {
  holdings: Holding[];
  totalValueAed: number;
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  holdings: [],
  totalValueAed: 0,
  loading: false,
  error: null,
};

export const fetchPortfolio = createAsyncThunk("portfolio/fetch", async () => {
  return await getMyPortfolio();
});

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.holdings = action.payload;
        state.totalValueAed = action.payload.reduce(
          (sum: number, h: Holding) => sum + h.valueAed, 0
        );
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load portfolio";
      });
  },
});

export default portfolioSlice.reducer;
