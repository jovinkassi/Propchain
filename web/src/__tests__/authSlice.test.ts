import authReducer, { logout, setToken } from "@/store/slices/authSlice";

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

describe("authSlice", () => {
  test("returns initial state", () => {
    const state = authReducer(undefined, { type: "unknown" });
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  test("setToken updates token in state", () => {
    const state = authReducer(initialState, setToken("test_jwt_token"));
    expect(state.token).toBe("test_jwt_token");
  });

  test("logout clears user and token", () => {
    const loggedInState = {
      user: { id: "1", walletAddress: "0xabc", kycStatus: "none" as const },
      token: "some_token",
      loading: false,
      error: null,
    };
    const state = authReducer(loggedInState, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  test("loginWithWallet.pending sets loading true", () => {
    const action = { type: "auth/loginWithWallet/pending" };
    const state = authReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  test("loginWithWallet.rejected sets error message", () => {
    const action = {
      type: "auth/loginWithWallet/rejected",
      error: { message: "Login failed" },
    };
    const state = authReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Login failed");
  });
});
