import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthRole = "admin" | "employee";

export type AuthState = {
  token: string | null;
  role: AuthRole | null;
  userId: string | null;
};

const initialState: AuthState = {
  token: null,
  role: null,
  userId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{ token: string; role: AuthRole; userId: string }>
    ) {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.userId = action.payload.userId;
    },
    clearSession(state) {
      state.token = null;
      state.role = null;
      state.userId = null;
    },
  },
});

export const { setSession, clearSession } = authSlice.actions;
export const authReducer = authSlice.reducer;

