import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTeacherProfileScreen } from '@/hooks/useTeacherProfileScreen';
import { TeacherHeroHeader } from '@/components/molecules/TeacherHeroHeader';
import { TeacherBioSection } from '@/components/molecules/TeacherBioSection';
import { TeacherLessonsSection } from '@/components/organisms/TeacherLessonsSection';
import { ActionButton } from '@/components/atoms/ActionButton';

export default function TeacherProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    teacher,
    videos,
    isLoading,
    freeLessonsCount,
    handleToggleFollow,
    handleWhatsApp,
  } = useTeacherProfileScreen();

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
      style={[styles.container, { backgroundColor: colors.background }]}>
      <TeacherHeroHeader
        teacherImage={teacher.profile_picture_url}
        teacherName={teacher.name}
        subjectName={teacher.subject_name}
        hasWhatsApp={Boolean(teacher.phone)}
        onBack={() => router.back()}
        onWhatsApp={handleWhatsApp}
      />

      <TeacherBioSection
        bio={teacher.bio}
        isFollowed={Boolean(teacher.is_followed)}
        totalLessonsCount={videos.length}
        freeLessonsCount={freeLessonsCount}
        hasWhatsApp={Boolean(teacher.phone)}
        onToggleFollow={handleToggleFollow}
        onWhatsApp={handleWhatsApp}
      />

      <TeacherLessonsSection
        videos={videos}
        onOpenVideo={(id) => router.push({ pathname: '/video/[id]', params: { id } })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
