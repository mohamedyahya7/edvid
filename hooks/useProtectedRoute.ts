import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuthStore } from '@/lib/store/authStore';
import { usePrevious } from '@/hooks/usePrevious';
import { SyncService } from '@/services/SyncService';

export function useProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();
  const wasAuthenticated = usePrevious(isAuthenticated);
  const segments = useSegments();
  const router = useRouter();
  const db = useSQLiteContext();

  // Run initial sync when student authenticates
  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated && user?.role === 'student') {
      SyncService.run(db).catch((e) => console.warn('Initial sync error on login:', e));
    }
  }, [isAuthenticated, wasAuthenticated, user, db]);

  // Handle route protection and role-based redirects
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';

    if (isAuthenticated) {
      if (inAuthGroup) {
        if (user?.role === 'student') {
          router.replace('/(tabs)');
        } else {
          router.replace('/teacher-dashboard');
        }
      } else if (inAppGroup && user?.role !== 'student') {
        router.replace('/teacher-dashboard');
      }
    } else {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, user, segments, router]);
}
