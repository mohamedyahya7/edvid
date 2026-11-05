import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}) => {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        { color: colors.text },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: colors.primary }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  default: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  defaultSemiBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 28,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  link: {
    lineHeight: 24,
    fontSize: 14,
  },
});
