import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { VideoCard } from '@/components/molecules/VideoCard';
import {
  clearVideoDownload,
  fetchLibraryVideos,
} from '@/lib/db/queries/video.queries';
import { useAppStore } from '@/lib/store';

type FilterType = 'all' | 'offline' | 'stream';

export default function LibraryScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { colors } = useTheme();

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  const loadLibrary = useCallback(async () => {
    try {
      const data = await fetchLibraryVideos(db);
      setVideos(data || []);
    } catch (e) {
      console.warn('loadLibrary error:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [db]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Listen to sync updates from global store
  const syncTimestamp = useAppStore((state) => state.lastSyncTimestamp);
  useEffect(() => {
    loadLibrary();
  }, [syncTimestamp, loadLibrary]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadLibrary();
  };

  const handleRemoveDownload = (video: any) => {
    Alert.alert(
      'حذف الفيديو',
      `هل تريد إزالة فيديو "${video.title}" من المكتبة المحلية؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearVideoDownload(db, String(video.id));
              await loadLibrary();
              useAppStore.getState().actions.notifySyncCompleted();
            } catch (e) {
              console.error('Error removing download:', e);
            }
          },
        },
      ]
    );
  };

  // 1. Filter videos by Primary Status (All / Offline / Stream)
  const statusFilteredVideos = useMemo(() => {
    if (activeFilter === 'offline') {
      return videos.filter(
        (v) =>
          v.effective_download_status === 'COMPLETED' ||
          v.download_status === 'COMPLETED'
      );
    }
    if (activeFilter === 'stream') {
      return videos.filter(
        (v) =>
          v.effective_access_type === 'watch' ||
          v.access_type === 'watch' ||
          (v.effective_download_status !== 'COMPLETED' &&
            v.download_status !== 'COMPLETED')
      );
    }
    return videos;
  }, [videos, activeFilter]);

  // 2. Distinct subjects derived strictly from statusFilteredVideos
  const subjectOptions = useMemo(() => {
    const map = new Map<string, number>();
    statusFilteredVideos.forEach((v) => {
      const name = v.subject_name?.trim() || 'عام';
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [statusFilteredVideos]);

  // Auto-reset selectedSubject if not in current subject options
  useEffect(() => {
    if (selectedSubject && !subjectOptions.some((s) => s.name === selectedSubject)) {
      setSelectedSubject(null);
    }
  }, [subjectOptions, selectedSubject]);

  // 3. Videos filtered by Status AND Subject
  const subjectFilteredVideos = useMemo(() => {
    if (!selectedSubject) return statusFilteredVideos;
    return statusFilteredVideos.filter(
      (v) => (v.subject_name?.trim() || 'عام') === selectedSubject
    );
  }, [statusFilteredVideos, selectedSubject]);

  // 4. Distinct teachers derived strictly from subjectFilteredVideos
  const teacherOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    subjectFilteredVideos.forEach((v) => {
      const id = String(v.teacher_id || v.teacher_name || 'other');
      const name = v.teacher_name?.trim() || 'أستاذ المادة';
      const existing = map.get(id);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(id, { id, name, count: 1 });
      }
    });
    return Array.from(map.values());
  }, [subjectFilteredVideos]);

  // Auto-reset selectedTeacherId if not in current teacher options
  useEffect(() => {
    if (selectedTeacherId && !teacherOptions.some((t) => t.id === selectedTeacherId)) {
      setSelectedTeacherId(null);
    }
  }, [teacherOptions, selectedTeacherId]);

  // 5. Final filtered videos (Status + Subject + Teacher + Search)
  const filteredVideos = useMemo(() => {
    let result = subjectFilteredVideos;

    if (selectedTeacherId) {
      result = result.filter(
        (v) => String(v.teacher_id || v.teacher_name || 'other') === String(selectedTeacherId)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (v) =>
          (v.title || '').toLowerCase().includes(q) ||
          (v.teacher_name || '').toLowerCase().includes(q) ||
          (v.subject_name || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [subjectFilteredVideos, selectedTeacherId, searchQuery]);

  const offlineCount = useMemo(() => {
    return videos.filter(
      (v) =>
        v.effective_download_status === 'COMPLETED' ||
        v.download_status === 'COMPLETED'
    ).length;
  }, [videos]);

  const streamCount = useMemo(() => {
    return Math.max(0, videos.length - offlineCount);
  }, [videos.length, offlineCount]);

  const hasActiveSubFilters = Boolean(selectedSubject || selectedTeacherId || searchQuery);

  const resetAllFilters = () => {
    setActiveFilter('all');
    setSelectedSubject(null);
    setSelectedTeacherId(null);
    setSearchQuery('');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>مكتبتك التعليمية</Text>
          <Text style={styles.screenSubtitle}>
            {videos.length} درس محفوظ ومتاح لك للمتابعة
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onRefresh}
          style={[styles.refreshIconBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
        >
          <Ionicons name="refresh" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="ابحث في مكتبتك عن درس أو مدرس..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign="right"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Primary Type Filter Tabs (Natural Row) */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveFilter('all')}
          style={[
            styles.tabChip,
            activeFilter === 'all'
              ? styles.activeTabChip
              : [styles.inactiveTabChip, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeFilter === 'all' ? styles.activeTabText : { color: colors.text },
            ]}
          >
            الكل ({videos.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveFilter('offline')}
          style={[
            styles.tabChip,
            activeFilter === 'offline'
              ? styles.activeTabChip
              : [styles.inactiveTabChip, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Ionicons
            name="cloud-done-outline"
            size={14}
            color={activeFilter === 'offline' ? '#FFFFFF' : '#2ECC71'}
          />
          <Text
            style={[
              styles.tabText,
              activeFilter === 'offline' ? styles.activeTabText : { color: colors.text },
            ]}
          >
            أوفلاين ({offlineCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveFilter('stream')}
          style={[
            styles.tabChip,
            activeFilter === 'stream'
              ? styles.activeTabChip
              : [styles.inactiveTabChip, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Ionicons
            name="play-circle-outline"
            size={14}
            color={activeFilter === 'stream' ? '#FFFFFF' : '#3498DB'}
          />
          <Text
            style={[
              styles.tabText,
              activeFilter === 'stream' ? styles.activeTabText : { color: colors.text },
            ]}
          >
            مشاهدة ({streamCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Subject Filter Row */}
      {subjectOptions.length > 0 && (
        <View style={styles.subFilterRow}>
          <View style={styles.subFilterLabel}>
            <Ionicons name="book-outline" size={13} color="#8E8E93" />
            <Text style={styles.subFilterLabelText}>المادة:</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedSubject(null)}
              style={[
                styles.miniChip,
                !selectedSubject
                  ? styles.activeMiniChip
                  : [styles.inactiveMiniChip, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.miniChipText,
                  !selectedSubject ? styles.activeMiniChipText : { color: colors.text },
                ]}
              >
                كل المواد ({statusFilteredVideos.length})
              </Text>
            </TouchableOpacity>

            {subjectOptions.map((sub) => {
              const isSelected = selectedSubject === sub.name;
              return (
                <TouchableOpacity
                  key={sub.name}
                  activeOpacity={0.8}
                  onPress={() => setSelectedSubject(isSelected ? null : sub.name)}
                  style={[
                    styles.miniChip,
                    isSelected
                      ? styles.activeMiniChip
                      : [styles.inactiveMiniChip, { backgroundColor: colors.card, borderColor: colors.border }],
                  ]}
                >
                  <Text
                    style={[
                      styles.miniChipText,
                      isSelected ? styles.activeMiniChipText : { color: colors.text },
                    ]}
                  >
                    {sub.name} ({sub.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Teacher Filter Row */}
      {teacherOptions.length > 0 && (
        <View style={styles.subFilterRow}>
          <View style={styles.subFilterLabel}>
            <Ionicons name="person-outline" size={13} color="#8E8E93" />
            <Text style={styles.subFilterLabelText}>المعلم:</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedTeacherId(null)}
              style={[
                styles.miniChip,
                !selectedTeacherId
                  ? styles.activeMiniChip
                  : [styles.inactiveMiniChip, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.miniChipText,
                  !selectedTeacherId ? styles.activeMiniChipText : { color: colors.text },
                ]}
              >
                كل المعلمين ({subjectFilteredVideos.length})
              </Text>
            </TouchableOpacity>

            {teacherOptions.map((teach) => {
              const isSelected = selectedTeacherId === teach.id;
              return (
                <TouchableOpacity
                  key={teach.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedTeacherId(isSelected ? null : teach.id)}
                  style={[
                    styles.miniChip,
                    isSelected
                      ? styles.activeMiniChip
                      : [styles.inactiveMiniChip, { backgroundColor: colors.card, borderColor: colors.border }],
                  ]}
                >
                  <Text
                    style={[
                      styles.miniChipText,
                      isSelected ? styles.activeMiniChipText : { color: colors.text },
                    ]}
                  >
                    {teach.name} ({teach.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Videos List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C897" />
          <Text style={[styles.loadingText, { color: colors.text }]}>جاري تحميل مكتبتك...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVideos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#00C897"
              colors={['#00C897']}
            />
          }
          renderItem={({ item }) => {
            const isOffline =
              item.effective_download_status === 'COMPLETED' ||
              item.download_status === 'COMPLETED';

            return (
              <View style={styles.cardWrapper}>
                <VideoCard
                  id={item.id}
                  title={item.title}
                  youtubeId={item.youtube_id}
                  thumbnailUrl={item.thumbnail}
                  durationSeconds={item.duration_seconds}
                  videoType={item.video_type || item.type || 'free'}
                  statusBadgeLabel={isOffline ? 'أوفلاين' : 'متاح للمشاهدة'}
                  statusBadgeColor={isOffline ? '#2ECC71' : '#3498DB'}
                  teacherId={item.teacher_id}
                  teacherName={item.teacher_name}
                  teacherImage={item.teacher_image || item.teacher_profile_picture_url}
                  subjectName={item.subject_name}
                  variant="list"
                  onPressVideo={() => {
                    router.push({
                      pathname: '/video/[id]',
                      params: { id: String(item.id) },
                    });
                  }}
                  onPressTeacher={() => {
                    if (item.teacher_id) {
                      router.push({
                        pathname: '/teacher/[id]',
                        params: { id: String(item.teacher_id) },
                      });
                    }
                  }}
                  renderAction={() =>
                    isOffline ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRemoveDownload(item)}
                        style={styles.deleteDownloadBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={17} color="#E74C3C" />
                      </TouchableOpacity>
                    ) : null
                  }
                />
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: 'rgba(0, 200, 151, 0.08)' }]}>
                <Ionicons name="library-outline" size={36} color="#00C897" />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {hasActiveSubFilters
                  ? 'لا توجد دروس مطابقة للفلاتر المحددة'
                  : activeFilter === 'offline'
                  ? 'لا توجد فيديوهات محملة أوفلاين'
                  : 'مكتبتك فارغة حالياً'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {hasActiveSubFilters
                  ? 'جرب تغيير خيارات الفلترة أو إعادة ضبطها لعرض كل محتويات مكتبتك.'
                  : activeFilter === 'offline'
                  ? 'يمكنك تحميل الحصص لمشاهدتها بدون اتصال بالإنترنت'
                  : 'الحصص التي تقوم بتفعيلها أو مشاهدتها ستظهر هنا تلقائياً لسهولة الوصول إليها.'}
              </Text>
              {hasActiveSubFilters ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.exploreBtn}
                  onPress={resetAllFilters}
                >
                  <Ionicons name="filter-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.exploreBtnText}>إعادة ضبط الفلاتر</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.exploreBtn}
                  onPress={() => router.push('/(tabs)')}
                >
                  <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.exploreBtnText}>استكشف الحصص والمدرسين</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    alignItems: 'flex-start',
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 11.5,
    color: '#8E8E93',
    marginTop: 2,
  },
  refreshIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 5,
  },
  activeTabChip: {
    backgroundColor: '#00C897',
  },
  inactiveTabChip: {
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  subFilterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subFilterLabelText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#8E8E93',
  },
  horizontalScrollContent: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 8,
  },
  miniChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  activeMiniChip: {
    backgroundColor: '#00C897',
  },
  inactiveMiniChip: {
    borderWidth: 1,
  },
  miniChipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  activeMiniChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  deleteDownloadBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C897',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#00C897',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
