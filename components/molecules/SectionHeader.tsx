import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { IconPill } from '@/components/atoms/IconPill';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onShowAll?: () => void;
  showAllText?: string;
  count?: number | string;
  filterLabel?: string | null;
  onClearFilter?: () => void;
}

export const SectionHeader = React.memo<SectionHeaderProps>(({
  title,
  subtitle,
  iconName,
  iconColor,
  onShowAll,
  showAllText = 'عرض الكل',
  count,
  filterLabel,
  onClearFilter,
}) => {
  const { colors } = useTheme();
  const activeIconColor = iconColor || colors.primary;

  return (
    <View style={styles.header}>
      {/* Right side: Icon + Title & Subtitle (First child in RTL row = Far Right) */}
      <View style={styles.titleGroup}>
        {iconName ? (
          <IconPill name={iconName} color={activeIconColor} />
        ) : null}
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      {/* Left side: Show All Button, Count Badge, or Filter Pill (Second child in RTL row = Far Left) */}
      <View style={styles.actionsGroup}>
        {filterLabel && onClearFilter ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClearFilter}
            style={[styles.filterPill, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}
          >
            <Ionicons name="close-circle" size={13} color={colors.primary} />
            <Text style={[styles.filterPillText, { color: colors.primary }]}>{filterLabel}</Text>
          </TouchableOpacity>
        ) : null}

        {count !== undefined && !filterLabel ? (
          <View style={[styles.countBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>{count}</Text>
          </View>
        ) : null}

        {onShowAll ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onShowAll}
            style={styles.showAllBtn}
          >
            <Text style={[styles.showAll, { color: colors.primary }]}>
              {showAllText}
            </Text>
            <Ionicons name="chevron-back" size={13} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  textWrap: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 10.5,
    color: '#8E8E93',
    marginTop: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
  },
  showAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  showAll: {
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'right',
  },
});
