import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useLibraryVideos } from '@/hooks/useLibraryVideos';
import { useLibraryFilters } from '@/hooks/useLibraryFilters';
import { useLibraryActions } from '@/hooks/useLibraryActions';
import { LibraryStorageHeader } from '@/components/organisms/LibraryStorageHeader';
import { LibraryFilterSection } from '@/components/organisms/LibraryFilterSection';
import { LibraryVideoList } from '@/components/organisms/LibraryVideoList';

export default function LibraryScreen() {
  const { colors } = useTheme();
  const { videos, loading, isRefreshing, storageStats, onRefresh, reload } = useLibraryVideos();
  const filters = useLibraryFilters(videos);
  const actions = useLibraryActions(reload);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LibraryStorageHeader
        totalVideosCount={videos.length}
        usedBytes={storageStats.usedBytes}
        downloadedCount={storageStats.downloadedCount}
        onRefresh={onRefresh}
      />

      <LibraryFilterSection
        searchQuery={filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
        activeFilter={filters.activeFilter}
        onFilterChange={filters.setActiveFilter}
        allCount={videos.length}
        offlineCount={filters.offlineCount}
        streamCount={filters.streamCount}
        subjectOptions={filters.subjectOptions}
        selectedSubject={filters.selectedSubject}
        onSelectSubject={filters.setSelectedSubject}
        statusFilteredCount={filters.statusFilteredVideos.length}
        teacherOptions={filters.teacherOptions}
        selectedTeacherId={filters.selectedTeacherId}
        onSelectTeacher={filters.setSelectedTeacherId}
        subjectFilteredCount={filters.statusFilteredVideos.length}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C897" />
          <Text style={[styles.loadingText, { color: colors.text }]}>جاري تحميل مكتبتك...</Text>
        </View>
      ) : (
        <LibraryVideoList
          videos={filters.filteredVideos}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          activeFilter={filters.activeFilter}
          hasActiveSubFilters={filters.hasActiveSubFilters}
          onResetFilters={filters.resetAllFilters}
          onExplore={actions.handleExplore}
          onOpenVideo={actions.handleOpenVideo}
          onOpenTeacher={actions.handleOpenTeacher}
          onRemoveDownload={actions.handleRemoveDownload}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
