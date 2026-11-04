import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CodeFilterType } from '@/hooks/useUsedCodes';

export interface UsedCodesHeaderProps {
  totalCount: number;
  watchCount: number;
  downloadCount: number;
  selectedFilter: CodeFilterType;
  onSelectFilter: (filter: CodeFilterType) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onBack: () => void;
}

export const UsedCodesHeader: React.FC<UsedCodesHeaderProps> = ({
  totalCount,
  watchCount,
  downloadCount,
  selectedFilter,
  onSelectFilter,
  searchQuery,
  onChangeSearchQuery,
  onBack,
}) => {
  const { colors } = useTheme();

  return (
    <View>
      {/* Top App Bar with back button */}
      <View style={[styles.topBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>أكوادك المفعّلة</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input Bar */}
      {totalCount > 0 && (
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="ابحث برمز الكود أو اسم الدرس..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onChangeSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Horizontal Filter Tabs */}
      {totalCount > 0 && (
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onSelectFilter('all')}
              style={[
                styles.tabPill,
                {
                  backgroundColor: selectedFilter === 'all' ? colors.primary : colors.card,
                  borderColor: selectedFilter === 'all' ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedFilter === 'all' ? '#FFFFFF' : colors.text },
                ]}
              >
                الكل ({totalCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onSelectFilter('watch')}
              style={[
                styles.tabPill,
                {
                  backgroundColor: selectedFilter === 'watch' ? colors.primary : colors.card,
                  borderColor: selectedFilter === 'watch' ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedFilter === 'watch' ? '#FFFFFF' : colors.text },
                ]}
              >
                مشاهدة مباشرة ({watchCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onSelectFilter('download')}
              style={[
                styles.tabPill,
                {
                  backgroundColor: selectedFilter === 'download' ? colors.primary : colors.card,
                  borderColor: selectedFilter === 'download' ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedFilter === 'download' ? '#FFFFFF' : colors.text },
                ]}
              >
                تحميل أوفلاين ({downloadCount})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  tabsWrapper: {
    marginTop: 6,
    marginBottom: 2,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
