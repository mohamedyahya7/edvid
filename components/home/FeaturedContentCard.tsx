import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FeaturedContentCard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Next up in course</Text>
      <View style={styles.card}>
        {/* Top part */}
        <View style={styles.topPart}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }}
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <Text style={styles.courseTitle}>Basic Vowels + The Silent H</Text>
            <TouchableOpacity>
              <Text style={styles.viewCourse}>COURSE VIEW {">"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom part */}
        <View style={styles.bottomPart}>
          <Ionicons name="play-circle" size={40} color="#FFD700" />
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>Video Lesson</Text>
            <Text style={styles.lessonDuration}>3 min</Text>
          </View>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, color: "gray", marginBottom: 10 },
  card: { backgroundColor: "white", borderRadius: 16, overflow: "hidden" },
  topPart: { flexDirection: "row", padding: 15, alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  textContainer: { marginLeft: 10 },
  courseTitle: { fontWeight: "bold" },
  viewCourse: { color: "gray", fontSize: 12, fontWeight: "bold" },
  bottomPart: {
    backgroundColor: "#4a90e2",
    borderRadius: 12,
    margin: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lessonInfo: { flex: 1, marginLeft: 10 },
  lessonTitle: { color: "white", fontWeight: "bold" },
  lessonDuration: { color: "white", fontSize: 12 },
  startButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  startButtonText: { color: "#4a90e2", fontWeight: "bold" },
});

export default FeaturedContentCard;
