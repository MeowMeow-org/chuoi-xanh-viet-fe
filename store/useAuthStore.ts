"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type { User } from "@/services/auth";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
};

type AuthActions = {
  setAuth: (payload: AuthState) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set) => ({
        accessToken: null,
        refreshToken: null,
        user: null,

        setAuth: (payload) => {
          set({
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            user: payload.user,
          });
        },

        clearAuth: () => {
          set({ accessToken: null, refreshToken: null, user: null });
        },
      }),
      {
        name: "auth-storage",
      },
    ),
  ),
);
