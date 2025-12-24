import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Define exactly what the User object looks like from your JWT payload
interface User {
  id: string;
  email: string;
  username: string;
  role: "SUPER_ADMIN" | "BRANCH_MANAGER" | "CUSTOMER";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Note: Action payload should match what your loginUser mutation returns
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; role: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token"); // Clean up
    },
    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, clearCredentials, updateUserData } = authSlice.actions;
export default authSlice.reducer;