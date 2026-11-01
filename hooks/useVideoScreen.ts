import {
  getVideoDetails,
  updateVideoProgress,
} from "@/lib/db/queries/video.queries";
import { Video as VideoType } from "@/lib/store/types";
import { Audio, Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";

export const useVideoScreen = () => {
  const { id, streamUrl } = useLocalSearchParams<{
    id: string;
    streamUrl?: string;
  }>();
  const db = useSQLiteContext();
  const navigation = useNavigation();

  // Refs
  const youtubePlayerRef = useRef<any>(null);
  const videoPlayerRef = useRef<Video>(null);

  // State
  const [video, setVideo] = useState<VideoType | null>(null);
  const [otherVideos, setOtherVideos] = useState<VideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Unified playing state for all player types
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setPlayerReady] = useState(false);

  // Fetch video details
  useEffect(() => {
    if (id && db) {
      const fetchVideoDetails = async () => {
        setIsLoading(true);
        setError(null); // Reset error on re-fetch
        try {
          const { video: details, otherVideos: other } = await getVideoDetails(
            db,
            id
          );

          if (!details) {
            setError("Video not found.");
            setIsLoading(false);
            return;
          }
          console.log("DETAILS :", details);
          // Check watch count limit - Note: This check is now primarily on the library screen before playing.
          if (
            details.access_type === "watch" &&
            !streamUrl && // Only block if we haven't been given a fresh stream URL
            details.watch_count !== undefined &&
            details.watch_count >= 3
          ) {
            setError("You have exceeded the watch limit for this video.");
            setVideo(details);
            setOtherVideos(other);
            setIsLoading(false);
            return;
          }

          // Check for expired download
          if (
            details.access_type === "download" &&
            details.download_expiry_date &&
            new Date(details.download_expiry_date) < new Date()
          ) {
            setError(
              "The download period for this video has expired. It will be deleted."
            );
            // Delete the local files
            if (details.local_video_path) {
              await FileSystem.deleteAsync(details.local_video_path, {
                idempotent: true,
              });
            }
            if (details.local_audio_path) {
              await FileSystem.deleteAsync(details.local_audio_path, {
                idempotent: true,
              });
            }
            // Update database
            await db.runAsync(
              "UPDATE videos SET local_video_path = NULL, local_audio_path = NULL, download_status = 'EXPIRED' WHERE id = ?;",
              id
            );
            details.local_video_path = undefined; // Clear path for UI
            details.local_audio_path = undefined;
          }

          setVideo(details);
          setOtherVideos(other);
          // Auto-play for downloaded videos, for others wait for onReady
          if (details?.download_status === "COMPLETED") {
            setIsPlaying(false); // Start in paused state
          }
        } catch (error) {
          console.error("Failed to fetch video details", error);
          setError("Failed to load video details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchVideoDetails();
    } else {
      setIsLoading(false);
    }
  }, [id, db, streamUrl]);

  // --- Progress Saving Logic ---
  const savePlaybackTime = useCallback(async () => {
    if (!id || !db) return;

    try {
      if (video?.youtube_id && youtubePlayerRef.current && isPlayerReady) {
        const time = await youtubePlayerRef.current.getCurrentTime();
        await updateVideoProgress(db, id, Math.floor(time));
      } else if (videoPlayerRef.current) {
        const status = await videoPlayerRef.current.getStatusAsync();
        if (status.isLoaded) {
          await updateVideoProgress(
            db,
            id,
            Math.floor(status.positionMillis / 1000)
          );
        }
      }
    } catch (e) {
      console.error("❌ Failed to save playback time.", e);
    }
  }, [id, db, isPlayerReady, video]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      e.preventDefault();

      // Unload sound and save progress
      const cleanupAndNavigate = async () => {
        try {
          // Save progress before unloading
          await savePlaybackTime();

          // Unload the sound to prevent it from playing in the background
          if (sound) {
            await sound.unloadAsync();
            console.log("Audio unloaded successfully.");
          }

          // Unload the video player as well
          if (videoPlayerRef.current) {
            await videoPlayerRef.current.unloadAsync();
            console.log("Video unloaded successfully.");
          }
        } catch (error) {
          console.error("Error during cleanup:", error);
        } finally {
          // After cleanup, dispatch the original navigation action
          navigation.dispatch(e.data.action);
        }
      };

      cleanupAndNavigate();
    });

    return unsubscribe;
  }, [navigation, savePlaybackTime, sound]);

  // Load and unload sound for downloaded videos
  useEffect(() => {
    const loadSound = async () => {
      // Only load sound if there's a separate audio path
      if (video?.local_audio_path) {
        console.log("Loading Sound from:", video.local_audio_path);
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: video.local_audio_path },
            { shouldPlay: false }
          );
          // Seek the sound to the correct position immediately after loading
          if (video.progress_seconds) {
            await newSound.setPositionAsync(video.progress_seconds * 1000);
            console.log(
              `Audio position set to ${video.progress_seconds} seconds.`
            );
          }
          setSound(newSound);
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        } catch (e) {
          console.error("Failed to load sound", e);
        }
      }
    };

    if (video?.download_status === "COMPLETED") {
      loadSound();
    }

    // Cleanup: This runs when the `video` object changes.
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      // Stop the previous video player to prevent overlapping audio/video
      // when switching between videos on the same screen.
      if (videoPlayerRef.current) {
        videoPlayerRef.current.stopAsync();
      }
    };
  }, [video]);

  const incrementWatchCount = useCallback(async () => {
    if (id && db && video?.access_type === "watch") {
      try {
        await db.runAsync(
          "UPDATE videos SET watch_count = watch_count + 1 WHERE id = ?;",
          id
        );
        console.log(`Incremented watch count for video ${id}`);
      } catch (error) {
        console.error("Failed to increment watch count", error);
      }
    }
  }, [id, db, video]);

  // --- YouTube Player Logic ---
  const onYouTubeReady = useCallback(() => {
    setPlayerReady(true);
    incrementWatchCount(); // Increment on ready
    if (video?.progress_seconds) {
      youtubePlayerRef.current?.seekTo(video.progress_seconds, true);
    }
    setIsPlaying(true);
  }, [video, incrementWatchCount]);

  const onYouTubeStateChange = useCallback(
    (state: any) => {
      if (state === "playing") setIsPlaying(true);
      if (state === "paused") setIsPlaying(false);
      if (state === "ended" && id && db) {
        setIsPlaying(false);
        updateVideoProgress(db, id, 0);
      }
    },
    [id, db]
  );

  // --- Local Player Logic ---
  const handlePlayPauseLocal = async () => {
    if (!videoPlayerRef.current || error) return;

    if (isPlaying) {
      await videoPlayerRef.current.pauseAsync();
      await sound?.pauseAsync();
    } else {
      await videoPlayerRef.current.playAsync();
      await sound?.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const onLocalVideoStatusUpdate = async (status: any) => {
    if (!status.isLoaded || error) return;

    // This logic ensures we only increment watch count once per view
    if (status.isPlaying && !isPlayerReady) {
      if (video?.access_type === "watch") {
        incrementWatchCount();
      }
    }

    // Seek to last known position when video initially loads
    if (!isPlayerReady && video?.progress_seconds) {
      videoPlayerRef.current?.setPositionAsync(video.progress_seconds * 1000);
    }
    setPlayerReady(status.isLoaded);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      if (id && db) {
        await updateVideoProgress(db, id, 0); // Reset progress
      }
      await videoPlayerRef.current?.setPositionAsync(0);
      await sound?.setPositionAsync(0);
      setIsPlaying(false);
    }
  };

  return {
    isLoading,
    video,
    otherVideos,
    isPlaying,
    error,
    // YouTube
    youtubePlayerRef,
    onYouTubeReady,
    onYouTubeStateChange,
    // Local AV
    videoPlayerRef,
    handlePlayPauseLocal,
    onLocalVideoStatusUpdate,
    streamUrl, // Expose original streamUrl from props
  };
};
