import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const libraryData = [
  {
    subject: "فيزياء",
    subjectIcon: "📘",
    teachers: [
      {
        name: "أ. سارة",
        videos: [
          { title: "فيديو 1", status: "تمت مشاهدته" },
          { title: "فيديو 2", status: "لم يبدأ" },
        ],
      },
      {
        name: "أ. محمود",
        videos: [{ title: "فيديو 3", status: "لم يبدأ" }],
      },
    ],
  },
  {
    subject: "كيمياء",
    subjectIcon: "📗",
    teachers: [
      {
        name: "أ. كريم",
        videos: [{ title: "فيديو 4", status: "تمت مشاهدته" }],
      },
    ],
  },
];

export default function LibraryScreen() {
  const [search, setSearch] = useState("");

  // Optional: filter videos by search
  const filteredData = libraryData
    .map((subject) => ({
      ...subject,
      teachers: subject.teachers
        .map((teacher) => ({
          ...teacher,
          videos: teacher.videos.filter(
            (video) =>
              video.title.includes(search) || teacher.name.includes(search)
          ),
        }))
        .filter((teacher) => teacher.videos.length > 0),
    }))
    .filter((subject) => subject.teachers.length > 0);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>فيديوهاتك المحمّلة</Text>
      {/* Optional: Search Bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن فيديو أو مدرس"
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
      </View>
      {filteredData.map((subject) => (
        <View key={subject.subject} style={styles.subjectBlock}>
          <Text style={styles.subjectTitle}>
            {subject.subjectIcon} {subject.subject}
          </Text>
          {subject.teachers.map((teacher) => (
            <View key={teacher.name} style={styles.teacherBlock}>
              <Text style={styles.teacherTitle}>👨‍🏫 {teacher.name}</Text>
              {teacher.videos.map((video) => (
                <View key={video.title} style={styles.videoRow}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <Text style={styles.videoStatus}>
                    {video.status === "تمت مشاهدته" ? "✅" : "⏳"}{" "}
                    {video.status}
                  </Text>
                  <TouchableOpacity style={styles.playBtn}>
                    <Ionicons name="play" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn}>
                    <Ionicons name="trash" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: { fontSize: 20, fontWeight: "bold", margin: 16, marginBottom: 8 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 16, padding: 8 },
  subjectBlock: { marginBottom: 24, marginHorizontal: 16 },
  subjectTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  teacherBlock: { marginBottom: 8, marginRight: 16 },
  teacherTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#4a90e2",
  },
  videoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 6,
    padding: 8,
    elevation: 1,
  },
  videoTitle: { flex: 2, fontSize: 14 },
  videoStatus: { flex: 1, fontSize: 13, color: "#888" },
  playBtn: {
    backgroundColor: "#4a90e2",
    borderRadius: 6,
    padding: 6,
    marginHorizontal: 4,
  },
  deleteBtn: {
    backgroundColor: "#e74c3c",
    borderRadius: 6,
    padding: 6,
    marginHorizontal: 4,
  },
});
