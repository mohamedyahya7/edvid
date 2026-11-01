import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { useExploreScreen } from "@/hooks/useExploreScreen";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  I18nManager,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import HorizontalCard from "../../components/clubs/HorizontalCard";
import { downloadManager } from "../../services/DownloadManager";
import ActivationModal from "../components/ActivationModal";

const Chip = React.memo(
  ({
    label,
    onPress,
    isSelected,
    image,
  }: {
    label: string;
    onPress: () => void;
    isSelected: boolean;
    image?: string;
  }) => {
    const { colors } = useTheme();
    return (
      <TouchableOpacity
        style={[
          styles.chip,
          { backgroundColor: isSelected ? colors.primary : colors.card },
        ]}
        onPress={onPress}
      >
        <ImageBackground
          source={{ uri: image }}
          style={styles.chipBackground}
          imageStyle={{ borderRadius: 20, opacity: isSelected ? 0.7 : 0.3 }}
        >
          <View style={styles.chipContent}>
            <ThemedText
              style={[
                styles.chipText,
                { color: isSelected ? "#fff" : colors.text },
              ]}
            >
              {label}
            </ThemedText>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }
);

const TeacherCard = React.memo(
  ({
    teacher,
    onPress,
    onLongPress,
  }: {
    teacher: any;
    onPress: () => void;
    onLongPress?: () => void;
  }) => {
    const { colors } = useTheme();
    return (
      <TouchableOpacity
        style={[styles.teacherCard, { backgroundColor: colors.card }]}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <Image
          source={{ uri: teacher.profile_picture_url }}
          style={styles.teacherImage}
        />
        <View style={styles.teacherInfo}>
          <ThemedText style={styles.teacherName} numberOfLines={1}>
            {teacher.name}
          </ThemedText>
          <ThemedText style={styles.teacherSubject} numberOfLines={1}>
            {teacher.subject_name}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  }
);

const ExploreScreenHeader = React.memo(
  ({
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
    const router = useRouter();
    const { colors } = useTheme();
    const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

    const teacherNames = suggestedTeachers
      .filter((t) => selectedTeacherIds.includes(t.id))
      .map((t) => t.name)
      .join(", ");

    if (subjects.length === 0) {
      return (
        <ThemedView
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivationModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
          />

          <TouchableOpacity
            style={[styles.inputRow, { backgroundColor: colors.card }]}
            onPress={() => setModalVisible(true)}
          >
            <ThemedText style={styles.placeholderText}>
              Ù…Ø¹Ùƒ ÙƒÙˆØ¯ Ø§Ù„ÙÙŠØ¯ÙŠÙˆØŸ
            </ThemedText>
            <Ionicons
              name="qr-code-outline"
              size={24}
              color={colors.text}
              style={{ opacity: 0.8 }}
            />
          </TouchableOpacity>
          <ThemedText style={{ marginTop: 20, textAlign: "center" }}>
            Ø£Ù†Øª Ù„Ø§ ØªØªØ§Ø¨Ø¹ Ø£ÙŠ Ù…ÙˆØ§Ø¯ Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.
          </ThemedText>
          <ThemedText style={{ textAlign: "center" }}>
            Ø§Ø°Ù‡Ø¨ Ø¥Ù„Ù‰ Ø´Ø§Ø´Ø© Ø§Ù„Ù…ÙˆØ§Ø¯ Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ù…ÙˆØ§Ø¯ ÙˆØ±Ø¤ÙŠØªÙ‡Ø§ Ù‡Ù†Ø§.
          </ThemedText>
        </ThemedView>
      );
    }
    return (
      <>
        <View style={{ margin: 16 }}>
          <Button
            title="Test Download (Sintel Trailer)"
            onPress={() => {
              const testVideo = {
                videoId: "4",
                videoTitle: "Sintel Trailer (Test Video)",
                code: "static-test-code-small",
                videoUrl:
                  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                // "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                audioUrl: undefined,
                totalBytesExpected: 8947649, // Actual size for progress bar
                access_type: "download" as const,
              };
              downloadManager.enqueueDownload(
                testVideo.videoId,
                testVideo.videoTitle,
                testVideo.code,
                { videoUrl: testVideo.videoUrl, audioUrl: testVideo.audioUrl },
                testVideo.access_type
              );
            }}
          />
        </View>

        <ActivationModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />

        {/* Video Code Input */}
        {selectedSubjectId || selectedTeacherIds.length > 0 ? (
          <View
            style={[
              styles.filterInfoContainer,
              { backgroundColor: colors.primary },
            ]}
          >
            <ThemedText style={styles.filterInfoText}>
              {`ÙÙ„ØªØ±Ø© Ø¨Ù€: ${selectedSubject?.title || ""}${
                teacherNames ? ` | ${teacherNames}` : ""
              }`}
            </ThemedText>
            <TouchableOpacity onPress={clearFilters}>
              <ThemedText style={styles.clearFilterText}>
                Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ÙÙ„Ø§ØªØ±
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.inputRow, { backgroundColor: colors.card }]}
            onPress={() => setModalVisible(true)}
          >
            <ThemedText style={styles.placeholderText}>
              Ù…Ø¹Ùƒ ÙƒÙˆØ¯ Ø§Ù„ÙÙŠØ¯ÙŠÙˆØŸ
            </ThemedText>
            <Ionicons
              name="qr-code-outline"
              size={24}
              color={colors.text}
              style={{ opacity: 0.8 }}
            />
          </TouchableOpacity>
        )}

        {/* Study Subjects */}
        <SectionHeader title="ðŸ§ª Ø§Ù„Ù…ÙˆØ§Ø¯ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠØ©" />
        <View style={styles.chipContainer}>
          {subjects.map((subject) => (
            <Chip
              key={subject.id}
              label={subject.title}
              isSelected={selectedSubjectId === subject.id}
              onPress={() => toggleSubjectFilter(subject.id)}
              image={subject.image_url}
            />
          ))}
        </View>

        {/* Suggested Teachers */}
        <SectionHeader
          title="ðŸ‘¨â€ðŸ« Ù…Ø¯Ø±Ø³ÙŠÙ† Ù…Ù‚ØªØ±Ø­ÙŠÙ†"
          onShowAll={() => router.push("/all-teachers")}
        />
        <ScrollView
          style={styles.row}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {suggestedTeachers.slice(0, 5).map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
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
              onLongPress={() => {
                if (selectedSubjectId) {
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
        <SectionHeader title="ðŸŽ ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª Ù…Ø¬Ø§Ù†ÙŠØ©" />
      </>
    );
  }
);

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
    refetchData,
  } = useExploreScreen();
  const isFocused = useIsFocused();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isFocused) {
      refetchData();
    }
  }, [isFocused, refetchData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetchData();
    setIsRefreshing(false);
  }, [refetchData]);

  const renderItem = useCallback(({ item: video }: { item: any }) => {
    // --- TEMPORARY FIX for data inconsistency ---
    if ((video as any).type && !video.video_type) {
      video.video_type = (video as any).type;
    }
    // --- END OF FIX ---

    if (video.video_type !== "free") return null;
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
            image={`https://img.youtube.com/vi/${video.youtube_id}/0.jpg`}
            item={{
              title: video.title,
              // image: `https://img.youtube.com/vi/${video.youtube_id}/0.jpg`,
              teacher_name: video.teacher_name,
              teacher_profile_picture_url: video.teacher_image,
              teacher_subject: video.subject_name,
            }}
          />
        </Link>
      </View>
    );
  }, []);

  const listHeaderComponent = useMemo(
    () => (
      <ExploreScreenHeader
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        toggleSubjectFilter={toggleSubjectFilter}
        clearFilters={clearFilters}
        suggestedTeachers={suggestedTeachers}
        selectedTeacherIds={selectedTeacherIds}
        toggleTeacherFilter={toggleTeacherFilter}
      />
    ),
    [
      subjects,
      selectedSubjectId,
      toggleSubjectFilter,
      clearFilters,
      suggestedTeachers,
      selectedTeacherIds,
      toggleTeacherFilter,
    ]
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={freeVideos}
      renderItem={renderItem}
      keyExtractor={(video) => video.id.toString()}
      numColumns={2}
      ListHeaderComponent={listHeaderComponent}
      contentContainerStyle={styles.listContentContainer}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
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
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {onShowAll && (
        <TouchableOpacity onPress={onShowAll}>
          <ThemedText style={[styles.showAll, { color: colors.primary }]}>
            Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    borderRadius: 10,
    marginTop: 16,
    height: 60, // Set the same fixed height
    paddingHorizontal: 16,
    gap: 8,
  },
  placeholderText: {
    fontSize: 16,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    padding: 8,
    borderRadius: 8,
    marginLeft: I18nManager.isRTL ? 0 : 8,
    marginRight: I18nManager.isRTL ? 8 : 0,
  },
  inputButton: {
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
    fontWeight: "bold",
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
  },
  row: {
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: I18nManager.isRTL ? "row" : "row",
  },
  chipContainer: {
    flexDirection: I18nManager.isRTL ? "row" : "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  chip: {
    borderRadius: 20,
    marginBottom: 8,
    height: 80,
    width: "32%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  chipBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  chipContent: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { fontSize: 14, fontWeight: "bold" },
  filterInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 16,
    marginHorizontal: 16,
    height: 60, // Set a fixed height
  },
  filterInfoText: {
    color: "white",
    flex: 1,
    fontSize: 14,
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  clearFilterText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    textDecorationLine: "underline",
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
  teacherCard: {
    flexDirection: "row",
    alignItems: "center",
    width: 180,
    marginRight: 12,
    borderRadius: 12,
    padding: 8,
  },
  teacherImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 8,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  teacherSubject: {
    fontSize: 12,
    opacity: 0.8,
  },
});
