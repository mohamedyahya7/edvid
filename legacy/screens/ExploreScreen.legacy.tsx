import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useExploreScreen } from '@/hooks/useExploreScreen';
import { ExploreHeader } from '@/components/organisms/ExploreHeader';
import { VideoCard } from '@/components/molecules/VideoCard';
import { SyncService } from '@/services/SyncService';
import { useSQLiteContext } from 'expo-sqlite';
import ActivationModal from '@/components/organisms/ActivationModal';

export default function ExploreScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const db = useSQLiteContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    subjects,
    suggestedTeachers,
    totalSubjectTeachersCount,
    freeVideos,
    isLoading,
    selectedSubjectId,
    selectedTeacherIds,
    isFetchingMore,
    toggleSubjectFilter,
    toggleTeacherFilter,
    clearFilters,
    handleLoadMore,
    refetchData,
  } = useExploreScreen();

  useEffect(() => {
    if (isFocused) {
      refetchData();
    }
  }, [isFocused, refetchData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await SyncService.run(db, true);
    } catch (e) {
      console.warn('SyncService refresh error:', e);
    }
    await refetchData();
    setIsRefreshing(false);
  }, [db, refetchData]);

  const handleNavigateToTeacher = useCallback(
    (id: string) => {
      router.push({
        pathname: '/teacher/[id]',
        params: { id },
      });
    },
    [router]
  );

  const handleNavigateToAllTeachers = useCallback(() => {
    router.push({
      pathname: '/all-teachers',
      params: selectedSubjectId ? { subjectId: selectedSubjectId } : undefined,
    });
  }, [router, selectedSubjectId]);

  const handleOpenVideo = useCallback(
    (id: string) => {
      router.push({
        pathname: '/video/[id]',
        params: { id },
      });
    },
    [router]
  );

  const renderVideoItem = useCallback(
    ({ item }: { item: any }) => {
      const videoType = item.video_type || item.type;
      if (videoType !== 'free') return null;

      const teacherId = item.teacher_id ? item.teacher_id.toString() : null;

      return (
        <View style={styles.cardCol}>
          <VideoCard
            id={item.id.toString()}
            title={item.title}
            youtubeId={item.youtube_id}
            thumbnailUrl={item.thumbnail || item.image}
            videoType={videoType}
            teacherId={teacherId}
            teacherName={item.teacher_name}
            teacherImage={item.teacher_image || item.teacher_profile_picture_url}
            subjectName={item.subject_name || item.teacher_subject}
            durationSeconds={item.duration_seconds}
            onPressVideo={() => handleOpenVideo(item.id.toString())}
            onPressTeacher={
              teacherId ? () => handleNavigateToTeacher(teacherId) : undefined
            }
          />
        </View>
      );
    },
    [handleOpenVideo, handleNavigateToTeacher]
  );

  const listHeader = useMemo(
    () => (
      <>
        {/* Top App Bar Header: Right = Brand & Logo, Left = QR Scanner */}
        <View style={[styles.topAppBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          {/* Brand Info & Logo (Right in RTL) */}
          <View style={styles.brandRow}>
            <View style={[styles.logoPill, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.headerTitleWrap}>
              <View style={styles.titleWithBadge}>
                <Text style={[styles.mainBrandTitle, { color: colors.text }]}>
                  منصة بامبو
                </Text>
                <View style={[styles.proBadge, { backgroundColor: `${colors.primary}15` }]}>
                  <Text style={[styles.proBadgeText, { color: colors.primary }]}>التعليمية</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>
                دليل المواد والدروس المجانية ونخبة المعلمين
              </Text>
            </View>
          </View>

          {/* Quick Scanner Action Button (Left in RTL) */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setModalVisible(true)}
            style={[
              styles.scannerBtn,
              { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}35` },
            ]}
          >
            <Text style={[styles.scannerBtnText, { color: colors.primary }]}>
              تفعيل كود
            </Text>
            <Ionicons name="qr-code-outline" size={17} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ExploreHeader
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          toggleSubjectFilter={toggleSubjectFilter}
          clearFilters={clearFilters}
          suggestedTeachers={suggestedTeachers}
          selectedTeacherIds={selectedTeacherIds}
          toggleTeacherFilter={toggleTeacherFilter}
          totalSubjectTeachersCount={totalSubjectTeachersCount}
          freeVideosCount={freeVideos.length}
          onOpenActivationModal={() => setModalVisible(true)}
          onNavigateToTeacher={handleNavigateToTeacher}
          onNavigateToAllTeachers={handleNavigateToAllTeachers}
        />
      </>
    ),
    [
      colors,
      subjects,
      selectedSubjectId,
      toggleSubjectFilter,
      clearFilters,
      suggestedTeachers,
      selectedTeacherIds,
      toggleTeacherFilter,
      totalSubjectTeachersCount,
      freeVideos.length,
      handleNavigateToTeacher,
      handleNavigateToAllTeachers,
    ]
  );

  const listEmptyComponent = useMemo(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={40} color="#8E8E93" style={{ marginBottom: 8 }} />
        <Text style={[styles.emptyText, { color: colors.text }]}>
          لا توجد دروس مطابقة للفلتر المحدد حالياً.
        </Text>
      </View>
    );
  }, [isLoading, colors.text]);

  if (isLoading && subjects.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={freeVideos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmptyComponent}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.footerLoader}
            />
          ) : null
        }
      />

      <ActivationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoPill: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  headerTitleWrap: {
    alignItems: 'flex-start',
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mainBrandTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: '#8E8E93',
    marginTop: 2,
  },
  scannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  scannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 36,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardCol: {
    width: '48.5%',
  },
  footerLoader: {
    marginVertical: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
    textAlign: 'center',
  },
});
