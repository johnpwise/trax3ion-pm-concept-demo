import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthUser } from "../types/auth";

type DemoCredential = AuthUser & { password: string };

const DEMO_USERS: DemoCredential[] = [
  {
    id: "pm-demo",
    name: "Maya Lad",
    email: "pm@trax3ion.demo",
    password: "trax3ion-pm",
    role: "project-manager",
    resourceId: "res-maya",
  },
  {
    id: "user-demo",
    name: "Graham Gibbon",
    email: "user@trax3ion.demo",
    password: "trax3ion-user",
    role: "user",
    resourceId: "res-graham",
  },
];

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthState = {
  currentUser: AuthUser | null;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
};

export const AUTH_STORE_STORAGE_KEY = "trax3ion-pm-auth-v1";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,

      login: (email, password) => {
        const match = DEMO_USERS.find(
          (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password,
        );

        if (!match) {
          return { ok: false, error: "Invalid email or password." };
        }

        set({ currentUser: { id: match.id, name: match.name, email: match.email, role: match.role, resourceId: match.resourceId } });
        return { ok: true };
      },

      logout: () => set({ currentUser: null }),
    }),
    { name: AUTH_STORE_STORAGE_KEY },
  ),
);

export function useCanEdit(): boolean {
  return useAuthStore((state) => state.currentUser?.role === "project-manager");
}
