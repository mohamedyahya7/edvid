import { useVideoScreen } from "@/hooks/useVideoScreen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  I18nManager,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubeIframe from "react-native-youtube-iframe";

export default function VideoDetailScreen() {
  const {
    video,
    otherVideos,
    isLoading,
    playing,
    playerRef,
    onReady,
    onStateChange,
  } = useVideoScreen();
  const [isUnlockModalVisible, setUnlockModalVisible] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const router = useRouter();

  const handleUnlock = () => {
    console.log("Unlocking with code:", activationCode);
    // Here we will call the API endpoint later
    setUnlockModalVisible(false);
  };

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1, backgroundColor: "#111" }} />;
  }

  if (!video) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Video not found.</Text>
      </View>
    );
  }

  const renderVideoPlayer = () => {
    if (video.youtube_id) {
      return (
        <View style={styles.videoContainer}>
          <YoutubeIframe
            ref={playerRef}
            height={220}
            play={playing}
            videoId={video.youtube_id}
            onReady={onReady}
            onChangeState={onStateChange}
          />
        </View>
      );
    }
    // Placeholder for paid/downloaded video
    return (
      <View style={[styles.videoImage, styles.placeholderContainer]}>
        <Ionicons name="lock-closed" size={48} color="#fff" />
        <Text style={styles.placeholderText}>
          Unlock this video to download and watch offline
        </Text>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={() => setUnlockModalVisible(true)}
        >
          <Text style={styles.unlockButtonText}>Unlock Video</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Video Player */}
      {renderVideoPlayer()}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isUnlockModalVisible}
        onRequestClose={() => {
          setUnlockModalVisible(!isUnlockModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Enter Activation Code</Text>
            <TextInput
              style={styles.input}
              placeholder="ABC-123-XYZ"
              placeholderTextColor="#888"
              onChangeText={setActivationCode}
              value={activationCode}
            />
            <TouchableOpacity style={styles.button} onPress={handleUnlock}>
              <Text style={styles.textStyle}>Activate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setUnlockModalVisible(false)}
            >
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <ActionButton
          icon={I18nManager.isRTL ? "arrow-undo-outline" : "share-outline"}
          label="Share"
        />
        <ActionButton icon="bookmark-outline" label="Bookmark" />
        <ActionButton icon="download-outline" label="Download" />
      </View>

      {/* Title & Description */}
      <Text style={styles.title}>{video.title}</Text>
      <Text style={styles.description}>
        {video.description || "Video description here..."}
      </Text>

      {/* Teacher Info */}
      <TouchableOpacity
        style={styles.teacherInfoContainer}
        onPress={() => router.push(`/teacher/${video.teacher_id}`)}
      >
        <Image
          source={{
            uri:
              video.teacher_profile_picture_url || "https://i.pravatar.cc/100",
          }}
          style={styles.teacherImage}
        />
        <View>
          <Text style={styles.teacherName}>{video.teacher_name}</Text>
          <Text style={styles.teacherBio}>Biology Teacher</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.classPage}>GO TO CLASS PAGE</Text>
      </TouchableOpacity>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <Text style={[styles.tab, styles.activeTab]}>Up Next</Text>
        <Text style={styles.tab}>Moments</Text>
      </View>

      {/* Other Videos */}
      <View>
        <Text style={styles.otherVideosTitle}>More from this Teacher</Text>
        <FlatList
          data={otherVideos}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.otherVideoCard}
              onPress={() => router.push(`/video/${item.id}`)}
            >
              <Image
                source={{
                  uri: item.cover_image_url || "https://i.pravatar.cc/300",
                }}
                style={styles.otherVideoImage}
              />
              <Text style={styles.otherVideoTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
          }}
        />
      </View>

      {/* Up Next List (example) */}
      <View style={styles.upNextRow}>
        <Image
          source={{ uri: video.cover_image_url || "https://i.pravatar.cc/100" }}
          style={styles.upNextThumb}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.upNextTitle}>2. Define Your Core Values</Text>
        </View>
        <Text style={styles.upNextDuration}>16:03</Text>
      </View>
      {/* ...more up next items */}
    </ScrollView>
  );
}

function ActionButton({ icon, label }: { icon: any; label: string }) {
  return (
    <TouchableOpacity style={styles.actionBtn}>
      <Ionicons name={icon} size={24} color="#fff" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  videoContainer: {
    width: "100%",
    height: 220,
    backgroundColor: "#000",
  },
  videoImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  unlockButton: {
    backgroundColor: "#f44",
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
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  actionBtn: { alignItems: "center", flex: 1 },
  actionLabel: { color: "#fff", marginTop: 4 },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginHorizontal: 16,
    marginBottom: 8,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  description: {
    color: "#ccc",
    marginHorizontal: 16,
    marginBottom: 16,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  classPage: {
    color: "#4a90e2",
    marginHorizontal: 16,
    marginBottom: 16,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  teacherInfoContainer: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  teacherImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: I18nManager.isRTL ? 0 : 12,
    marginLeft: I18nManager.isRTL ? 12 : 0,
  },
  teacherName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  teacherBio: {
    color: "#ccc",
    fontSize: 14,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  tabsRow: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    marginHorizontal: 16,
  },
  tab: {
    color: "#aaa",
    marginRight: I18nManager.isRTL ? 0 : 24,
    marginLeft: I18nManager.isRTL ? 24 : 0,
    paddingVertical: 8,
  },
  activeTab: { color: "#fff", borderBottomWidth: 2, borderBottomColor: "#f44" },
  upNextRow: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    margin: 16,
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 8,
  },
  upNextThumb: {
    width: 60,
    height: 40,
    borderRadius: 4,
    marginRight: I18nManager.isRTL ? 0 : 12,
    marginLeft: I18nManager.isRTL ? 12 : 0,
  },
  upNextTitle: {
    color: "#fff",
    fontSize: 14,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  upNextDuration: {
    color: "#fff",
    fontSize: 12,
    marginLeft: I18nManager.isRTL ? 0 : 8,
    marginRight: I18nManager.isRTL ? 8 : 0,
  },
  otherVideosTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 16,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  otherVideoCard: {
    width: 150,
    marginRight: I18nManager.isRTL ? 0 : 10,
    marginLeft: I18nManager.isRTL ? 10 : 0,
  },
  otherVideoImage: {
    width: "100%",
    height: 85,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  otherVideoTitle: {
    color: "#fff",
    marginTop: 6,
    fontSize: 14,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#333",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    width: "100%",
  },
  buttonClose: {
    backgroundColor: "#555",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
  },
  input: {
    height: 40,
    borderColor: "#555",
    borderWidth: 1,
    marginBottom: 20,
    color: "#fff",
    paddingHorizontal: 10,
    width: "100%",
    borderRadius: 5,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
});
