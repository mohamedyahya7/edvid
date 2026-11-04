import React from 'react';
import {
  ActivityIndicator,
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

import { useUsedCodes } from '@/hooks/useUsedCodes';
import { UsedCodeCard } from '@/components/molecules/UsedCodeCard';
import { UsedCodesHeader } from '@/components/organisms/UsedCodesHeader';

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
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="key-outline" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {searchQuery.trim()
                  ? 'لا توجد أكواد مطابقة للبحث'
                  : 'لا توجد أكواد تفعيل مسجلة حالياً'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery.trim()
                  ? 'جرّب البحث برمز كود آخر أو جزء من اسم الحصة.'
                  : 'عند تفعيل أي حصة أو كورس عبر الكود ستظهر تفاصيلها وصلاحيتها هنا.'}
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
