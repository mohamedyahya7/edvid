import React from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoCard } from '@/components/molecules/VideoCard';
import { EmptyStateView } from '@/components/molecules/EmptyStateView';
import { LibraryFilterType, LibraryVideoItem } from '@/types/library';

interface LibraryVideoListProps {
  videos: LibraryVideoItem[];
  isRefreshing: boolean;
  onRefresh: () => void;
  activeFilter: LibraryFilterType;
  hasActiveSubFilters: boolean;
  onResetFilters: () => void;
  onExplore: () => void;
  onOpenVideo: (video: LibraryVideoItem) => void;
  onOpenTeacher: (teacherId: string | number) => void;
  onRemoveDownload: (video: LibraryVideoItem) => void;
}

export const LibraryVideoList: React.FC<LibraryVideoListProps> = ({
  videos,
  isRefreshing,
  onRefresh,
  activeFilter,
  hasActiveSubFilters,
  onResetFilters,
  onExplore,
  onOpenVideo,
  onOpenTeacher,
  onRemoveDownload,
}) => {
  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#00C897"
          colors={['#00C897']}
        />
      }
      renderItem={({ item }) => {
        const isOffline =
          item.effective_download_status === 'COMPLETED' ||
          item.download_status === 'COMPLETED';

        return (
          <View style={styles.cardWrapper}>
            <VideoCard
              id={item.id}
              title={item.title}
              youtubeId={item.youtube_id}
              thumbnailUrl={item.thumbnail}
              durationSeconds={item.duration_seconds}
              videoType={item.video_type || item.type || 'free'}
              statusBadgeLabel={isOffline ? 'أوفلاين' : 'متاح للمشاهدة'}
              statusBadgeColor={isOffline ? '#2ECC71' : '#3498DB'}
              teacherId={item.teacher_id}
              teacherName={item.teacher_name}
              teacherImage={item.teacher_image || item.teacher_profile_picture_url}
              subjectName={item.subject_name}
              variant="list"
              onPressVideo={() => onOpenVideo(item)}
              onPressTeacher={() => item.teacher_id && onOpenTeacher(item.teacher_id)}
              renderAction={() =>
                isOffline ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onRemoveDownload(item)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={17} color="#E74C3C" />
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyStateView
          hasActiveFilters={hasActiveSubFilters}
          isOfflineOnly={activeFilter === 'offline'}
          onResetFilters={onResetFilters}
          onExplore={onExplore}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  cardWrapper: {
    marginBottom: 10,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
});
