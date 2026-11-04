import { Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";
import { DefaultTheme, DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import React, { Suspense, useEffect } from "react";
import { Platform, Text, View, useColorScheme, I18nManager } from "react-native";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 100% Arabic Native Platform: Strictly enforce RTL layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
console.log('[DEBUG_RTL] I18nManager.isRTL is:', I18nManager.isRTL, 'Platform:', Platform.OS);

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
}

import { Colors } from "@/constants/Colors";
import { usePrevious } from "@/hooks/usePrevious";
import { DB_NAME, runMigrations } from "@/lib/db";
import { getSetting } from "@/lib/db/queries/settings.queries";
import { findAndDeleteExpiredVideos } from "@/lib/db/queries/video.queries";
import { useAppActions, useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/store/authStore";
import * as ScreenOrientation from "expo-screen-orientation";
import { registerActionSyncTask } from "../services/ActionSyncService";
import { downloadManager } from "../services/DownloadManager";
import { SyncService } from "../services/SyncService";
import { registerBackgroundFetchAsync } from "../tasks/downloadTask";

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.accent,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.accent,
  },
};

SplashScreen.preventAutoHideAsync();

function useInitialLoad() {
  const { isAuthenticated } = useAuthStore();
  const { setSelectedGradeId } = useAppActions();
  const db = useSQLiteContext();

  useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated) {
        const gradeIdSetting = await getSetting(db, "selected_grade_id");
        if (gradeIdSetting) {
          console.log(
            `Found saved grade_id: ${gradeIdSetting.value}, setting it in the store.`,
          );
          setSelectedGradeId(gradeIdSetting.value);
        }
      }
    };
    loadInitialData();
  }, [isAuthenticated, db, setSelectedGradeId]);
}

function useProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();
  const wasAuthenticated = usePrevious(isAuthenticated);
  const segments = useSegments();
  const router = useRouter();
  const db = useSQLiteContext();

  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated && user?.role === "student") {
      console.log("User just authenticated, running initial sync...");
      SyncService.run(db);
    }
  }, [isAuthenticated, wasAuthenticated, user, db]);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(tabs)";

    console.log("--- useProtectedRoute Tick ---");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user role:", user?.role);
    console.log("segments:", segments);

    if (isAuthenticated) {
      if (inAuthGroup) {
        console.log("Redirecting authenticated user from auth group...");
        if (user?.role === "student") {
          router.replace("/(tabs)");
        } else {
          router.replace("/teacher-dashboard");
        }
      } else if (inAppGroup && user?.role !== "student") {
        console.log("Redirecting non-student user from student tabs...");
        router.replace("/teacher-dashboard");
      }
    } else {
      if (!inAuthGroup) {
        console.log("Redirecting unauthenticated user to auth group...");
        router.replace("/(auth)/login");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, segments.join(","), router]);
}

const InitialLayout = () => {
  useInitialLoad();
  useProtectedRoute();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen
          name="teacher-dashboard"
          options={{ title: "Teacher Dashboard" }}
        />
        <Stack.Screen name="all-teachers" options={{ headerShown: false }} />
        <Stack.Screen name="subjects" options={{ headerShown: false }} />
        <Stack.Screen name="teachers" options={{ headerShown: false }} />
        <Stack.Screen name="used-codes" options={{ headerShown: false }} />
        <Stack.Screen name="teacher/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="video/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="select-grade"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </View>
  );
};

const MainLayout = () => {
  const db = useSQLiteContext();
  const notifyDownloadCompleted = useAppStore(
    (state) => state.actions.notifyDownloadCompleted,
  );
  const initializeDownloadManagerListener = useAppStore(
    (state) => state.actions.initializeDownloadManagerListener,
  );

  useEffect(() => {
    const setup = async () => {
      console.log("Database initialized, running migrations...");
      await runMigrations(db);
      console.log("Initializing DownloadManager...");
      downloadManager.initialize(db, notifyDownloadCompleted);
      initializeDownloadManagerListener(); // Register the listener
      await findAndDeleteExpiredVideos(db);
    };
    setup();
  }, [db, notifyDownloadCompleted, initializeDownloadManagerListener]);

  return <InitialLayout />;
};

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.actions.hydrate);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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

    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }

    if (Platform.OS !== "web") {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      registerActionSyncTask();
      registerBackgroundFetchAsync();

      const requestNotificationPermissions = async () => {
        try {
          if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
              name: "default",
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: "#FF231F7C",
            });
          }

          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== "granted") {
            console.warn("Push notification permission not granted");
          }
        } catch (err) {
          console.warn("Failed to request notification permissions:", err);
        }
      };

      requestNotificationPermissions();
    }
  }, [hydrate]);

  const colorScheme = useColorScheme();
  const activeTheme = colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme;

  if (!loaded || isHydrating) {
    return null;
  }

  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider databaseName={DB_NAME} onInit={runMigrations}>
        <PaperProvider>
          <ThemeProvider value={activeTheme}>
            <MainLayout />
          </ThemeProvider>
        </PaperProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
