import React from "react";
import { StyleSheet, View } from "react-native";
import ExploreScreen from "@/screens/ExploreScreen";

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <ExploreScreen />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
