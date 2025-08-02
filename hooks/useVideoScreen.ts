import { databaseService } from "@/lib/DatabaseService";
import { Video } from "@/lib/store/types";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";

export const useVideoScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [isPlayerReady, setPlayerReady] = useState(false);
  const navigation = useNavigation();
  const [video, setVideo] = useState<Video | null>(null);
  const [otherVideos, setOtherVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchVideoDetails = async () => {
        try {
          setIsLoading(true);
          const { video: details, otherVideos: other } =
            await databaseService.getVideoDetails(db, id);
          setVideo(details);
          setOtherVideos(other);
        } catch (error) {
          console.error("Failed to fetch video details", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchVideoDetails();
    } else {
      setIsLoading(false);
    }
  }, [id, db]);

  const savePlaybackTime = useCallback(async () => {
    if (playerRef.current && isPlayerReady && id && video?.youtube_id) {
      try {
        const time = await playerRef.current.getCurrentTime();
        await databaseService.updateVideoProgress(db, id, Math.floor(time));
      } catch (e) {
        console.error("❌ Failed to save playback time.", e);
      }
    }
  }, [id, db, isPlayerReady, video]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Asynchronously save progress and then leave
      const saveAndLeave = async () => {
        await savePlaybackTime();
        navigation.dispatch(e.data.action); // Proceed with leaving
      };

      saveAndLeave();
    });

    return unsubscribe;
  }, [navigation, savePlaybackTime]);

  const onReady = useCallback(() => {
    setPlayerReady(true);
    if (video?.progress_seconds && video.youtube_id) {
      playerRef.current?.seekTo(video.progress_seconds, true);
    }
    setPlaying(true);
  }, [video]);

  const onStateChange = useCallback(
    (state: any) => {
      if (state === "ended" && id) {
        setPlaying(false);
        databaseService.updateVideoProgress(db, id, 0); // Reset progress on end
      }
    },
    [id, db]
  );

  return {
    isLoading,
    video,
    playing,
    playerRef,
    onReady,
    onStateChange,
    savePlaybackTime,
    otherVideos,
  };
};
