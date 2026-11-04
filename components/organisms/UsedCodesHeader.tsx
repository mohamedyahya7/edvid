import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CodeFilterType } from '@/hooks/useUsedCodes';
import { ScreenHeaderBar } from '@/components/molecules/ScreenHeaderBar';
import { SearchBar } from '@/components/atoms/SearchBar';
import { FilterTabsBar, FilterTabItem } from '@/components/molecules/FilterTabsBar';

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
  const tabs = useMemo<FilterTabItem<CodeFilterType>[]>(
    () => [
      { id: 'all', label: 'الكل', count: totalCount },
      { id: 'watch', label: 'مشاهدة مباشرة', count: watchCount },
      { id: 'download', label: 'تحميل أوفلاين', count: downloadCount },
    ],
    [totalCount, watchCount, downloadCount]
  );

  return (
    <View>
      {/* Top App Bar with back button */}
      <ScreenHeaderBar
        title="أكوادك المفعّلة"
        onBack={onBack}
      />

      {/* Search Input Bar */}
      {totalCount > 0 && (
        <View style={styles.searchWrap}>
          <SearchBar
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            placeholder="ابحث برمز الكود أو اسم الدرس..."
          />
        </View>
      )}

      {/* Horizontal Filter Tabs */}
      {totalCount > 0 && (
        <FilterTabsBar
          tabs={tabs}
          selectedId={selectedFilter}
          onSelect={onSelectFilter}
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
});
