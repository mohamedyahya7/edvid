import React, { Suspense, useEffect } from 'react';
import { View, Text, I18nManager } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-reanimated';

// 100% Arabic Native Platform: Strictly enforce RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

import { DB_NAME, runMigrations } from '@/lib/db';
import { getSetting } from '@/lib/db/queries/settings.queries';
import { findAndDeleteExpiredVideos } from '@/lib/db/queries/video.queries';
import { useAppActions, useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/store/authStore';
import { downloadManager } from '@/services/DownloadManager';
import { useDynamicTheme } from '@/hooks/useDynamicTheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';

SplashScreen.preventAutoHideAsync();

function useInitialLoad() {
  const { isAuthenticated } = useAuthStore();
  const { setSelectedGradeId } = useAppActions();
  const db = useSQLiteContext();

  useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated) {
        const gradeIdSetting = await getSetting(db, 'selected_grade_id');
        if (gradeIdSetting) {
          setSelectedGradeId(gradeIdSetting.value);
        }
      }
    };
    loadInitialData();
  }, [isAuthenticated, db, setSelectedGradeId]);
}

const InitialLayout: React.FC = () => {
  useInitialLoad();
  useProtectedRoute();
  const insets = useSafeAreaInsets();
  const { colors } = useDynamicTheme();

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="teacher-dashboard" options={{ title: 'Teacher Dashboard', headerShown: true }} />
        <Stack.Screen name="all-teachers" options={{ headerShown: false }} />
        <Stack.Screen name="subjects" options={{ headerShown: false }} />
        <Stack.Screen name="teachers" options={{ headerShown: false }} />
        <Stack.Screen name="used-codes" options={{ headerShown: false }} />
        <Stack.Screen name="teacher/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="video/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="select-grade" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  );
};

const MainLayout: React.FC = () => {
  const db = useSQLiteContext();
  const notifyDownloadCompleted = useAppStore(
    (state) => state.actions.notifyDownloadCompleted
  );
  const initializeDownloadManagerListener = useAppStore(
    (state) => state.actions.initializeDownloadManagerListener
  );

  useEffect(() => {
    const setup = async () => {
      await runMigrations(db);
      downloadManager.initialize(db, notifyDownloadCompleted);
      initializeDownloadManagerListener();
      await findAndDeleteExpiredVideos(db);
    };
    setup();
  }, [db, notifyDownloadCompleted, initializeDownloadManagerListener]);

  return <InitialLayout />;
};

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.actions.hydrate);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  // Background and platform initialization
  useAppBootstrap();

  // Instant 0ms reactive theme listener
  const { isDark, navigationTheme, paperTheme } = useDynamicTheme();

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Amiri_400Regular,
    Amiri_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!loaded || isHydrating) {
    return null;
  }

  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider databaseName={DB_NAME} onInit={runMigrations}>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navigationTheme}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <MainLayout />
          </ThemeProvider>
        </PaperProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
