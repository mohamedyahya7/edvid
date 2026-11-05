import React from "react";
import { StyleSheet, Text, type TextProps } from "react-native";


import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? "light";
  const color = colorScheme === "light" ? Colors.light.text : Colors.dark.text;
  const styleSwitch = {
    default: styles.default,
    title: styles.title,
    defaultSemiBold: styles.defaultSemiBold,
    subtitle: styles.subtitle,
    link: styles.link,
  };

  return <Text style={[{ color }, styleSwitch[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    
    lineHeight: 22,
  },
  defaultSemiBold: {
    fontFamily: "amiri",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
