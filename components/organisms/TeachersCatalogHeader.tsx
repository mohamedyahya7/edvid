import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenHeaderBar } from '@/components/molecules/ScreenHeaderBar';
import { SearchBar } from '@/components/atoms/SearchBar';
import { FilterTabsBar, FilterTabItem } from '@/components/molecules/FilterTabsBar';

interface SubjectTab {
  id: string;
  title: string;
  count: number;
}

interface TeachersCatalogHeaderProps {
  selectedSubjectId: string | null;
  onSelectSubject: (id: string | null) => void;
  subjectTabs: SubjectTab[];
  totalTeachersCount: number;
  searchQuery: string;
  onChangeSearchQuery: (q: string) => void;
}

export const TeachersCatalogHeader: React.FC<TeachersCatalogHeaderProps> = ({
  selectedSubjectId,
  onSelectSubject,
  subjectTabs,
  totalTeachersCount,
  searchQuery,
  onChangeSearchQuery,
}) => {
  const currentSubjectTitle = selectedSubjectId
    ? subjectTabs.find((s) => s.id === selectedSubjectId)?.title || 'المادة'
    : null;

  const tabs = useMemo<FilterTabItem<string | null>[]>(() => {
    const allTab: FilterTabItem<string | null> = {
      id: null,
      label: 'الكل',
      count: totalTeachersCount,
    };
    const mapped = subjectTabs.map((s) => ({
      id: s.id,
      label: s.title,
      count: s.count,
    }));
    return [allTab, ...mapped];
  }, [subjectTabs, totalTeachersCount]);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <ScreenHeaderBar
        title="نخبة المعلمين"
        subtitle={
          currentSubjectTitle
            ? `معلمو ${currentSubjectTitle}`
            : `جميع المدرسين (${totalTeachersCount})`
        }
      />

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
          placeholder="ابحث باسم المدرس أو المادة..."
        />
      </View>

      {/* Subject Tabs */}
      {subjectTabs.length > 0 && (
        <FilterTabsBar
          tabs={tabs}
          selectedId={selectedSubjectId}
          onSelect={onSelectSubject}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
  },
});
