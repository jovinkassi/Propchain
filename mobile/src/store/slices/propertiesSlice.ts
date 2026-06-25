import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export interface Property {
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

interface PropertiesState {
  items: Property[];
  selected: Property | null;
  loading: boolean;
  error: string | null;
}

const initialState: PropertiesState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

export const fetchProperties = createAsyncThunk("properties/fetchAll", async () => {
  const res = await api.get("/api/properties");
  return res.data;
});

export const fetchProperty = createAsyncThunk("properties/fetchOne", async (id: string) => {
  const res = await api.get(`/api/properties/${id}`);
  return res.data;
});

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load";
      })
      .addCase(fetchProperty.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  },
});

export default propertiesSlice.reducer;
