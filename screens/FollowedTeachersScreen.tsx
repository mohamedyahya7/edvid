import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useFollowedTeachersScreen } from '@/hooks/useFollowedTeachersScreen';
import { FollowedTeacherCard } from '@/components/molecules/FollowedTeacherCard';
import { FollowedTeachersHeader } from '@/components/organisms/FollowedTeachersHeader';

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
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="people-outline" size={36} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {searchQuery.trim()
                  ? 'لا يوجد مدرس مطابق لبحثك'
                  : 'أنت لا تتابع أي معلمين حالياً'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery.trim()
                  ? 'جرّب كتابة اسم آخر أو مادة مختلفة.'
                  : 'تابع نخبة معلمي المواد الدراسية لتصلك حصصهم وإشعاراتهم أولاً بأول.'}
              </Text>
              {!searchQuery.trim() && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/all-teachers')}
                  style={[styles.discoverBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.discoverBtnText}>استكشف المعلمين</Text>
                </TouchableOpacity>
              )}
            </View>
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
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  discoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 6,
  },
  discoverBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
