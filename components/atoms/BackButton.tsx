import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';

export interface BackButtonProps {
  onPress?: () => void;
  variant?: 'glass' | 'plain' | 'solid';
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Standardized Unified Back Button for all screens.
 * Uses `chevron-forward` (pointing to the right) for Arabic RTL navigation.
 */
export const BackButton: React.FC<BackButtonProps> = React.memo(({
  onPress,
  variant = 'glass',
  color,
  size = 22,
  style,
}) => {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const defaultIconColor =
    color || (variant === 'glass' ? '#FFFFFF' : colors.text);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="العودة للخلف"
      style={[
        variant === 'glass' && styles.glassBtn,
        variant === 'solid' && [styles.solidBtn, { backgroundColor: colors.card, borderColor: colors.border }],
        variant === 'plain' && styles.plainBtn,
        style,
      ]}
    >
      <Ionicons
        name="chevron-forward"
        size={size}
        color={defaultIconColor}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  glassBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
      } as any,
    }),
  },
  solidBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  plainBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
