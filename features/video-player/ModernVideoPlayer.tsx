import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import YoutubeIframe, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import { FloatingWatermark } from '@/components/molecules/FloatingWatermark';
import { WatermarkConfig, VideoType } from '@/types/video';
import { storageUrl } from '@/api/Axios';

interface ModernVideoPlayerProps {
  sourceUri?: string | null;
  videoType?: VideoType;
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  watermarkConfig: WatermarkConfig;
  autoPlay?: boolean;
  isLocked?: boolean;
  initialPositionSeconds?: number;
  onProgressChange?: (seconds: number) => void;
  onUnlockPress?: () => void;
  onDownloadPress?: () => void;
  isDownloading?: boolean;
  isLandscape?: boolean;
}

export const ModernVideoPlayer: React.FC<ModernVideoPlayerProps> = ({
  sourceUri,
  videoType = 'paid',
  youtubeId,
  thumbnailUrl,
  watermarkConfig,
  autoPlay = false,
  isLocked = false,
  initialPositionSeconds = 0,
  onProgressChange,
  onUnlockPress,
  onDownloadPress,
  isDownloading = false,
  isLandscape = false,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // In landscape mode, player fills full screen; in portrait mode, 16:9 ratio
  const playerHeight = isLandscape ? windowHeight : Math.round((windowWidth * 9) / 16);
  const playerWidth = isLandscape ? windowWidth : windowWidth;

  const [isYoutubePlaying, setIsYoutubePlaying] = useState(autoPlay);
  const youtubePlayerRef = useRef<YoutubeIframeRef>(null);
  const lastReportedTimeRef = useRef<number>(initialPositionSeconds);

  const isYouTube = Boolean(youtubeId);

  // Safe fallback URI for expo-video player to avoid crash when inactive
  const safeSourceUri =
    !isLocked && !isYouTube && sourceUri
      ? sourceUri
      : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const player = useVideoPlayer(safeSourceUri, (p) => {
    p.loop = false;
    if (initialPositionSeconds && initialPositionSeconds > 0) {
      try {
        p.currentTime = initialPositionSeconds;
      } catch {}
    }
    if (autoPlay && !isYouTube && !isLocked && sourceUri) {
      p.play();
    }
  });

  // Track Expo-Video playback progress
  useEffect(() => {
    if (!isYouTube && player) {
      const sub = player.addListener('timeUpdate', (event) => {
        const sec = Math.floor(event.currentTime);
        if (sec > 0 && Math.abs(sec - lastReportedTimeRef.current) >= 3) {
          lastReportedTimeRef.current = sec;
          onProgressChange?.(sec);
        }
      });
      return () => {
        sub.remove();
        if (player.currentTime > 0) {
          onProgressChange?.(Math.floor(player.currentTime));
        }
      };
    }
  }, [isYouTube, player, onProgressChange]);

  // Track YouTube playback progress
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isYouTube && isYoutubePlaying) {
      interval = setInterval(async () => {
        try {
          if (youtubePlayerRef.current) {
            const current = await youtubePlayerRef.current.getCurrentTime();
            const sec = Math.floor(current);
            if (sec > 0 && Math.abs(sec - lastReportedTimeRef.current) >= 2) {
              lastReportedTimeRef.current = sec;
              onProgressChange?.(sec);
            }
          }
        } catch {}
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
      if (lastReportedTimeRef.current > 0) {
        onProgressChange?.(lastReportedTimeRef.current);
      }
      if (isYouTube && youtubePlayerRef.current) {
        youtubePlayerRef.current.getCurrentTime().then((current) => {
          if (current > 0) {
            onProgressChange?.(Math.floor(current));
          }
        }).catch(() => {});
      }
    };
  }, [isYouTube, isYoutubePlaying, onProgressChange]);

  let finalThumb = thumbnailUrl;
  if (!finalThumb && youtubeId) {
    finalThumb = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  } else if (finalThumb && !finalThumb.startsWith('http')) {
    finalThumb = storageUrl + finalThumb;
  }

  // 1. LOCKED LECTURE HERO (Hero Card with prominent Unlock CTA right on viewport)
  if (isLocked) {
    return (
      <View style={[styles.container, { height: playerHeight, width: playerWidth }]}>
        {finalThumb ? (
          <Image source={{ uri: finalThumb }} style={styles.thumbnailBg} />
        ) : (
          <View style={[styles.thumbnailBg, { backgroundColor: '#1C1C1E' }]} />
        )}
        <View style={styles.lockedBackdrop} />

        <View style={styles.lockedContent}>
          <View style={styles.lockIconCircle}>
            <Ionicons name="lock-closed" size={28} color="#F59E0B" />
          </View>
          <Text style={styles.lockedTitle}>المحاضرة مدفوعة ومقفولة</Text>
          <Text style={styles.lockedSubtitle}>أدخل كود الشحن الخاص بالسنتر للمشاهدة فوراً</Text>

          {onUnlockPress && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onUnlockPress}
              style={styles.unlockHeroBtn}
            >
              <Ionicons name="key-outline" size={18} color="#FFFFFF" />
              <Text style={styles.unlockHeroBtnText}>تفعيل الكود لفتح المحاضرة</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // 2. UNLOCKED BUT NOT DOWNLOADED & NO STREAM (Offline Lecture Prompt)
  if (!isYouTube && !sourceUri) {
    return (
      <View style={[styles.container, { height: playerHeight, width: playerWidth }]}>
        {finalThumb ? (
          <Image source={{ uri: finalThumb }} style={styles.thumbnailBg} />
        ) : (
          <View style={[styles.thumbnailBg, { backgroundColor: '#1C1C1E' }]} />
        )}
        <View style={styles.lockedBackdrop} />

        <View style={styles.lockedContent}>
          <View style={[styles.lockIconCircle, { backgroundColor: 'rgba(0, 200, 151, 0.18)' }]}>
            <Ionicons name="cloud-download-outline" size={30} color="#00C897" />
          </View>
          <Text style={styles.lockedTitle}>المحاضرة مفتوحة وجاهزة للتحميل</Text>
          <Text style={styles.lockedSubtitle}>قم بتحميل المحاضرة لمشاهدتها بجودة عالية بدون إنترنت</Text>

          {onDownloadPress && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onDownloadPress}
              disabled={isDownloading}
              style={[styles.unlockHeroBtn, { backgroundColor: '#00C897' }]}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="arrow-down-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.unlockHeroBtnText}>تحميل المحاضرة الآن</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // 3. ACTIVE PLAYBACK VIEWPORT (YouTube or HLS / Local Video)
  return (
    <View style={[styles.container, { height: playerHeight, width: playerWidth }]}>
      {isYouTube ? (
        <YoutubeIframe
          ref={youtubePlayerRef}
          height={playerHeight}
          width={playerWidth}
          play={isYoutubePlaying}
          videoId={youtubeId!}
          initialPlayerParams={{
            start: initialPositionSeconds && initialPositionSeconds > 0 ? Math.floor(initialPositionSeconds) : 0,
            rel: false,
            preventFullScreen: false,
          }}
          onReady={() => {
            if (initialPositionSeconds && initialPositionSeconds > 0) {
              youtubePlayerRef.current?.seekTo(initialPositionSeconds, true);
            }
          }}
          onChangeState={(state: string) => {
            if (state === 'ended') {
              setIsYoutubePlaying(false);
            } else if (state === 'playing') {
              setIsYoutubePlaying(true);
            } else if (state === 'paused') {
              setIsYoutubePlaying(false);
              youtubePlayerRef.current?.getCurrentTime().then((current) => {
                if (current > 0) {
                  lastReportedTimeRef.current = Math.floor(current);
                  onProgressChange?.(Math.floor(current));
                }
              }).catch(() => {});
            }
          }}
        />
      ) : (
        <VideoView
          style={styles.videoView}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
          nativeControls
        />
      )}

      {/* Floating Dynamic Watermark against Screen Recording */}
      <FloatingWatermark
        config={watermarkConfig}
        containerWidth={playerWidth}
        containerHeight={playerHeight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  thumbnailBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lockedBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  lockedContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10,
    zIndex: 10,
  },
  lockIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  lockedTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  lockedSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 6,
  },
  unlockHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 3,
  },
  unlockHeroBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
