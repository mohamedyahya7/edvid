import { Ionicons } from "@expo/vector-icons";
import React from "react";
import HorizontalCard from "../../components/clubs/HorizontalCard";
import FeaturedContentCard from "../../components/home/FeaturedContentCard";
import GreetingHeader from "../../components/home/GreetingHeader";
import InfoRowCard from "../../components/home/InfoRowCard";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Simple chip for teachers and videos
const Chip = ({ label }: { label: string }) => (
  <TouchableOpacity style={styles.chip}>
    <Text style={styles.chipText}>{label}</Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Ionicons name="notifications-outline" size={24} />
        <Text style={styles.topBarTitle}>الصفحة الشخصية</Text>
        <Ionicons name="settings-outline" size={24} />
      </View>

      {/* Greeting */}
      <GreetingHeader name="محمد" />

      {/* Continue Watching */}
      <Text style={styles.sectionTitle}>🎬 استكمال المشاهدة</Text>
      <FeaturedContentCard />

      {/* Stats */}
      <Text style={styles.sectionTitle}>📊 ملخصك:</Text>
      <View style={styles.row}>
        <InfoRowCard
          iconName="folder-outline"
          title="فيديوهات محفوظة"
          subtitle="6 فيديوهات محفوظة"
        />
        <InfoRowCard
          iconName="book-outline"
          title="مواد دراسية"
          subtitle="4 مواد دراسية"
        />
        <InfoRowCard
          iconName="code-slash-outline"
          title="كود مستخدم"
          subtitle="12 كود مستخدم"
        />
      </View>

      {/* Teachers */}
      <Text style={styles.sectionTitle}>👨‍🏫 مدرسين مشترك معاهم:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
      >
        <HorizontalCard
          item={{
            title: "أ. سارة",
            image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            members: "عربي",
            activity: "10",
          }}
        />
        <HorizontalCard
          item={{
            title: "أ. محمد",
            image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            members: "انجليزي",
            activity: "10",
          }}
        />
        <HorizontalCard
          item={{
            title: "أ. محمد",
            image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            members: "انجليزي",
            activity: "10",
          }}
        />
      </ScrollView>

      {/* Unfinished Videos */}
      <Text style={styles.sectionTitle}>📌 فيديوهات لسه مخلصتهاش:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
      >
        <HorizontalCard
          item={{
            title: "الدوال – أ. أحمد",
            image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            members: "100",
            activity: "100",
          }}
        />
        <HorizontalCard
          item={{
            title: "الدوال – أ. أحمد",
            image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            members: "100",
            activity: "100",
          }}
        />
        <HorizontalCard
          item={{
            title: "الكهرباء – أ. كريم",
            image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            members: "100",
            activity: "100",
          }}
        />
      </ScrollView>

      {/* New from Teachers */}
      <Text style={styles.sectionTitle}>🆕 جديد من مدرسينك:</Text>
      <View style={styles.row}>
        <Chip label="VideoCard مغلق" />
        <Chip label="VideoCard مفتوح" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  topBarTitle: { fontWeight: "bold", fontSize: 18 },
  sectionTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 16,
    fontWeight: "bold",
    margin: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    // flexWrap: "wrap",
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 16,
  },
  chip: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 14 },
});
