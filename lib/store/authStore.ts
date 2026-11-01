import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
      } catch {
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
      } catch {}
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        if (typeof localStorage !== "undefined") localStorage.removeItem(key);
      } catch {}
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

type User = {
  id: string;
  name: string;
  role: "student" | "teacher" | "assistant";
  grade_id?: number;
  phone?: string;
  support_id?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  actions: {
    signIn: (user: User, token: string) => void;
    signOut: () => void;
    hydrate: () => Promise<void>;
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrating: true,
  actions: {
    signIn: async (user, token) => {
      set({ user, token, isAuthenticated: true });
      await storage.setItem("authToken", token);
      await storage.setItem("authUser", JSON.stringify(user));
    },
    signOut: () => {
      set({ user: null, token: null, isAuthenticated: false });
      storage.deleteItem("authToken");
      storage.deleteItem("authUser");
    },
    hydrate: async () => {
      try {
        const token = await storage.getItem("authToken");
        const userString = await storage.getItem("authUser");
        if (token && userString) {
          const user = JSON.parse(userString) as User;
          set({ user, token, isAuthenticated: true });
        }
      } catch (e) {
        console.error("Hydration error:", e);
      } finally {
        set({ isHydrating: false });
      }
    },
  },
}));
