import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getUsedCodes } from '@/lib/db/queries/usedCodes.queries';
import { useSyncRefresh } from '@/hooks/useSyncRefresh';
import { matchesQuery } from '@/utils/searchMatcher';

export type CodeFilterType = 'all' | 'watch' | 'download';

export interface UsedCodeItem {
  id: string;
  video_id: string | number;
  video_title?: string;
  access_type: 'watch' | 'download';
  used_at?: string | null;
  expires_at?: string | null;
  [key: string]: any;
}

export function useUsedCodes() {
  const db = useSQLiteContext();
  const [usedCodes, setUsedCodes] = useState<UsedCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<CodeFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCodes = useCallback(async () => {
    try {
      const codes = await getUsedCodes(db);
      setUsedCodes(codes || []);
    } catch (error) {
      console.error('Failed to fetch used codes:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  // Reusable unified pull-to-refresh
  const { isRefreshing, onRefresh } = useSyncRefresh(fetchCodes, {
    debugTag: 'UsedCodes',
  });

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
      list = list.filter((c) =>
        matchesQuery(c, searchQuery, (item) => [item.id, item.video_title])
      );
    }

    return list;
  }, [usedCodes, selectedFilter, searchQuery]);

  return {
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
  };
}
