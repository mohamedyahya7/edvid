import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import {
  CustomLightTheme,
  CustomDarkTheme,
  CustomPaperLightTheme,
  CustomPaperDarkTheme,
} from '@/constants/theme';
import { Colors } from '@/constants/Colors';

export function useDynamicTheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => {
    const current = Appearance.getColorScheme();
    return current === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    // Immediate event-driven listener: fires without delay on system toggle
    const subscription = Appearance.addChangeListener(({ colorScheme: nextScheme }) => {
      setColorScheme(nextScheme === 'dark' ? 'dark' : 'light');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isDark = colorScheme === 'dark';

  return {
    colorScheme,
    isDark,
    colors: isDark ? Colors.dark : Colors.light,
    navigationTheme: isDark ? CustomDarkTheme : CustomLightTheme,
    paperTheme: isDark ? CustomPaperDarkTheme : CustomPaperLightTheme,
  };
}
