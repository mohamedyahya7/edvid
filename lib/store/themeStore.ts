import { create } from 'zustand';
import { Platform, Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'bamboo_theme_preference';

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
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
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      } catch {}
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
};

interface ThemeState {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  hydrateTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themePreference: 'system',

  setThemePreference: async (preference: ThemePreference) => {
    set({ themePreference: preference });
    await storage.setItem(THEME_STORAGE_KEY, preference);
  },

  hydrateTheme: async () => {
    try {
      const saved = await storage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        set({ themePreference: saved });
      }
    } catch (e) {
      console.warn('Failed to hydrate theme preference:', e);
    }
  },
}));
