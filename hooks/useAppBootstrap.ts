import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { registerActionSyncTask } from '@/services/ActionSyncService';
import { registerBackgroundFetchAsync } from '@/tasks/downloadTask';

export function useAppBootstrap() {
  useEffect(() => {
    // Web RTL document configuration
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }

    // Native platform bootstrap
    if (Platform.OS !== 'web') {
      // 1. Lock portrait orientation
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});

      // 2. Notifications & Background Fetch Guard:
      // Note: Expo SDK 53+ removed remote push notifications and background fetch from Expo Go.
      // They are fully supported in Expo Dev Client (`expo-dev-client`) and Standalone Production Builds.
      const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

      if (!isExpoGo) {
        // Register native background sync tasks
        registerActionSyncTask();
        registerBackgroundFetchAsync();

        // Setup native push notification channels
        const setupNotifications = async () => {
          try {
            if (Platform.OS === 'android') {
              await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#00C897',
              });
            }

            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
              console.warn('Push notification permission not granted');
            }
          } catch (err) {
            console.warn('Failed to setup notifications:', err);
          }
        };

        setupNotifications();
      }
    }
  }, []);
}
