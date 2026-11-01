import React from "react";
import { View, type ViewProps } from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const colorScheme = useColorScheme() ?? "light";
  const backgroundColor =
    colorScheme === "light" ? Colors.light.background : Colors.dark.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
