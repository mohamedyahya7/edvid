import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDynamicTheme } from '@/hooks/useDynamicTheme';
import { ThemePreference } from '@/lib/store/themeStore';

interface ThemeOptionItem {
  id: ThemePreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

const THEME_OPTIONS: ThemeOptionItem[] = [
  { id: 'light', label: 'فاتح', icon: 'sunny-outline', activeIcon: 'sunny' },
  { id: 'dark', label: 'داكن', icon: 'moon-outline', activeIcon: 'moon' },
  { id: 'system', label: 'تلقائي', icon: 'phone-portrait-outline', activeIcon: 'phone-portrait' },
];

export const ThemeSelectorCard: React.FC = () => {
  const { colors } = useTheme();
  const { themePreference, setThemePreference } = useDynamicTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}18` }]}>
          <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>مظهر التطبيق</Text>
          <Text style={styles.cardSubtitle}>
            اختر الثيم المفضل أو دعه يتبع إعدادات جهازك تلقائياً
          </Text>
        </View>
      </View>

      <View style={[styles.optionsRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = themePreference === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.85}
              onPress={() => setThemePreference(option.id)}
              style={[
                styles.optionBtn,
                isSelected && [
                  styles.optionBtnActive,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                ],
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <Ionicons
                name={isSelected ? option.activeIcon : option.icon}
                size={18}
                color={isSelected ? colors.primary : '#8E8E93'}
              />
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? colors.primary : colors.text,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: '#8E8E93',
  },
  optionsRow: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
    gap: 6,
  },
  optionBtnActive: {
    borderWidth: 1.5,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  optionText: {
    fontSize: 13,
  },
});
