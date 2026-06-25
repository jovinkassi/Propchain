import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

interface Holding {
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
}

const initialState: PortfolioState = {
  holdings: [],
  totalValueAed: 0,
  loading: false,
};

export const fetchPortfolio = createAsyncThunk("portfolio/fetch", async () => {
  const res = await api.get("/api/users/me/portfolio");
  return res.data;
});

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => { state.loading = true; })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.holdings = action.payload;
        state.totalValueAed = action.payload.reduce((sum: number, h: Holding) => sum + h.valueAed, 0);
      });
  },
});

export default portfolioSlice.reducer;
