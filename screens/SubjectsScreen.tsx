import React from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';

import { useSubjectsScreen } from '@/hooks/useSubjectsScreen';
import { SubjectItem } from '@/components/molecules/SubjectItem';
import { SubjectListSkeleton } from '@/components/molecules/SubjectListSkeleton';
import { SubjectsHeader } from '@/components/organisms/SubjectsHeader';
import { EmptyStateView } from '@/components/molecules/EmptyStateView';

export default function SubjectsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    subjects,
    filteredSubjects,
    loading,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    followedCount,
    onRefresh,
    handleToggleFollow,
  } = useSubjectsScreen();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />

      <SubjectsHeader
        totalCount={subjects.length}
        followedCount={followedCount}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        onBack={() => router.back()}
      />

      {loading ? (
        <SubjectListSkeleton />
      ) : (
        <FlatList
          data={filteredSubjects}
          renderItem={({ item }) => (
            <SubjectItem item={item} onToggleFollow={handleToggleFollow} />
          )}
          keyExtractor={(item) => item.id.toString()}
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
              iconName="book-outline"
              title="لا توجد نتائج"
              subtitle={
                searchQuery
                  ? `لم نجد أي مادة مطابقة لبحث "${searchQuery}"`
                  : activeTab === 'followed'
                  ? 'لم تقم بمتابعة أي مادة حتى الآن'
                  : 'لا توجد مواد مسجلة حالياً'
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
});
