import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HorizontalCard({
  item,
  style,
  ...props
}: {
  item: any;
  style?: any;
  [x: string]: any;
}) {
  if (item.type === "create") {
    return (
      <TouchableOpacity
        style={[styles.container, styles.createContainer, style]}
        {...props}
      >
        <Text style={styles.createText}>+ Create club</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.container, style]} {...props}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.members}>{item.members}</Text>
        <Text style={styles.activity}>{item.activity}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 150,
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  createContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    height: 225, // Same height as regular cards
  },
  createText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 150,
  },
  title: {
    fontWeight: "bold",
    padding: 8,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  members: {
    fontSize: 12,
    color: "gray",
  },
  activity: {
    fontSize: 12,
    color: "gray",
  },
});

// export default HorsontilCard;
