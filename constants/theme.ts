import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Colors } from '@/constants/Colors';

export const CustomLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.accent,
  },
};

export const CustomDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.accent,
  },
};

export const CustomPaperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    surface: Colors.light.surface,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: Colors.light.card,
    },
  },
};

export const CustomPaperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    surface: Colors.dark.surface,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: Colors.dark.card,
    },
  },
};
