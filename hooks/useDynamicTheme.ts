import { useState, useEffect, useCallback } from 'react';
import { Appearance, AppState, AppStateStatus } from 'react-native';
import {
  CustomLightTheme,
  CustomDarkTheme,
  CustomPaperLightTheme,
  CustomPaperDarkTheme,
} from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useThemeStore, ThemePreference } from '@/lib/store/themeStore';

export function useDynamicTheme() {
  const themePreference = useThemeStore((state) => state.themePreference);
  const setThemePreference = useThemeStore((state) => state.setThemePreference);

  // Track raw OS system scheme ('light' | 'dark')
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(() => {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  });

  const checkAndUpdateSystemScheme = useCallback(() => {
    const current = Appearance.getColorScheme();
    const normalized = current === 'dark' ? 'dark' : 'light';
    setSystemScheme(normalized);
  }, []);

  useEffect(() => {
    // 1. Direct event listener on native Appearance changes
    const appearanceSub = Appearance.addChangeListener(({ colorScheme: nextScheme }) => {
      setSystemScheme(nextScheme === 'dark' ? 'dark' : 'light');
    });

    // 2. AppState change listener (crucial on Android when user toggles dark mode from Quick Settings panel)
    const appStateSub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkAndUpdateSystemScheme();
      }
    });

    return () => {
      appearanceSub.remove();
      appStateSub.remove();
    };
  }, [checkAndUpdateSystemScheme]);

  // Resolve active color scheme based on user preference
  const resolvedScheme: 'light' | 'dark' =
    themePreference === 'system' ? systemScheme : themePreference;

  const isDark = resolvedScheme === 'dark';

  return {
    themePreference,
    setThemePreference,
    colorScheme: resolvedScheme,
    isDark,
    colors: isDark ? Colors.dark : Colors.light,
    navigationTheme: isDark ? CustomDarkTheme : CustomLightTheme,
    paperTheme: isDark ? CustomPaperDarkTheme : CustomPaperLightTheme,
  };
}
