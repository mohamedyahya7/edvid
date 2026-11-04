import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface FilterChipItem {
  id: string;
  name: string;
  count: number;
}

interface FilterChipGroupProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  allLabel: string;
  totalCount: number;
  items: FilterChipItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const FilterChipGroup: React.FC<FilterChipGroupProps> = ({
  iconName,
  label,
  allLabel,
  totalCount,
  items,
  selectedId,
  onSelect,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.labelCol}>
        <Ionicons name={iconName} size={13} color="#8E8E93" />
        <Text style={styles.labelText}>{label}:</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelect(null)}
          style={[
            styles.chip,
            !selectedId
              ? styles.activeChip
              : [styles.inactiveChip, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Text
            style={[
              styles.chipText,
              !selectedId ? styles.activeChipText : { color: colors.text },
            ]}
          >
            {allLabel} ({totalCount})
          </Text>
        </TouchableOpacity>

        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => onSelect(isSelected ? null : item.id)}
              style={[
                styles.chip,
                isSelected
                  ? styles.activeChip
                  : [styles.inactiveChip, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.activeChipText : { color: colors.text },
                ]}
              >
                {item.name} ({item.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  scrollContent: {
    paddingLeft: 8,
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: '#00C897',
    borderColor: '#00C897',
  },
  inactiveChip: {
    backgroundColor: '#F7F9FA',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
