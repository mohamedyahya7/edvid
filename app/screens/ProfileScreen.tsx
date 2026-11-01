import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/store/authStore';
import { Video } from '@/lib/store/types';
import { getFollowedSubjectsCount } from '@/lib/db/queries/subject.queries';
import { getFollowedTeachersCount } from '@/lib/db/queries/teacher.queries';
import { getUsedCodesCount } from '@/lib/db/queries/usedCodes.queries';
import {
  getContinueWatchingVideo,
  getLibraryVideosCount,
  getNewestVideosFromFollowedTeachers,
} from '@/lib/db/queries/video.queries';
import { ActivationService } from '@/api/ActivationService';
import { SyncService } from '@/services/SyncService';
import { FeaturedContentCard } from '@/components/home/FeaturedContentCard';
import { InfoRowCard } from '@/components/home/InfoRowCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { VideoCard } from '@/components/molecules/VideoCard';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const db = useSQLiteContext();
  const isFocused = useIsFocused();

  const user = useAuthStore((state) => state.user);
  const lastSyncTimestamp = useAppStore((state) => state.lastSyncTimestamp);
  const lastDownloadCompletedTimestamp = useAppStore(
    (state) => state.lastDownloadCompletedTimestamp
  );

  const [continueWatchingVideo, setContinueWatchingVideo] = useState<Video | null>(null);
  const [followedSubjectsCount, setFollowedSubjectsCount] = useState(0);
  const [followedTeachersCount, setFollowedTeachersCount] = useState(0);
  const [usedCodesCount, setUsedCodesCount] = useState(0);
  const [libraryVideosCount, setLibraryVideosCount] = useState(0);
  const [newestVideos, setNewestVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [
        videoRes,
        subjectsCountRes,
        teachersCountRes,
        codesCountRes,
        videosCountRes,
        newestRes,
      ] = await Promise.allSettled([
        getContinueWatchingVideo(db),
        getFollowedSubjectsCount(db),
        getFollowedTeachersCount(db),
        getUsedCodesCount(db),
        getLibraryVideosCount(db),
        getNewestVideosFromFollowedTeachers(db),
      ]);

      if (videoRes.status === 'fulfilled') setContinueWatchingVideo(videoRes.value);
      if (subjectsCountRes.status === 'fulfilled') setFollowedSubjectsCount(subjectsCountRes.value);
      if (teachersCountRes.status === 'fulfilled') setFollowedTeachersCount(teachersCountRes.value);
      if (codesCountRes.status === 'fulfilled') setUsedCodesCount(codesCountRes.value);
      if (videosCountRes.status === 'fulfilled') setLibraryVideosCount(videosCountRes.value);
      if (newestRes.status === 'fulfilled') setNewestVideos(newestRes.value || []);
    } catch (e) {
      console.warn('ProfileScreen fetchData error:', e);
    }
  }, [db]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, fetchData, lastSyncTimestamp, lastDownloadCompletedTimestamp]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await SyncService.run(db, true);
    } catch (e) {
      console.warn('ProfileScreen sync error:', e);
    }
    await fetchData();
    setIsRefreshing(false);
  }, [db, fetchData]);

  const handleContinueWatchingPress = async (video: Video) => {
    if (!video) return;

    // Case 1: Downloaded or regular/free video, navigate directly
    if (
      video.access_type !== 'watch' ||
      video.download_status === 'COMPLETED' ||
      video.video_type === 'free'
    ) {
      router.push(`/video/${video.id}`);
      return;
    }

    // Case 2: "Watch" type video with activation code
    if (video.access_type === 'watch') {
      if (!video.activation_code) {
        Alert.alert('تنبيه', 'رمز التفعيل الخاص بهذا الدرس غير متوفر.');
        return;
      }
      if ((video.watch_count || 0) <= 0) {
        Alert.alert('انتهت المشاهدات', 'لقد استنفدت عدد مرات المشاهدة المتاحة لهذا الكود.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await ActivationService.requestDownloadLinks(
          video.activation_code,
          '360',
          'watch'
        );

        if ('url' in response) {
          router.push({
            pathname: '/video/[id]',
            params: { id: video.id, streamUrl: response.url },
          });
        } else {
          Alert.alert('خطأ', (response as any).message || 'تعذر الحصول على رابط المشاهدة.');
        }
      } catch (e: any) {
        Alert.alert('خطأ', e.message || 'حدث خطأ أثناء الاتصال بالخادم.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const userName = user?.name ? user.name : 'طالب بامبو';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Top Header Profile Bar */}
        <View style={[styles.topProfileBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.userInfoWrap}
            onPress={() => router.push('/screens/EditProfileScreen')}
          >
            <View style={[styles.avatarPill, { backgroundColor: `${colors.primary}18`, borderColor: colors.border }]}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
            <View style={styles.userTextCol}>
              <Text style={styles.greetingText}>مرحباً بك 👋</Text>
              <Text style={[styles.userNameText, { color: colors.text }]} numberOfLines={1}>
                {userName}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/screens/EditProfileScreen')}
            style={[styles.profileSettingsBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <Ionicons name="settings-outline" size={19} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* 1. Continue Watching Section */}
        <FeaturedContentCard
          video={continueWatchingVideo}
          onPress={handleContinueWatchingPress}
        />

        {/* 2. Educational Summary / Stats Section */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            title="ملخصك التعليمي"
            subtitle="نظرة عامة على نشاطك وموادك المفعلة"
            iconName="stats-chart-outline"
          />
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <InfoRowCard
                iconName="book-outline"
                title="موادك"
                subtitle={`${followedSubjectsCount} مادة متبوعة`}
                onPress={() => router.push('/subjects')}
              />
              <InfoRowCard
                iconName="people-outline"
                title="مدرسينك"
                subtitle={`${followedTeachersCount} مدرس`}
                onPress={() => router.push('/teachers')}
              />
            </View>
            <View style={styles.statsRow}>
              <InfoRowCard
                iconName="folder-outline"
                title="مكتبتك"
                subtitle={`${libraryVideosCount} درس محفوظ`}
                onPress={() => router.push('/(tabs)/library')}
              />
              <InfoRowCard
                iconName="key-outline"
                title="أكوادك"
                subtitle={`${usedCodesCount} كود مفعل`}
                onPress={() => router.push('/used-codes')}
              />
            </View>
          </View>
        </View>

        {/* 3. Newest from Followed Teachers */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            title="جديد من معلميك"
            subtitle="أحدث الحصص والدروس من المدرسين الذين تتابعهم"
            iconName="sparkles-outline"
            onShowAll={() => router.push('/all-teachers')}
            showAllText="كل المدرسين"
          />

          {newestVideos.length > 0 ? (
            <View style={styles.videosGrid}>
              {newestVideos.map((video) => {
                const videoType = video.video_type || (video as any).type || 'free';
                const teacherId = video.teacher_id ? video.teacher_id.toString() : null;
                const ytId = video.youtube_id || ((video as any).youtube_url ? ((video as any).youtube_url.match(/(?:youtu\.be\/|v=)([\w-]{11})/) || [])[1] : null) || 'dQw4w9WgXcQ';

                return (
                  <View key={video.id.toString()} style={styles.videoGridCol}>
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
            <View style={[styles.emptyTeachersCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="people-outline" size={26} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTeachersTitle, { color: colors.text }]}>
                لم يقم معلموك بنشر حصص جديدة بعد
              </Text>
              <Text style={styles.emptyTeachersSubtitle}>
                تابع نخبة مدرسي المواد الدراسية لتصلك أحدث فيديوهاتهم وحصصهم هنا أولاً بأول.
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/all-teachers')}
                style={[styles.exploreTeachersBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
                <Text style={styles.exploreTeachersBtnText}>استكشف المعلمين</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  topProfileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  userInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextCol: {
    gap: 2,
    alignItems: 'flex-start',
  },
  greetingText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '800',
    writingDirection: 'rtl',
  },
  profileSettingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionWrap: {
    marginTop: 6,
    marginBottom: 8,
  },
  statsGrid: {
    paddingHorizontal: 16,
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  videosGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  videoGridCol: {
    width: '48.5%',
    marginBottom: 4,
  },
  emptyTeachersCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  emptyTeachersTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyTeachersSubtitle: {
    fontSize: 11.5,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  exploreTeachersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  exploreTeachersBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
});
