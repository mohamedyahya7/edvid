import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SubjectTab } from '@/hooks/useFollowedTeachersScreen';
import { ScreenHeaderBar } from '@/components/molecules/ScreenHeaderBar';
import { SearchBar } from '@/components/atoms/SearchBar';
import { FilterTabsBar, FilterTabItem } from '@/components/molecules/FilterTabsBar';

export interface FollowedTeachersHeaderProps {
  totalCount: number;
  subjectTabs: SubjectTab[];
  selectedSubjectId: string | null;
  onSelectSubjectId: (id: string | null) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onBack: () => void;
  onExploreAll: () => void;
}

export const FollowedTeachersHeader: React.FC<FollowedTeachersHeaderProps> = ({
  totalCount,
  subjectTabs,
  selectedSubjectId,
  onSelectSubjectId,
  searchQuery,
  onChangeSearchQuery,
  onBack,
  onExploreAll,
}) => {
  const { colors } = useTheme();

  // Convert subjectTabs to standard FilterTabItem format
  const tabs = useMemo<FilterTabItem<string | null>[]>(() => {
    const allTab: FilterTabItem<string | null> = {
      id: null,
      label: 'الكل',
      count: totalCount,
    };
    const mapped = subjectTabs.map((t) => ({
      id: t.id,
      label: t.title,
      count: t.count,
    }));
    return [allTab, ...mapped];
  }, [subjectTabs, totalCount]);

  return (
    <View>
      {/* Top Header Bar */}
      <ScreenHeaderBar
        title="مدرسينك المتابعون"
        subtitle={
          totalCount > 0
            ? `${totalCount} مدرس تتابعهم`
            : 'قائمتك المفضلة من المدرسين'
        }
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onExploreAll}
            style={[
              styles.exploreAllBtn,
              { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}35` },
            ]}
          >
            <Ionicons name="compass-outline" size={16} color={colors.primary} />
            <Text style={[styles.exploreAllBtnText, { color: colors.primary }]}>
              كل المدرسين
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      {totalCount > 0 && (
        <View style={styles.searchWrap}>
          <SearchBar
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            placeholder="ابحث بين مدرسينك بالاسم أو المادة..."
          />
        </View>
      )}

      {/* Horizontal Subject Filter Tabs */}
      {subjectTabs.length > 1 && (
        <FilterTabsBar
          tabs={tabs}
          selectedId={selectedSubjectId}
          onSelect={onSelectSubjectId}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  exploreAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  exploreAllBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
