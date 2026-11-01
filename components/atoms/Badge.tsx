import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';

export type BadgeVariant = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  textStyle,
}) => {
  const badgeColors = {
    success: { bg: '#E8F5E9', text: '#2E7D32' },
    warning: { bg: '#FFF3E0', text: '#E65100' },
    info: { bg: '#E3F2FD', text: '#1565C0' },
    danger: { bg: '#FFEBEE', text: '#C62828' },
    neutral: { bg: '#F5F5F5', text: '#616161' },
  }[variant];

  return (
    <View style={[styles.container, { backgroundColor: badgeColors.bg }, style]}>
      <Text style={[styles.text, { color: badgeColors.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
