import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProperties, getProperty } from "@/lib/api";

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
  return await getProperties();
});

export const fetchProperty = createAsyncThunk("properties/fetchOne", async (id: string) => {
  return await getProperty(id);
});

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load properties";
      })
      .addCase(fetchProperty.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load property";
      });
  },
});

export const { clearSelected } = propertiesSlice.actions;
export default propertiesSlice.reducer;
