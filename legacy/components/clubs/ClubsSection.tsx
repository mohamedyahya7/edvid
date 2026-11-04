import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import HorizontalCard from "./HorizontalCard";

const ContentSection = ({ title, data }: { title: string; data: any[] }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => <HorizontalCard item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  list: {
    paddingHorizontal: 16,
    flex: 1,
    flexDirection: "row",
  },
});

export default ContentSection;
