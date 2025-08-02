import { useTeacherProfileScreen } from "@/hooks/useTeacherProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type RootStackParamList = {
  "video/[id]": { id: string };
};

export default function TeacherProfileScreen() {
  const router = useRouter();
  const { teacher, videos, isLoading } = useTeacherProfileScreen();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={styles.container}>
        <Text>Teacher not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri:
            teacher.profile_picture_url ||
            "https://via.placeholder.com/400x250",
        }}
        style={styles.headerImage}
      />
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.uploadButton}>
        <Ionicons name="share-outline" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={styles.teacherName}>{teacher.name}</Text>
        <Text style={styles.courseTitle}>{teacher.bio}</Text>
      </View>

      <TouchableOpacity style={styles.startClassButton}>
        <Text style={styles.startClassButtonText}>START CLASS</Text>
      </TouchableOpacity>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="play" size={20} color="white" />
          <Text style={styles.actionText}>TRAILER</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.actionText}>MY LIST</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <Text style={[styles.tab, styles.activeTab]}>LESSONS</Text>
        <Text style={styles.tab}>CLASS RESOURCES</Text>
        <Text style={styles.tab}>OVERVIEW</Text>
      </View>

      <View style={styles.lessonsContainer}>
        {videos.map((video, index) => (
          <TouchableOpacity
            key={video.id}
            style={styles.lessonRow}
            onPress={() =>
              router.push({
                pathname: "/video/[id]",
                params: { id: video.id },
              })
            }
          >
            <Text style={styles.lessonNumber}>{index + 1}</Text>
            <View>
              <Text style={styles.lessonTitle}>{video.title}</Text>
              <Text style={styles.lessonDuration}>
                {video.duration_seconds
                  ? `${Math.floor(video.duration_seconds / 60)}m`
                  : "N/A"}
              </Text>
            </View>
            <Ionicons
              name={video.type === "free" ? "play-circle" : "lock-closed"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerImage: {
    width: "100%",
    height: 250,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  uploadButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  headerContent: {
    padding: 20,
  },
  teacherName: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  courseTitle: {
    color: "#fff",
    fontSize: 18,
    marginTop: 4,
  },
  startClassButton: {
    backgroundColor: "#e50914",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  startClassButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  actionButton: {
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    marginTop: 5,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  tab: {
    color: "#888",
    padding: 15,
    fontSize: 14,
  },
  activeTab: {
    color: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#e50914",
  },
  lessonsContainer: {
    padding: 20,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  lessonNumber: {
    color: "#888",
    fontSize: 18,
    marginRight: 15,
  },
  lessonTitle: {
    color: "#fff",
    fontSize: 16,
  },
  lessonDuration: {
    color: "#888",
    fontSize: 12,
  },
});
