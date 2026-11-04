import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

export interface FilterTabItem<T = string | null> {
  id: T;
  label: string;
  count?: number;
}

export interface FilterTabsBarProps<T = string | null> {
  tabs: FilterTabItem<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function FilterTabsBar<T = string | null>({
  tabs,
  selectedId,
  onSelect,
  style,
  contentContainerStyle,
}: FilterTabsBarProps<T>) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      >
        {tabs.map((tab, index) => {
          const isSelected = selectedId === tab.id;
          return (
            <TouchableOpacity
              key={String(tab.id ?? index)}
              activeOpacity={0.8}
              onPress={() => onSelect(tab.id)}
              style={[
                styles.tabPill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isSelected ? '#FFFFFF' : colors.text },
                ]}
              >
                {tab.label}
                {typeof tab.count === 'number' ? ` (${tab.count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
