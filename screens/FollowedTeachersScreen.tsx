import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';

import { useFollowedTeachersScreen } from '@/hooks/useFollowedTeachersScreen';
import { FollowedTeacherCard } from '@/components/molecules/FollowedTeacherCard';
import { FollowedTeachersHeader } from '@/components/organisms/FollowedTeachersHeader';
import { EmptyStateView } from '@/components/molecules/EmptyStateView';

export default function FollowedTeachersScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    allFollowedTeachers,
    displayedTeachers,
    subjectTabs,
    selectedSubjectId,
    setSelectedSubjectId,
    searchQuery,
    setSearchQuery,
    isLoading,
    isRefreshing,
    onRefresh,
    handleUnfollow,
  } = useFollowedTeachersScreen();

  const handleNavigateToTeacher = useCallback(
    (id: string) => {
      router.push({
        pathname: '/teacher/[id]',
        params: { id },
      });
    },
    [router]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />

      <FollowedTeachersHeader
        totalCount={allFollowedTeachers.length}
        subjectTabs={subjectTabs}
        selectedSubjectId={selectedSubjectId}
        onSelectSubjectId={setSelectedSubjectId}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        onBack={() => router.back()}
        onExploreAll={() => router.push('/all-teachers')}
      />

      {isLoading && allFollowedTeachers.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedTeachers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <FollowedTeacherCard
              teacher={item}
              onUnfollow={handleUnfollow}
              onPress={handleNavigateToTeacher}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyStateView
              iconName="people-outline"
              title={
                searchQuery.trim()
                  ? 'لا يوجد مدرس مطابق لبحثك'
                  : 'أنت لا تتابع أي معلمين حالياً'
              }
              subtitle={
                searchQuery.trim()
                  ? 'جرّب كتابة اسم آخر أو مادة مختلفة.'
                  : 'تابع نخبة معلمي المواد الدراسية لتصلك حصصهم وإشعاراتهم أولاً بأول.'
              }
              actionLabel={!searchQuery.trim() ? 'استكشف المعلمين' : undefined}
              actionIcon="compass-outline"
              onAction={() => router.push('/all-teachers')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
