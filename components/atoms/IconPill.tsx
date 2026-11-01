import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface IconPillProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
  containerSize?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const IconPill: React.FC<IconPillProps> = ({
  name,
  size = 17,
  color,
  backgroundColor,
  containerSize = 32,
  borderRadius = 9,
  style,
}) => {
  const { colors } = useTheme();
  const iconColor = color || colors.primary;
  const bgColor = backgroundColor || `${iconColor}18`;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: borderRadius,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
