import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useProfileScreen } from '@/hooks/useProfileScreen';
import { ProfileHeaderBar } from '@/components/molecules/ProfileHeaderBar';
import { FeaturedContentCard } from '@/components/home/FeaturedContentCard';
import { EducationalSummaryGrid } from '@/components/molecules/EducationalSummaryGrid';
import { TeacherNewestVideosSection } from '@/components/organisms/TeacherNewestVideosSection';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const {
    userName,
    continueWatchingVideo,
    followedSubjectsCount,
    followedTeachersCount,
    usedCodesCount,
    libraryVideosCount,
    newestVideos,
    isLoading,
    isRefreshing,
    onRefresh,
    handleContinueWatchingPress,
  } = useProfileScreen();

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
        <ProfileHeaderBar userName={userName} />

        <FeaturedContentCard
          video={continueWatchingVideo}
          onPress={handleContinueWatchingPress}
        />

        <EducationalSummaryGrid
          followedSubjectsCount={followedSubjectsCount}
          followedTeachersCount={followedTeachersCount}
          libraryVideosCount={libraryVideosCount}
          usedCodesCount={usedCodesCount}
        />

        <TeacherNewestVideosSection videos={newestVideos} />

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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
