import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { getGrades } from "@/lib/db/queries/grade.queries";
import { saveSetting } from "@/lib/db/queries/settings.queries";
import { useAppActions } from "@/lib/store";

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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Select Your Grade</Text>
      {grades.map((grade) => (
        <TouchableOpacity
          key={grade.id}
          style={[styles.gradeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => handleSelectGrade(grade.id)}
        >
          <Text style={[styles.gradeButtonText, { color: colors.text }]}>{grade.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
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
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  gradeButtonText: {
    fontSize: 16.5,
    fontWeight: "600",
  },
});
