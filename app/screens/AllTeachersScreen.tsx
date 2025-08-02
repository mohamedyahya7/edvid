import { useAllTeachersScreen } from "@/hooks/useAllTeachersScreen";
import { Ionicons } from "@expo/vector-icons";
import { Link, useNavigation } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  I18nManager,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TeacherItem = ({ item }: { item: any }) => (
  <Link href={{ pathname: "/teacher/[id]", params: { id: item.id } }} asChild>
    <TouchableOpacity style={styles.teacherCard}>
      <Image
        source={{
          uri: item.profile_picture_url || "https://via.placeholder.com/100",
        }}
        style={styles.teacherImage}
      />
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.teacherBio} numberOfLines={2}>
          {item.bio}
        </Text>
      </View>
      <Ionicons
        name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"}
        size={24}
        color="#ccc"
      />
    </TouchableOpacity>
  </Link>
);

export default function AllTeachersScreen() {
  const navigation = useNavigation();
  const { teachersBySubject, isLoading } = useAllTeachersScreen();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>كل المدرسين</Text>
        <View style={{ width: 24 }} />
      </View>
      <SectionList
        sections={teachersBySubject}
        keyExtractor={(item, index) => item.id + index}
        renderItem={({ item }) => <TeacherItem item={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#f9f9f9",
    paddingVertical: 8,
    paddingHorizontal: 0,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  teacherCard: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teacherImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: I18nManager.isRTL ? 0 : 16,
    marginLeft: I18nManager.isRTL ? 16 : 0,
  },
  teacherInfo: {
    flex: 1,
    alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  teacherBio: {
    fontSize: 14,
    color: "#666",
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
});
