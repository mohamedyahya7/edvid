import { useExploreScreen } from "@/hooks/useExploreScreen";
import { Link, useRouter } from "expo-router";
import * as Updates from "expo-updates";
import i18next from "i18next";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  I18nManager,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HorizontalCard from "../../components/clubs/HorizontalCard";
import ActivationModal from "../components/ActivationModal";

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
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const teacherNames = suggestedTeachers
    .filter((t) => selectedTeacherIds.includes(t.id))
    .map((t) => t.name)
    .join(", ");

  const changeLang = async () => {
    const newLang = i18next.language.startsWith("ar") ? "en" : "ar";
    await i18next.changeLanguage(newLang);
    const isRTL = newLang.startsWith("ar");
    if (isRTL !== I18nManager.isRTL) {
      I18nManager.forceRTL(isRTL);
      await Updates.reloadAsync();
    }
  };

  return (
    <>
      <ActivationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      {/* Language Switcher Button (Temporary) */}
      <TouchableOpacity onPress={changeLang} style={styles.langSwitcher}>
        <Text style={styles.langSwitcherText}>
          {i18next.language.startsWith("ar")
            ? "Switch to English"
            : "التحويل للعربية"}
        </Text>
      </TouchableOpacity>
      {/* Video Code Input */}
      {selectedSubjectId || selectedTeacherIds.length > 0 ? (
        <View style={styles.filterInfoContainer}>
          <Text style={styles.filterInfoText}>
            {t("explore.filteringBy", {
              subject: selectedSubject?.title,
              teachers: teacherNames ? ` | ${teacherNames}` : "",
            })}
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFilterText}>
              {t("explore.clearFilters")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            placeholder={t("explore.videoCodePlaceholder")}
            style={styles.input}
            textAlign={I18nManager.isRTL ? "right" : "left"}
          />
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.inputButtonText}>
              {t("explore.videoCodeButton")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Study Subjects */}
      <SectionHeader title={t("explore.studySubjects")} />
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
        title={t("explore.suggestedTeachers")}
        onShowAll={() => router.push("/all-teachers")}
      />
      <ScrollView
        style={styles.row}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
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
      <SectionHeader title={t("explore.freeVideos")} />
    </>
  );
};

export default function ExploreScreen() {
  const { t } = useTranslation();
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
                  members: t("explore.free"),
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
  const { t } = useTranslation();
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onShowAll && (
        <TouchableOpacity onPress={onShowAll}>
          <Text style={styles.showAll}>{t("explore.showAll")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  langSwitcher: {
    backgroundColor: "#e0e7ff",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: "center",
  },
  langSwitcherText: {
    fontWeight: "bold",
    color: "#4338ca",
  },
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
    marginLeft: I18nManager.isRTL ? 0 : 8,
    marginRight: I18nManager.isRTL ? 8 : 0,
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
  showAll: {
    color: "#4a90e2",
    fontWeight: "bold",
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
  },
  row: {
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
  },
  chipContainer: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: I18nManager.isRTL ? 8 : 0,
    marginRight: I18nManager.isRTL ? 0 : 8,
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
    textAlign: I18nManager.isRTL ? "right" : "left",
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
    marginRight: I18nManager.isRTL ? 0 : "4%",
    marginLeft: I18nManager.isRTL ? "4%" : 0,
  },
});
