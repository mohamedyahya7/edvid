import React from "react";
import { StyleSheet, View } from "react-native";

import ProfileScreen from "../screens/ProfileScreen";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* <DashboardScreen /> */}
      <ProfileScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
