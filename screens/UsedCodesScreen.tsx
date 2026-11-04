import React from 'react';
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

import { useUsedCodes } from '@/hooks/useUsedCodes';
import { UsedCodeCard } from '@/components/molecules/UsedCodeCard';
import { UsedCodesHeader } from '@/components/organisms/UsedCodesHeader';
import { EmptyStateView } from '@/components/molecules/EmptyStateView';

export default function UsedCodesScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    usedCodes,
    displayedCodes,
    loading,
    isRefreshing,
    selectedFilter,
    setSelectedFilter,
    searchQuery,
    setSearchQuery,
    watchCount,
    downloadCount,
    onRefresh,
  } = useUsedCodes();

  const handleOpenVideo = (videoId: string | number) => {
    if (!videoId) return;
    router.push(`/video/${videoId}`);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />

      <UsedCodesHeader
        totalCount={usedCodes.length}
        watchCount={watchCount}
        downloadCount={downloadCount}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        onBack={() => router.back()}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedCodes}
          renderItem={({ item }) => (
            <UsedCodeCard item={item} onPress={handleOpenVideo} />
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
              iconName="key-outline"
              title={
                searchQuery.trim()
                  ? 'لا توجد أكواد مطابقة للبحث'
                  : 'لا توجد أكواد تفعيل مسجلة حالياً'
              }
              subtitle={
                searchQuery.trim()
                  ? 'جرّب البحث برمز كود آخر أو جزء من اسم الحصة.'
                  : 'عند تفعيل أي حصة أو كورس عبر الكود ستظهر تفاصيلها وصلاحيتها هنا.'
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
});
