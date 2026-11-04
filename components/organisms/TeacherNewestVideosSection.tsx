import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { VideoCard } from '@/components/molecules/VideoCard';
import { Video } from '@/lib/store/types';

interface TeacherNewestVideosSectionProps {
  videos: Video[];
}

export const TeacherNewestVideosSection: React.FC<TeacherNewestVideosSectionProps> = ({ videos }) => {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <SectionHeader
        title="جديد من معلميك"
        subtitle="أحدث الحصص والدروس من المدرسين الذين تتابعهم"
        iconName="sparkles-outline"
        onShowAll={() => router.push('/all-teachers')}
        showAllText="كل المدرسين"
      />

      {videos.length > 0 ? (
        <View style={styles.grid}>
          {videos.map((video) => {
            const videoType = video.video_type || (video as any).type || 'free';
            const teacherId = video.teacher_id ? video.teacher_id.toString() : null;
            const ytId =
              video.youtube_id ||
              ((video as any).youtube_url
                ? ((video as any).youtube_url.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1]
                : null) ||
              'dQw4w9WgXcQ';

            return (
              <View key={video.id.toString()} style={styles.col}>
                <VideoCard
                  id={video.id.toString()}
                  title={video.title}
                  youtubeId={ytId}
                  thumbnailUrl={video.thumbnail}
                  videoType={videoType}
                  teacherId={teacherId}
                  teacherName={video.teacher_name}
                  teacherImage={video.teacher_profile_picture_url || video.teacher_image}
                  subjectName={video.subject_name ? String(video.subject_name) : undefined}
                  durationSeconds={video.duration_seconds}
                  onPressVideo={() => router.push(`/video/${video.id}`)}
                  onPressTeacher={
                    teacherId
                      ? () => router.push({ pathname: '/teacher/[id]', params: { id: teacherId } })
                      : undefined
                  }
                />
              </View>
            );
          })}
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="people-outline" size={26} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            لم يقم معلموك بنشر حصص جديدة بعد
          </Text>
          <Text style={styles.emptySubtitle}>
            تابع نخبة مدرسي المواد الدراسية لتصلك أحدث فيديوهاتهم وحصصهم هنا أولاً بأول.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/all-teachers')}
            style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
            <Text style={styles.exploreBtnText}>استكشف المعلمين</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  grid: {
    gap: 12,
    marginTop: 10,
  },
  col: {
    width: '100%',
  },
  emptyCard: {
    marginTop: 12,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
