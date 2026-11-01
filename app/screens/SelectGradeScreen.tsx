import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { getGrades } from "@/lib/db/queries/grade.queries";
import { saveSetting } from "@/lib/db/queries/settings.queries";
import { useAppActions } from "@/lib/store";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

export default function SelectGradeScreen() {
  const db = useSQLiteContext();
  const { setSelectedGradeId } = useAppActions();
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    async function fetchGrades() {
      try {
        const result = await getGrades(db);
        setGrades(result);
      } catch (error) {
        console.error("Failed to fetch grades:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGrades();
  }, [db]);

  const handleSelectGrade = async (gradeId: string) => {
    try {
      await saveSetting(db, "selected_grade_id", gradeId);
      setSelectedGradeId(gradeId);
      router.replace("/(tabs)"); // Navigate to the main app
    } catch (error) {
      console.error("Failed to save selected grade:", error);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Select Your Grade</ThemedText>
      {grades.map((grade) => (
        <TouchableOpacity
          key={grade.id}
          style={[styles.gradeButton, { backgroundColor: colors.card }]}
          onPress={() => handleSelectGrade(grade.id)}
        >
          <ThemedText style={styles.gradeButtonText}>{grade.title}</ThemedText>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  gradeButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradeButtonText: {
    fontSize: 18,
    fontWeight: "500",
  },
});
