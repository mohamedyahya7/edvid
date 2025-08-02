import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import React, { Suspense, useEffect } from "react";
import { Text } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { databaseService } from "@/lib/DatabaseService";
import { useAppStore } from "@/lib/store";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { setSelectedGradeId } = useAppStore((state) => state.actions);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkGradeAndNavigate = async () => {
      const gradeId = await AsyncStorage.getItem("selectedGradeId");
      const inTabsGroup = segments[0] === "(tabs)";

      if (gradeId) {
        setSelectedGradeId(gradeId);
        // If the user is signed in and trying to access a page in the tabs group, let them.
        if (inTabsGroup) {
          // You can add other logic here if needed
        }
      } else if (
        segments.length > 0 &&
        !(segments[0] === "screens" && segments[1] === "SelectGradeScreen")
      ) {
        // If the user is not signed in, redirect them to the grade selection screen.
        router.replace("/screens/SelectGradeScreen");
      }
    };
    checkGradeAndNavigate();
  }, [segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="all-teachers" options={{ headerShown: false }} />
      <Stack.Screen name="teacher/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="video/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="screens/SelectGradeScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider
        databaseName="main.db"
        onInit={databaseService.initializeDatabase}
      >
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <InitialLayout />
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
