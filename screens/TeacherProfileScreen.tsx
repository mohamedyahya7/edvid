import React, { useEffect, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTeacherProfileScreen } from '@/hooks/useTeacherProfileScreen';
import { toggleFollowTeacher } from '@/lib/db/queries/teacher.queries';
import { TeacherHeroHeader } from '@/components/molecules/TeacherHeroHeader';
import { TeacherBioSection } from '@/components/molecules/TeacherBioSection';
import { TeacherLessonsSection } from '@/components/organisms/TeacherLessonsSection';
import { ActionButton } from '@/components/atoms/ActionButton';

export default function TeacherProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const db = useSQLiteContext();

  const { teacher, videos, isLoading, setTeacher } = useTeacherProfileScreen();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleToggleFollow = useCallback(async () => {
    if (!teacher) return;
    const newFollowStatus = !teacher.is_followed;
    await toggleFollowTeacher(db, teacher.id, newFollowStatus);
    // Optimistic UI state update
    setTeacher({ ...teacher, is_followed: newFollowStatus });
  }, [teacher, db, setTeacher]);

  const handleWhatsApp = useCallback(() => {
    if (teacher?.phone) {
      const cleanPhone = teacher.phone.toString().replace(/[^0-9]/g, '');
      const fullPhone = cleanPhone.startsWith('2') ? cleanPhone : `2${cleanPhone}`;
      Linking.openURL(`https://wa.me/+${fullPhone}`);
    }
  }, [teacher?.phone]);

  const handleOpenVideo = useCallback(
    (id: string) => {
      router.push({
        pathname: '/video/[id]',
        params: { id },
      });
    },
    [router]
  );

  const freeLessonsCount = useMemo(
    () => videos.filter((v) => v.video_type === 'free').length,
    [videos]
  );

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          لم يتم العثور على بيانات المعلم.
        </Text>
        <ActionButton
          title="العودة للخلف"
          onPress={() => router.back()}
          variant="primary"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Hero Cover Header with Top Action Bar */}
      <TeacherHeroHeader
        teacherImage={teacher.profile_picture_url}
        teacherName={teacher.name}
        subjectName={teacher.subject_name}
        hasWhatsApp={Boolean(teacher.phone)}
        onBack={() => router.back()}
        onWhatsApp={handleWhatsApp}
      />

      {/* 2. Floating Teacher Bio Card with Follow Action & Metrics */}
      <TeacherBioSection
        bio={teacher.bio}
        isFollowed={Boolean(teacher.is_followed)}
        totalLessonsCount={videos.length}
        freeLessonsCount={freeLessonsCount}
        hasWhatsApp={Boolean(teacher.phone)}
        onToggleFollow={handleToggleFollow}
        onWhatsApp={handleWhatsApp}
      />

      {/* 3. Comprehensive Lessons List */}
      <TeacherLessonsSection
        videos={videos}
        onOpenVideo={handleOpenVideo}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
