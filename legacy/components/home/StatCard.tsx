import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const StatCard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your progress</Text>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="flame" size={24} color="orange" />
        </View>
        <View>
          <Text style={styles.days}>0 days</Text>
          <Text style={styles.subText}>Start a new streak</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, color: "gray", marginBottom: 10 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 8,
    marginRight: 15,
  },
  days: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subText: {
    color: "gray",
  },
});

export default StatCard;
