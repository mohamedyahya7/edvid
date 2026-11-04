import { useCallback, useEffect } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFocusEffect } from 'expo-router';

export function useScreenProtection() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Prevent OS-level screen capture and screenshots on native
  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('expo-screen-capture').then((sc) => {
        sc.preventScreenCaptureAsync().catch(() => {});
      });
      return () => {
        import('expo-screen-capture').then((sc) => {
          sc.allowScreenCaptureAsync().catch(() => {});
        });
      };
    }
  }, []);

  // Auto unlock orientation when on Video Screen, restore to portrait when leaving
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web') {
        ScreenOrientation.unlockAsync().catch(() => {});
      }
      return () => {
        if (Platform.OS !== 'web') {
          ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
        }
      };
    }, [])
  );

  return { isLandscape };
}
