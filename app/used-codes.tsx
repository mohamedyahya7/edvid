import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

import { getUsedCodes } from '@/lib/db/queries/usedCodes.queries';

type FilterType = 'all' | 'watch' | 'download';

export default function UsedCodesScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { colors } = useTheme();

  const [usedCodes, setUsedCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCodes = useCallback(async () => {
    try {
      const codes = await getUsedCodes(db);
      setUsedCodes(codes || []);
    } catch (error) {
      console.error('Failed to fetch used codes:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [db]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchCodes();
  };

  // Compute counts for filter tabs
  const { watchCount, downloadCount } = useMemo(() => {
    let watch = 0;
    let download = 0;
    usedCodes.forEach((c) => {
      if (c.access_type === 'watch') watch++;
      else if (c.access_type === 'download') download++;
    });
    return { watchCount: watch, downloadCount: download };
  }, [usedCodes]);

  // Filter and search
  const displayedCodes = useMemo(() => {
    let list = usedCodes;

    if (selectedFilter === 'watch') {
      list = list.filter((c) => c.access_type === 'watch');
    } else if (selectedFilter === 'download') {
      list = list.filter((c) => c.access_type === 'download');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          (c.id && c.id.toLowerCase().includes(q)) ||
          (c.video_title && c.video_title.toLowerCase().includes(q))
      );
    }

    return list;
  }, [usedCodes, selectedFilter, searchQuery]);

  const handleOpenVideo = (videoId: string | number) => {
    if (!videoId) return;
    router.push(`/video/${videoId}`);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isWatch = item.access_type === 'watch';
    const usedDate = item.used_at ? new Date(item.used_at).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : 'غير محدد';

    const expireDate = item.expires_at ? new Date(item.expires_at).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : null;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleOpenVideo(item.video_id)}
        style={[
          styles.codeCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Top Header of Card: Code badge and Access Type */}
        <View style={styles.cardHeader}>
          <View style={[styles.codePill, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
            <Ionicons name="key-outline" size={14} color={colors.primary} />
            <Text style={[styles.codeText, { color: colors.primary }]}>{item.id}</Text>
          </View>

          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: isWatch ? '#007AFF15' : '#34C75915',
                borderColor: isWatch ? '#007AFF30' : '#34C75930',
              },
            ]}
          >
            <Ionicons
              name={isWatch ? 'play-outline' : 'cloud-download-outline'}
              size={13}
              color={isWatch ? '#007AFF' : '#34C759'}
            />
            <Text
              style={[
                styles.typeBadgeText,
                { color: isWatch ? '#007AFF' : '#34C759' },
              ]}
            >
              {isWatch ? 'مشاهدة مباشرة' : 'تحميل أوفلاين'}
            </Text>
          </View>
        </View>

        {/* Video Title */}
        <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
          {item.video_title}
        </Text>

        {/* Dates Meta */}
        <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color="#8E8E93" />
            <Text style={styles.metaLabel}>تاريخ التفعيل: {usedDate}</Text>
          </View>
          {expireDate && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color="#FF9500" />
              <Text style={[styles.metaLabel, { color: '#FF9500' }]}>
                ينتهي: {expireDate}
              </Text>
            </View>
          )}
        </View>

        {/* Click-through Action Footer */}
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View style={styles.cardFooterAction}>
            <Ionicons name="play-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.cardFooterText, { color: colors.primary }]}>
              فتح المحاضرة الآن
            </Text>
          </View>
          <Ionicons name="chevron-back" size={14} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top App Bar with back button */}
      <View style={[styles.topBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>أكوادك المفعّلة</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input Bar */}
      {usedCodes.length > 0 && (
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="ابحث برمز الكود أو اسم الدرس..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Horizontal Filter Tabs */}
      {usedCodes.length > 0 && (
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedFilter('all')}
              style={[
                styles.tabPill,
                {
                  backgroundColor: selectedFilter === 'all' ? colors.primary : colors.card,
                  borderColor: selectedFilter === 'all' ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedFilter === 'all' ? '#FFFFFF' : colors.text },
                ]}
              >
                الكل ({usedCodes.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedFilter('watch')}
              style={[
                styles.tabPill,
                {
                  backgroundColor: selectedFilter === 'watch' ? colors.primary : colors.card,
                  borderColor: selectedFilter === 'watch' ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedFilter === 'watch' ? '#FFFFFF' : colors.text },
                ]}
              >
                مشاهدة مباشرة ({watchCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedFilter('download')}
              style={[
                styles.tabPill,
                {
                  backgroundColor: selectedFilter === 'download' ? colors.primary : colors.card,
                  borderColor: selectedFilter === 'download' ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedFilter === 'download' ? '#FFFFFF' : colors.text },
                ]}
              >
                تحميل أوفلاين ({downloadCount})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedCodes}
          renderItem={renderItem}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  tabsWrapper: {
    marginTop: 6,
    marginBottom: 2,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
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
  codeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  cardFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardFooterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
});
