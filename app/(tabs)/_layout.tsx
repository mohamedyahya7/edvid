import React from 'react';
import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { HapticTab } from '@/components/HapticTab';
import ActiveDownloads from '@/components/organisms/ActiveDownloads';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text + '80',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            ...Platform.select({
              ios: {
                position: 'absolute',
              },
              default: {},
            }),
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'الرئيسية',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? 'home' : 'home-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'استكشف',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? 'compass' : 'compass-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'المكتبة',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? 'library' : 'library-outline'} color={color} />
            ),
          }}
        />
      </Tabs>
      <ActiveDownloads />
    </View>
  );
}
