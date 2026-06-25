import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

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
  token: typeof window !== "undefined" ? localStorage.getItem("propchain_token") : null,
  loading: false,
  error: null,
};

export const loginWithWallet = createAsyncThunk(
  "auth/loginWithWallet",
  async ({ address, signature, message }: { address: string; signature: string; message: string }) => {
    const res = await api.post("/api/auth/siwe", { address, signature, message });
    localStorage.setItem("propchain_token", res.data.token);
    return res.data;
  }
);

export const loadCurrentUser = createAsyncThunk("auth/loadCurrentUser", async () => {
  const res = await api.get("/api/users/me");
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("propchain_token");
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
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
        state.error = action.error.message ?? "Login failed";
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
