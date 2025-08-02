import { useDownloadTasks } from "@/lib/store";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "react-native-paper"; // Assuming you have react-native-paper

const ActiveDownloads = () => {
  const tasks = useDownloadTasks();

  if (tasks.size === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Active Downloads</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Downloads</Text>
      {Array.from(tasks.values()).map((task) => (
        <View key={task.videoId} style={styles.taskContainer}>
          <Text style={styles.taskTitle}>{task.videoTitle}</Text>
          <Text style={styles.status}>
            Status: {task.status} - {task.progress}%
          </Text>
          {task.status === "downloading" && (
            <ProgressBar
              progress={task.progress / 100}
              style={styles.progressBar}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  status: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  progressBar: {
    marginTop: 8,
  },
});

export default ActiveDownloads;
