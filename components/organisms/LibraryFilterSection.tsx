import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FilterChipGroup } from '@/components/molecules/FilterChipGroup';
import { SearchBar } from '@/components/atoms/SearchBar';
import { LibraryFilterType, LibrarySubjectOption, LibraryTeacherOption } from '@/types/library';

interface LibraryFilterSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: LibraryFilterType;
  onFilterChange: (f: LibraryFilterType) => void;
  allCount: number;
  offlineCount: number;
  streamCount: number;
  subjectOptions: LibrarySubjectOption[];
  selectedSubject: string | null;
  onSelectSubject: (name: string | null) => void;
  statusFilteredCount: number;
  teacherOptions: LibraryTeacherOption[];
  selectedTeacherId: string | null;
  onSelectTeacher: (id: string | null) => void;
  subjectFilteredCount: number;
}

export const LibraryFilterSection: React.FC<LibraryFilterSectionProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  allCount,
  offlineCount,
  streamCount,
  subjectOptions,
  selectedSubject,
  onSelectSubject,
  statusFilteredCount,
  teacherOptions,
  selectedTeacherId,
  onSelectTeacher,
  subjectFilteredCount,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Reusable Search Bar */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="ابحث في مكتبتك عن درس أو مدرس..."
        />
      </View>

      {/* Primary Type Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onFilterChange('all')}
          style={[
            styles.tab,
            activeFilter === 'all'
              ? [styles.activeTab, { backgroundColor: colors.primary }]
              : [styles.inactiveTab, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Text style={[styles.tabText, activeFilter === 'all' ? styles.activeTabText : { color: colors.text }]}>
            الكل ({allCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onFilterChange('offline')}
          style={[
            styles.tab,
            activeFilter === 'offline'
              ? [styles.activeTab, { backgroundColor: colors.primary }]
              : [styles.inactiveTab, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Ionicons
            name="cloud-done-outline"
            size={14}
            color={activeFilter === 'offline' ? '#FFFFFF' : '#2ECC71'}
          />
          <Text style={[styles.tabText, activeFilter === 'offline' ? styles.activeTabText : { color: colors.text }]}>
            أوفلاين ({offlineCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onFilterChange('stream')}
          style={[
            styles.tab,
            activeFilter === 'stream'
              ? [styles.activeTab, { backgroundColor: colors.primary }]
              : [styles.inactiveTab, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Ionicons
            name="play-circle-outline"
            size={14}
            color={activeFilter === 'stream' ? '#FFFFFF' : '#3498DB'}
          />
          <Text style={[styles.tabText, activeFilter === 'stream' ? styles.activeTabText : { color: colors.text }]}>
            مشاهدة ({streamCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Subject Filter Row */}
      {subjectOptions.length > 0 && (
        <FilterChipGroup
          iconName="book-outline"
          label="المادة"
          allLabel="كل المواد"
          totalCount={statusFilteredCount}
          items={subjectOptions.map((s) => ({ id: s.name, name: s.name, count: s.count }))}
          selectedId={selectedSubject}
          onSelect={onSelectSubject}
        />
      )}

      {/* Teacher Filter Row */}
      {teacherOptions.length > 0 && (
        <FilterChipGroup
          iconName="person-outline"
          label="المعلم"
          allLabel="كل المعلمين"
          totalCount={subjectFilteredCount}
          items={teacherOptions.map((t) => ({ id: t.id, name: t.name, count: t.count }))}
          selectedId={selectedTeacherId}
          onSelect={onSelectTeacher}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
  },
  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 14,
    gap: 5,
  },
  activeTab: {},
  inactiveTab: {
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
