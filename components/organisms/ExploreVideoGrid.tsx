import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { VideoCard } from '@/components/molecules/VideoCard';

interface ExploreVideoGridProps {
  videos: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  isFetchingMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onOpenVideo: (id: string) => void;
  onNavigateToTeacher: (id: string) => void;
  ListHeaderComponent: React.ReactElement;
}

export const ExploreVideoGrid: React.FC<ExploreVideoGridProps> = ({
  videos,
  isLoading,
  isRefreshing,
  isFetchingMore,
  onRefresh,
  onLoadMore,
  onOpenVideo,
  onNavigateToTeacher,
  ListHeaderComponent,
}) => {
  const { colors } = useTheme();

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.columnWrapper}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListFooterComponent={
        isFetchingMore ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.footerLoader}
          />
        ) : null
      }
      ListEmptyComponent={
        !isLoading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={40} color="#8E8E93" style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              لا توجد دروس مطابقة للفلتر المحدد حالياً.
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => {
        const videoType = item.video_type || item.type;
        if (videoType !== 'free') return null;

        const teacherId = item.teacher_id ? item.teacher_id.toString() : null;

        return (
          <View style={styles.cardCol}>
            <VideoCard
              id={item.id.toString()}
              title={item.title}
              youtubeId={item.youtube_id}
              thumbnailUrl={item.thumbnail || item.image}
              videoType={videoType}
              teacherId={teacherId}
              teacherName={item.teacher_name}
              teacherImage={item.teacher_image || item.teacher_profile_picture_url}
              subjectName={item.subject_name || item.teacher_subject}
              durationSeconds={item.duration_seconds}
              onPressVideo={() => onOpenVideo(item.id.toString())}
              onPressTeacher={teacherId ? () => onNavigateToTeacher(teacherId) : undefined}
            />
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 10,
  },
  cardCol: {
    flex: 1,
    maxWidth: '50%',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
