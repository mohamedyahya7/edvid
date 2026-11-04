import { useDownloadTasks } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import {
  
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { downloadManager } from "../../services/DownloadManager";

const ActiveDownloads = () => {
  const tasks = useDownloadTasks();
  const { colors } = useTheme();

  if (tasks.size === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* <Text style={[styles.header, { color: colors.text }]}>
        التحميلات النشطة {tasks.size}
      </Text> */}
      <ScrollView>
        {Array.from(tasks.values()).map((task) => (
          <View key={task.videoId} style={styles.taskContainer}>
            <Text style={[styles.taskTitle, { color: colors.text }]}>
              {task.videoTitle}
            </Text>
            <View style={styles.progressRow}>
              <Pressable
                
                onPress={() => downloadManager.cancelDownload(task.videoId)}
                
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${task.progress}%`,
                      backgroundColor: "#2Ad",
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {task.progress.toFixed(0)}%
              </Text>
              <View style={styles.buttonContainer}>
                {task.status === "downloading" && (
                  // 
                  <Pressable
                    onPress={() => downloadManager.pauseDownload(task.videoId)}
                  >
                    <Ionicons name="pause" size={24} color={colors.text} />
                  </Pressable>
                )}
                {task.status === "paused" && (
                 
                  <Pressable
                    onPress={() => downloadManager.resumeDownload(task.videoId)}
                  >
                    <Ionicons name="play" size={24} color={colors.text} />
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    maxHeight: "40%",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    elevation: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  taskContainer: {
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 16,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#555",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
  },
  progressText: {
    marginLeft: 10,
    fontSize: 12,
    minWidth: 40, // Ensure text alignment
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
});

export default ActiveDownloads;
