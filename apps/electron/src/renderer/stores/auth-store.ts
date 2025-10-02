import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  authToken: string | null;
  userInfo: any | null;
  isLoggingIn: boolean;
  credits: number | null;
  loginError: string | null;
  checkAuthStatus: (forceRefresh?: boolean) => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  setCredits: (credits: number) => void;
  setLoginError: (err: string | null) => void;
  clearErrors: () => void;
  setAuthToken: (token: string | null) => void;
  subscribeToAuthChanges: (listener?: (state: AuthState) => void) => () => void;
  initializeFromSettings: (settings: any) => Promise<void>;
  clearStore: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  authToken: null,
  userInfo: null,
  isLoggingIn: false,
  credits: null,
  loginError: null,
  checkAuthStatus: async () => { /* no-op */ },
  login: async () => {},
  logout: async () => {},
  refreshCredits: async () => {},
  setCredits: (credits) => set({ credits }),
  setLoginError: (loginError) => set({ loginError }),
  clearErrors: () => set({ loginError: null }),
  setAuthToken: (token) => set({ authToken: token, isAuthenticated: !!token }),
  subscribeToAuthChanges: (_listener?: (state: AuthState) => void) => {
    // Return no-op unsubscribe function
    return () => {};
  },
  initializeFromSettings: async (_settings: any) => { /* no-op */ },
  clearStore: () => set({
    isAuthenticated: false,
    authToken: null,
    userInfo: null,
    isLoggingIn: false,
    credits: null,
    loginError: null,
  }),
}));

export const createAuthStore = (_?: any) => useAuthStore;
export default useAuthStore;
