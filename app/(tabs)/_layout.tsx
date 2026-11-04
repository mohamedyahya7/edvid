import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import ActiveDownloads from "@/components/organisms/ActiveDownloads";

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>


      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.card,
            ...Platform.select({
              ios: {
                position: "absolute",
              },
              default: {},
            }),
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "الرئيسية",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={32} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "استكشف",
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="search" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "المكتبة",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons size={28} name="library" color={color} />
            ),
          }}
        />
      </Tabs>
      <ActiveDownloads />

    </View>
  );
}
