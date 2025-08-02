import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

import ProfileScreen from "../screens/ProfileScreen";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* <DashboardScreen /> */}
      <ProfileScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
