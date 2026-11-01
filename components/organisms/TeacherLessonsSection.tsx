import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { VideoModel } from '@/types/video';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { VideoCard } from '@/components/molecules/VideoCard';

interface TeacherLessonsSectionProps {
  videos: any[];
  onOpenVideo: (id: string) => void;
  teacherName?: string;
}

export const TeacherLessonsSection = React.memo<TeacherLessonsSectionProps>(({
  videos,
  onOpenVideo,
  teacherName,
}) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'free' | 'paid'>('all');

  const filteredVideos = videos.filter((v) => {
    if (activeTab === 'free') return v.video_type === 'free';
    if (activeTab === 'paid') return v.video_type === 'paid';
    return true;
  });

  const freeCount = videos.filter((v) => v.video_type === 'free').length;
  const paidCount = videos.filter((v) => v.video_type === 'paid').length;

  return (
    <View style={styles.container}>
      {/* Unified SectionHeader */}
      <SectionHeader
        title="محاضرات ودورات المدرس"
        subtitle={`جميع الحصص المتاحة (${videos.length} محاضرة)`}
        iconName="play-circle-outline"
        count={videos.length}
      />

      {/* Filter Tabs: row-reverse places 'All' on Right, 'Paid' on Left */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('all')}
          style={[
            styles.tabPill,
            activeTab === 'all'
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'all' ? '#FFFFFF' : colors.text },
            ]}
          >
            الكل ({videos.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('free')}
          style={[
            styles.tabPill,
            activeTab === 'free'
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'free' ? '#FFFFFF' : colors.text },
            ]}
          >
            مجانية ({freeCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('paid')}
          style={[
            styles.tabPill,
            activeTab === 'paid'
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'paid' ? '#FFFFFF' : colors.text },
            ]}
          >
            مدفوعة ({paidCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid of Canonical VideoCards */}
      <View style={styles.gridContainer}>
        {filteredVideos.map((video) => {
          const vType = video.video_type || video.type || 'free';
          const ytId = video.youtube_id || (video.youtube_url ? (video.youtube_url.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1] : null) || 'dQw4w9WgXcQ';

          return (
            <View key={video.id.toString()} style={styles.cardCol}>
              <VideoCard
                id={video.id.toString()}
                title={video.title}
                youtubeId={ytId}
                thumbnailUrl={video.thumbnail}
                durationSeconds={video.duration_seconds}
                videoType={vType}
                statusBadgeLabel={vType === 'paid' ? 'كود شحن' : 'مجاني'}
                onPressVideo={() => onOpenVideo(video.id.toString())}
              />
            </View>
          );
        })}
      </View>

      {filteredVideos.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            لا توجد محاضرات في هذا القسم حالياً.
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingBottom: 36,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  cardCol: {
    width: '48.5%',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
});
