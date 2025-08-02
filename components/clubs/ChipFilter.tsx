import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

const FILTERS = ["Featured", "Books", "TV Shows", "Genres", "Languages"];

const ChipFilter = () => {
  const [activeFilter, setActiveFilter] = React.useState("Featured");

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.chip, activeFilter === filter && styles.activeChip]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.chipText,
                activeFilter === filter && styles.activeChipText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: "#333",
  },
  chipText: {
    color: "#333",
  },
  activeChipText: {
    color: "#fff",
  },
});

export default ChipFilter;
