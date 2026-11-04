import React from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useSubjectsScreen } from '@/hooks/useSubjectsScreen';
import { SubjectItem } from '@/components/molecules/SubjectItem';
import { SubjectListSkeleton } from '@/components/molecules/SubjectListSkeleton';
import { SubjectsHeader } from '@/components/organisms/SubjectsHeader';

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
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="book-outline" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>لا توجد نتائج</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `لم نجد أي مادة مطابقة لبحث "${searchQuery}"`
                  : activeTab === 'followed'
                  ? 'لم تقم بمتابعة أي مادة حتى الآن'
                  : 'لا توجد مواد مسجلة حالياً'}
              </Text>
            </View>
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
});
