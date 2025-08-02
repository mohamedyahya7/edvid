import { databaseService } from "@/lib/DatabaseService";
import { useAppStore } from "@/lib/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SelectGradeScreen() {
  const db = useSQLiteContext();
  const { setSelectedGradeId } = useAppStore((state) => state.actions);
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGrades() {
      try {
        const result = await databaseService.getGrades(db);
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
      await AsyncStorage.setItem("selectedGradeId", gradeId);
      setSelectedGradeId(gradeId);
      router.replace("/(tabs)"); // Navigate to the main app
    } catch (error) {
      console.error("Failed to save selected grade:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Grade</Text>
      {grades.map((grade) => (
        <TouchableOpacity
          key={grade.id}
          style={styles.gradeButton}
          onPress={() => handleSelectGrade(grade.id)}
        >
          <Text style={styles.gradeButtonText}>{grade.title}</Text>
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
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  gradeButton: {
    backgroundColor: "#fff",
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
