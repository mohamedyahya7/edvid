import { storageUrl } from "@/api/Axios";
import ActivationModal from "@/app/components/ActivationModal"; // Keep this for the unlock button
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { useVideoScreen } from "@/hooks/useVideoScreen";
import {
  clearVideoDownload,
  decrementWatchCount,
  getVideoDetails,
} from "@/lib/db/queries/video.queries";
import { useAppActions } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useFocusEffect, useRouter } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import * as ScreenOrientation from "expo-screen-orientation";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  I18nManager,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import YoutubeIframe from "react-native-youtube-iframe";

const VideoDetailScreen = () => {
  usePreventScreenCapture();
  const { width, height } = useWindowDimensions();
  const [orientation, setOrientation] = useState<ScreenOrientation.Orientation>(
    ScreenOrientation.Orientation.PORTRAIT_UP
  );
  const {
    video,
    otherVideos,
    isLoading,
    isPlaying,
    error,
    youtubePlayerRef,
    videoPlayerRef,
    streamUrl,
    onYouTubeReady,
    onYouTubeStateChange,
    handlePlayPauseLocal,
    onLocalVideoStatusUpdate,
  } = useVideoScreen();

  const [isUnlockModalVisible, setUnlockModalVisible] = useState(false);
  const router = useRouter();
  const db = useSQLiteContext();
  const actions = useAppActions();
  const [localVideo, setLocalVideo] = useState(video);
  const { colors } = useTheme();
  const styles = dynamicStyles(colors);
  const [totalFileSize, setTotalFileSize] = useState<number | null>(null);
  const videoWidth =
    localVideo?.download_status === "COMPLETED" || streamUrl ? "78%" : "100%";
  const fetchVideoDetails = useCallback(async () => {
    if (db && video?.id) {
      const details = await getVideoDetails(db, video.id);
      setLocalVideo(details.video);
    }
  }, [db, video?.id]);

  const calculateFileSize = useCallback(async () => {
    if (!localVideo || localVideo.download_status !== "COMPLETED") {
      setTotalFileSize(null);
      return;
    }

    let totalSize = 0;

    try {
      // Calculate video file size
      if (localVideo.local_video_path) {
        const videoInfo = await FileSystem.getInfoAsync(
          localVideo.local_video_path
        );
        if (videoInfo.exists && videoInfo.size) {
          totalSize += videoInfo.size;
        }
      }

      // Calculate audio file size
      if (localVideo.local_audio_path) {
        const audioInfo = await FileSystem.getInfoAsync(
          localVideo.local_audio_path
        );
        if (audioInfo.exists && audioInfo.size) {
          totalSize += audioInfo.size;
        }
      }

      setTotalFileSize(totalSize);
    } catch (error) {
      console.error("Error calculating file size:", error);
      setTotalFileSize(null);
    }
  }, [localVideo]);

  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener(
      (evt) => {
        setOrientation(evt.orientationInfo.orientation);
      }
    );

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Unlock orientation when the screen is focused
      ScreenOrientation.unlockAsync();

      fetchVideoDetails();

      return () => {
        // Lock orientation back to portrait when the screen is unfocused
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      };
    }, [fetchVideoDetails])
  );

  useEffect(() => {
    calculateFileSize();
  }, [calculateFileSize]);

  useEffect(() => {
    const handleWatchCount = async () => {
      if (db && localVideo?.id && localVideo.access_type === "watch") {
        await decrementWatchCount(db, localVideo.id);
        // Optionally, refetch video details to update UI
        fetchVideoDetails();
      }
    };

    handleWatchCount();
  }, [db, localVideo?.id, localVideo?.access_type]);

  const handleDeleteVideo = async () => {
    if (!localVideo || !db) return;

    Alert.alert(
      "Delete Video From Device",
      `Are you sure you want to delete the downloaded files for "${localVideo.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Files",
          style: "destructive",
          onPress: async () => {
            try {
              if (localVideo.local_video_path) {
                await FileSystem.deleteAsync(localVideo.local_video_path, {
                  idempotent: true,
                });
              }
              if (localVideo.local_audio_path) {
                await FileSystem.deleteAsync(localVideo.local_audio_path, {
                  idempotent: true,
                });
              }
              await clearVideoDownload(db, localVideo.id);
              Alert.alert(
                "Files Deleted",
                "The video files have been removed from your device."
              );
              // refresh library screen ui by zustand store
              actions.notifyDownloadCompleted();
              //navigate back
              router.back();
            } catch (error) {
              console.error("Failed to delete video files:", error);
              Alert.alert("Error", "Could not delete the video files.");
            }
          },
        },
      ]
    );
  };

  const renderVideoPlayer = () => {
    if (!localVideo) {
      return null;
    }

    const isLandscape = width > height;

    // Case 1: A direct stream URL is provided (from Library or Activation)
    if (streamUrl) {
      return (
        <View
          style={[
            styles.videoContainer,
            isLandscape && styles.fullscreenVideoContainer,
          ]}
        >
          <ExpoVideo
            ref={videoPlayerRef}
            style={styles.video}
            source={{ uri: streamUrl }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            onPlaybackStatusUpdate={onLocalVideoStatusUpdate}
          />
        </View>
      );
    }

    // Case 2: Downloaded video
    const videoSourceUri =
      localVideo.download_status === "COMPLETED" && localVideo.local_video_path
        ? localVideo.local_video_path
        : null;

    if (videoSourceUri) {
      return (
        <View
          style={[
            styles.videoContainer,
            isLandscape && styles.fullscreenVideoContainer,
          ]}
        >
          <ExpoVideo
            ref={videoPlayerRef}
            style={styles.video}
            source={{ uri: videoSourceUri }}
            resizeMode={ResizeMode.CONTAIN}
            isMuted={!!localVideo.local_audio_path} // Mute if there is a separate audio file
            onPlaybackStatusUpdate={onLocalVideoStatusUpdate}
            useNativeControls={!localVideo.local_audio_path} // Use native controls if no separate audio
          />
          {/* Show custom controls only if we have separate audio */}
          {localVideo.local_audio_path && (
            <View style={styles.controlsContainer}>
              <TouchableOpacity onPress={handlePlayPauseLocal}>
                <Ionicons
                  name={isPlaying ? "pause-circle" : "play-circle"}
                  size={48}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    // Case 2: Free video with a YouTube ID
    if (localVideo.video_type === "free" && localVideo.youtube_id) {
      return (
        <View
          style={[
            styles.videoContainer,
            isLandscape && styles.fullscreenVideoContainer,
          ]}
        >
          <YoutubeIframe
            ref={youtubePlayerRef}
            height={isLandscape ? (width * 9) / 16 : height * 0.3}
            width={width}
            play={isPlaying}
            videoId={localVideo.youtube_id}
            onReady={onYouTubeReady}
            onChangeState={onYouTubeStateChange}
          />
        </View>
      );
    }

    // Fallback: Locked video placeholder
    return (
      <View
        style={[
          styles.videoImage,
          styles.placeholderContainer,
          { backgroundColor: colors.card },
        ]}
      >
        <Ionicons name="lock-closed" size={48} color={colors.text} />
        <ThemedText style={styles.placeholderText}>
          Unlock this video to watch
        </ThemedText>
        <TouchableOpacity
          style={[styles.unlockButton, { backgroundColor: colors.primary }]}
          onPress={() => setUnlockModalVisible(true)}
        >
          <ThemedText style={styles.unlockButtonText}>Unlock Video</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={[styles.title, { color: "red" }]}>
          {error}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!localVideo) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Video not found.</ThemedText>
      </ThemedView>
    );
  }

  const isLandscape = width > height;

  return (
    <ThemedView style={styles.container}>
      {renderVideoPlayer()}

      {!isLandscape && (
        <ScrollView>
          <ActivationModal
            visible={isUnlockModalVisible}
            onClose={() => setUnlockModalVisible(false)}
          />
          {/* Teacher Info */}
          <View
            style={[styles.teacherInfoCard, { backgroundColor: colors.card }]}
          >
            <TouchableOpacity
              style={[
                styles.teacherInfoContainer,
                {
                  width: videoWidth,
                  backgroundColor: colors.card,
                },
              ]}
              onPress={() => router.push(`/teacher/${localVideo.teacher_id}`)}
            >
              <Image
                source={{
                  uri:
                    `${storageUrl}${localVideo.teacher_profile_picture_url}` ||
                    "https://i.pravatar.cc/100",
                }}
                style={styles.teacherImage}
              />
              <View>
                <ThemedText style={[styles.title]}>
                  {localVideo.title}
                </ThemedText>
                <ThemedText style={styles.teacherName}>
                  {localVideo.teacher_name}
                </ThemedText>
                <ThemedText style={styles.teacherBio}>
                  {localVideo.subject_name}
                </ThemedText>
              </View>
            </TouchableOpacity>
            <View style={styles.extraInfoContainer}>
              <View style={styles.extraInfoInnerContainer}>
                {streamUrl && (
                  <View style={styles.extraInfoRow}>
                    <Ionicons
                      name="eye-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={{ color: colors.text }}>
                      {localVideo.watch_count}
                    </Text>
                  </View>
                )}
                {localVideo.download_status === "COMPLETED" && (
                  <View style={[styles.extraInfoRow, { flexDirection: "row" }]}>
                    {localVideo.download_expiry_date && (
                      <View style={styles.extraInfoRow}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={styles.extraInfoText}>
                          {new Date(
                            localVideo.download_expiry_date
                          ).toLocaleDateString([], {
                            day: "numeric",
                            month: "short",
                          })}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={handleDeleteVideo}
                      style={[styles.deleteButton]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {totalFileSize !== null && (
                  <View style={[styles.extraInfoRow, { flexDirection: "row" }]}>
                    <Ionicons
                      name="folder-outline"
                      size={16}
                      color={colors.text}
                    />
                    <Text style={styles.extraInfoText}>
                      {(totalFileSize / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          {/* <View style={styles.actionsRow}>
        <ActionButton
          icon={I18nManager.isRTL ? "arrow-undo-outline" : "share-outline"}
          label="Share"
        />
        <ActionButton icon="bookmark-outline" label="Bookmark" />
        <ActionButton
          icon="download-outline"
          label="Download"
          onPress={() => setUnlockModalVisible(true)}
        />
      </View> */}

          <ThemedText style={styles.description}>
            {localVideo.description || "Video description here..."}
          </ThemedText>

          {/* <TouchableOpacity>
        <ThemedText style={styles.classPage}>GO TO CLASS PAGE</ThemedText>
      </TouchableOpacity>
     
      <View style={styles.tabsRow}>
        <ThemedText style={[styles.tab, styles.activeTab]}>Up Next</ThemedText>
        <ThemedText style={styles.tab}>Moments</ThemedText>
      </View> */}

          {/* Other Videos */}
          <View>
            <ThemedText style={styles.otherVideosTitle}>
              More from this Teacher
            </ThemedText>
            <FlatList
              data={otherVideos}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.otherVideoCard}
                  onPress={() => router.replace(`/video/${item.id}`)}
                >
                  <Image
                    source={{
                      uri: item.thumbnail || "https://i.pravatar.cc/300",
                    }}
                    style={[
                      styles.otherVideoImage,
                      { backgroundColor: colors.card },
                    ]}
                  />
                  <ThemedText style={styles.otherVideoTitle} numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                </TouchableOpacity>
              )}
              columnWrapperStyle={{
                justifyContent: "space-between",
                paddingHorizontal: 16,
              }}
            />
          </View>

          {/* Up Next List (example) */}
          {/* <View style={styles.upNextRow}>
        <Image
          source={{
            uri: localVideo.thumbnail || "https://i.pravatar.cc/100",
          }}
          style={styles.upNextThumb}
        />
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.upNextTitle}>2. Define Your Core Values</ThemedText>
        </View>
        <ThemedText style={styles.upNextDuration}>16:03</ThemedText>
      </View> */}
        </ScrollView>
      )}
    </ThemedView>
  );
};

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const styles = dynamicStyles(colors);
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={24} color={colors.text} />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const dynamicStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    loadingIndicator: { flex: 1 },
    videoContainer: {
      width: "100%",
      height: 220,
      backgroundColor: "#000",
      justifyContent: "center",
      alignItems: "center",
    },
    video: {
      width: "100%",
      height: "100%",
    },
    fullscreenVideoContainer: {
      ...StyleSheet.absoluteFillObject,
      height: "100%",
      backgroundColor: "black",
      zIndex: 999,
    },
    fullscreenVideo: {
      width: "100%",
      height: "100%",
    },
    controlsContainer: {
      position: "absolute",
    },
    videoImage: {
      display: "flex",
      flex: 1,
      height: 200,
      justifyContent: "center",
      alignItems: "center",
    },
    placeholderContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    placeholderText: {
      color: colors.text,
      marginTop: 10,
      fontSize: 16,
      textAlign: "center",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    unlockButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    unlockButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    actionsRow: {
      flexDirection: I18nManager.isRTL ? "row" : "row",
      justifyContent: "space-around",
      marginVertical: 16,
    },
    actionBtn: { alignItems: "center", flex: 1 },
    actionLabel: { color: colors.text, marginTop: 4 },
    title: {
      fontWeight: "bold",
      fontSize: 18,
      marginBottom: 4,
      textAlign: I18nManager.isRTL ? "right" : "left",
      overflow: "hidden",
    },
    description: {
      marginHorizontal: 16,
      marginBottom: 16,
      textAlign: I18nManager.isRTL ? "right" : "left",
    },
    teacherInfoCard: {
      display: "flex",
      flexDirection: "row",
      marginVertical: 8,
      marginHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      overflow: "hidden",
    },
    teacherInfoContainer: {
      flexDirection: I18nManager.isRTL ? "row" : "row",
      alignItems: "center",
      paddingHorizontal: 8,
      overflow: "hidden",
      paddingVertical: 8,
      marginBottom: 8,
    },
    teacherImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: I18nManager.isRTL ? 0 : 12,
      marginLeft: I18nManager.isRTL ? 12 : 0,
    },
    teacherName: {
      fontWeight: "bold",
      fontSize: 16,
      textAlign: I18nManager.isRTL ? "right" : "left",
    },
    teacherBio: {
      fontSize: 14,
      textAlign: I18nManager.isRTL ? "right" : "left",
    },
    otherVideosTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginHorizontal: 16,
      marginBottom: 12,
      marginTop: 16,
      textAlign: I18nManager.isRTL ? "right" : "left",
    },
    otherVideoCard: {
      width: "48%",
      marginBottom: 16,
    },
    otherVideoImage: {
      width: "100%",
      aspectRatio: 16 / 9,
      borderRadius: 8,
    },
    otherVideoTitle: {
      marginTop: 6,
      fontSize: 14,
      textAlign: I18nManager.isRTL ? "right" : "left",
    },
    extraInfoContainer: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    extraInfoInnerContainer: {
      display: "flex",
      flex: 1,
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    extraInfoRow: {
      display: "flex",
      flexGrow: 1,
      alignItems: "center",
      flexDirection: "row",
      gap: 4,
    },
    extraInfoText: {
      color: colors.text,
    },
    deleteButton: {
      padding: 4,
    },
  });

export default VideoDetailScreen;
