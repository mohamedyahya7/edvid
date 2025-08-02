import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const InfoRowCard = ({ iconName, title, subtitle }: { iconName: keyof typeof Ionicons.glyphMap, title: string, subtitle: string }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={24} color="#888" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 8,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    color: "gray",
    marginTop: 2,
  },
});

export default InfoRowCard;
