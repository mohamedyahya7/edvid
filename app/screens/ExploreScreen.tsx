import { useExploreScreen } from "@/hooks/useExploreScreen";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
} from "react-native";
import HorizontalCard from "../../components/clubs/HorizontalCard";

const Chip = ({
  label,
  onPress,
  isSelected,
}: {
  label: string;
  onPress: () => void;
  isSelected: boolean;
}) => (
  <TouchableOpacity
    style={[styles.chip, isSelected && styles.chipSelected]}
    onPress={onPress}
  >
    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ExploreScreenHeader = ({
  subjects,
  selectedSubjectId,
  toggleSubjectFilter,
  clearFilters,
  suggestedTeachers,
  selectedTeacherIds,
  toggleTeacherFilter,
}: {
  subjects: any[];
  selectedSubjectId: string | null;
  toggleSubjectFilter: (id: string) => void;
  clearFilters: () => void;
  suggestedTeachers: any[];
  selectedTeacherIds: string[];
  toggleTeacherFilter: (id: string) => void;
}) => {
  const router = useRouter();
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <>
      {/* Video Code Input */}
      {(selectedSubjectId || selectedTeacherIds.length > 0) ? (
        <View style={styles.filterInfoContainer}>
          <Text style={styles.filterInfoText}>
            فلترة بـ:
            {selectedSubject?.title}
            {selectedTeacherIds.length > 0
              ? ` | ${suggestedTeachers
                  .filter((t) => selectedTeacherIds.includes(t.id))
                  .map((t) => t.name)
                  .join(", ")}`
              : ""}
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFilterText}>إزالة الفلاتر</Text>
          </TouchableOpacity>
        </View>
      ) :
       
      <View style={styles.inputRow}>
        <TextInput
          placeholder="🎁 معك كود الفيديو؟"
          style={styles.input}
          textAlign="right"
        />
        <TouchableOpacity style={styles.inputButton}>
          <Text style={styles.inputButtonText}>📥 </Text>
        </TouchableOpacity>
      </View>
       }

      {/* Study Subjects */}
      <SectionHeader title="🧪 المواد الدراسية" />
      <View style={styles.chipContainer}>
        {subjects.map((subject) => (
          <Chip
            key={subject.id}
            label={subject.title}
            isSelected={selectedSubjectId === subject.id}
            onPress={() => toggleSubjectFilter(subject.id)}
          />
        ))}
      </View>

      

      {/* Suggested Teachers */}
      <SectionHeader
        title="👨‍🏫 مدرسين مقترحين"
        onShowAll={() => router.push("/all-teachers")}
      />
      <ScrollView style={styles.row} horizontal showsHorizontalScrollIndicator={false}>
        {suggestedTeachers.slice(0, 5).map((teacher) => (
          <Chip
            key={teacher.id}
            label={teacher.name}
            isSelected={selectedTeacherIds.includes(teacher.id)}
            onPress={() => {
              if (selectedSubjectId) {
                toggleTeacherFilter(teacher.id);
              } else {
                router.push({
                  pathname: "/teacher/[id]",
                  params: { id: teacher.id },
                });
              }
            }}
          />
        ))}
      </ScrollView>

      {/* Free Videos Header */}
      <SectionHeader title="🎁 فيديوهات مجانية" />
    </>
  );
};

export default function ExploreScreen() {
  const {
    subjects,
    suggestedTeachers,
    freeVideos,
    isLoading,
    selectedSubjectId,
    selectedTeacherIds,
    isFetchingMore,
    toggleSubjectFilter,
    toggleTeacherFilter,
    clearFilters,
    handleLoadMore,
  } = useExploreScreen();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={freeVideos}
      renderItem={({ item: video }) => {
        if (video.type !== "free") return null;
        return (
          <View style={styles.videoCardContainer}>
            <Link
              href={{
                pathname: "/video/[id]",
                params: { id: video.id },
              }}
              asChild
            >
              <HorizontalCard
                item={{
                  title: video.title,
                  image: `https://img.youtube.com/vi/${video.youtube_id}/0.jpg`,
                  members: "مجاني",
                  activity: "",
                }}
              />
            </Link>
          </View>
        );
      }}
      keyExtractor={(video) => video.id.toString()}
      numColumns={2}
      ListHeaderComponent={
        <ExploreScreenHeader
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          toggleSubjectFilter={toggleSubjectFilter}
          clearFilters={clearFilters}
          suggestedTeachers={suggestedTeachers}
          selectedTeacherIds={selectedTeacherIds}
          toggleTeacherFilter={toggleTeacherFilter}
        />
      }
      contentContainerStyle={styles.listContentContainer}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingMore ? (
          <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
        ) : null
      }
    />
  );
}

function SectionHeader({
  title,
  onShowAll,
}: {
  title: string;
  onShowAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onShowAll && (
        <TouchableOpacity onPress={onShowAll}>
          <Text style={styles.showAll}>→ عرض الكل</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginLeft: 8,
  },
  inputButton: {
    backgroundColor: "#4a90e2",
    borderRadius: 8,
    padding: 10,
  },
  inputButtonText: { color: "#fff", fontSize: 18 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  showAll: { color: "#4a90e2", fontWeight: "bold" },
  row: { marginHorizontal: 16, marginBottom: 8, flexDirection: "row" },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#4a90e2",
  },
  chipText: { fontSize: 14 },
  chipTextSelected: {
    color: "#fff",
  },
  filterInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eef5ff",
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  clearFilterText: {
    fontSize: 14,
    color: "#ff4d4f",
    fontWeight: "bold",
  },
  videosGrid: {
    paddingHorizontal: 16,
  },
  listContentContainer: {
    paddingHorizontal: 16,
  },
  videoCardContainer: {
    width: "48%", // Two columns with a little space
    marginBottom: 16,
    marginRight: "4%",
  },
});
