import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FeaturedContentCard from "@/components/home/FeaturedContentCard";
import GreetingHeader from "@/components/home/GreetingHeader";
import InfoRowCard from "@/components/home/InfoRowCard";
import StatCard from "@/components/home/StatCard";

const DashboardScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <GreetingHeader name="Sam Lee" />
        <FeaturedContentCard />
        <StatCard />

        <View style={styles.jumpInContainer}>
          <Text style={styles.sectionTitle}>Jump-in lessons</Text>
          <InfoRowCard
            iconName="book"
            title="Word Smart"
            subtitle="1,000 must-know words en español"
          />
          <InfoRowCard
            iconName="game-controller"
            title="Verb Master"
            subtitle="Verb conjugation and practice"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  jumpInContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 10,
  },
});

export default DashboardScreen;
