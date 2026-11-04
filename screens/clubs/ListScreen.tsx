import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import ContentSection from "@/components/clubs/ContentSection";
import ChipFilter from "@/components/clubs/ChipFilter";

// Mock Data
const clubsForYou = [
  {
    id: "1",
    title: "Through the Classic Glass",
    members: "2.2K",
    activity: "5 posts a day",
    image: "https://picsum.photos/seed/picsum1/640/480",
  },
  {
    id: "2",
    title: "Difficult Women Book Club",
    members: "1.0K",
    activity: "No recent activity",
    image: "https://picsum.photos/seed/picsum2/640/480",
  },
  {
    id: "3",
    title: "Another Club",
    members: "500",
    activity: "Active",
    image: "https://picsum.photos/seed/picsum3/640/480",
  },
];

const newClubs = [
  {
    id: "1",
    title: "The Dark Side",
    members: "1.2K",
    activity: "New",
    image: "https://picsum.photos/seed/picsum4/640/480",
  },
  {
    id: "2",
    title: "Smut and Thriller",
    members: "3.4K",
    activity: "New",
    image: "https://picsum.photos/seed/picsum5/640/480",
  },
  { id: "3", type: "create" },
];

const ListScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Clubs</Text>
          {/* Search Icon */}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabTextActive}>Find Clubs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Your Clubs</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ChipFilter />

        {/* Clubs Sections */}
        <View style={styles.sectionsContainer}>
          <ContentSection title="Clubs for you" data={clubsForYou} />
          <ContentSection
            title="Clubs starting something new"
            data={newClubs}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tab: {
    marginRight: 20,
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: "gray",
  },
  tabTextActive: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  sectionsContainer: {
    marginTop: 20,
  },
});

export default ListScreen;
