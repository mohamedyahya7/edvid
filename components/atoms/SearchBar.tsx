import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
  iconName?: keyof typeof Ionicons.glyphMap;
  autoFocus?: boolean;
}

export const SearchBar = React.memo<SearchBarProps>(({
  value,
  onChangeText,
  placeholder = 'بحث...',
  onClear,
  style,
  iconName = 'search-outline',
  autoFocus = false,
}) => {
  const { colors } = useTheme();

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChangeText('');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Ionicons name={iconName} size={18} color="#8E8E93" style={styles.icon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus={autoFocus}
        textAlign="right"
      />
      {value.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="مسح نص البحث"
        >
          <Ionicons name="close-circle" size={17} color="#8E8E93" />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  icon: {
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 13.5,
    writingDirection: 'rtl',
    paddingVertical: 0,
  },
});
