import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SubjectFilterTab } from '@/hooks/useSubjectsScreen';
import { ScreenHeaderBar } from '@/components/molecules/ScreenHeaderBar';
import { SearchBar } from '@/components/atoms/SearchBar';
import { FilterTabsBar, FilterTabItem } from '@/components/molecules/FilterTabsBar';

export interface SubjectsHeaderProps {
  totalCount: number;
  followedCount: number;
  activeTab: SubjectFilterTab;
  onSelectTab: (tab: SubjectFilterTab) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onBack: () => void;
}

export const SubjectsHeader: React.FC<SubjectsHeaderProps> = ({
  totalCount,
  followedCount,
  activeTab,
  onSelectTab,
  searchQuery,
  onChangeSearchQuery,
  onBack,
}) => {
  const tabs = useMemo<FilterTabItem<SubjectFilterTab>[]>(
    () => [
      { id: 'all', label: 'الكل', count: totalCount },
      { id: 'followed', label: 'المتابعة', count: followedCount },
      { id: 'unfollowed', label: 'غير المتابعة', count: Math.max(0, totalCount - followedCount) },
    ],
    [totalCount, followedCount]
  );

  return (
    <View>
      {/* Top Header Bar */}
      <ScreenHeaderBar
        title="المواد الدراسية"
        subtitle={`${followedCount} مادة متابعة من أصل ${totalCount}`}
        onBack={onBack}
      />

      {/* Search Input Bar */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
          placeholder="ابحث عن مادة..."
        />
      </View>

      {/* Filter Tabs */}
      <FilterTabsBar
        tabs={tabs}
        selectedId={activeTab}
        onSelect={onSelectTab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
  },
});
