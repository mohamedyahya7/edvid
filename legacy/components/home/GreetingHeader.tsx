import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GreetingHeader = ({ name }: { name: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back {name}</Text>
      <View style={styles.iconContainer}>
        <Ionicons name="cash-outline" size={24} color="green" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#e0f5e9",
  },
});

export default GreetingHeader;
