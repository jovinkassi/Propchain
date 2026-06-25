import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";

interface User {
  id: string;
  walletAddress: string;
  fullName?: string;
  kycStatus: "none" | "pending" | "approved" | "rejected";
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const loginWithWallet = createAsyncThunk(
  "auth/loginWithWallet",
  async ({ address, signature, message }: { address: string; signature: string; message: string }) => {
    const res = await api.post("/api/auth/siwe", { address, signature, message });
    await AsyncStorage.setItem("propchain_token", res.data.token);
    return res.data;
  }
);

export const loadStoredAuth = createAsyncThunk("auth/loadStored", async () => {
  const token = await AsyncStorage.getItem("propchain_token");
  if (!token) return null;
  const res = await api.get("/api/users/me");
  return { token, user: res.data };
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      AsyncStorage.removeItem("propchain_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithWallet.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginWithWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
