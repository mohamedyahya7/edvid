import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { VideoModel } from '@/types/video';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { VideoCard } from '@/components/molecules/VideoCard';

interface OtherVideosSectionProps {
  videos: VideoModel[];
  currentVideoId?: string | number;
}

export const OtherVideosSection: React.FC<OtherVideosSectionProps> = ({
  videos,
  currentVideoId,
}) => {
  const router = useRouter();

  if (!videos || videos.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Standard Atomic SectionHeader matching ExploreScreen */}
      <SectionHeader
        title="فهرس محاضرات الكورس"
        subtitle="جميع حصص ودروس الدورة التدريبية"
        iconName="layers-outline"
        count={videos.length}
      />

      <View style={styles.gridContainer}>
        {videos.map((item, index) => {
          const isCurrent = currentVideoId && String(currentVideoId) === String(item.id);
          const lessonNumber = `المحاضرة 0${index + 2}`;

          return (
            <View key={item.id.toString()} style={styles.cardCol}>
              <VideoCard
                id={item.id.toString()}
                title={item.title}
                youtubeId={item.youtube_id}
                thumbnailUrl={item.thumbnail}
                durationSeconds={item.duration_seconds}
                videoType={item.video_type}
                isCurrent={Boolean(isCurrent)}
                lessonOrder={lessonNumber}
                statusBadgeLabel={item.video_type === 'paid' ? 'كود شحن' : 'متاح للجميع'}
                onPressVideo={() =>
                  router.replace({
                    pathname: '/video/[id]',
                    params: { id: item.id.toString() },
                  })
                }
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 28,
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
});
