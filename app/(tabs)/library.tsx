import React from "react";

import ActiveDownloads from "@/app/components/ActiveDownloads";
import { StyleSheet, View } from "react-native";
import LibraryScreenComponent from "../screens/LibraryScreen";
// import { SafeAreaView } from "react-native-safe-area-context";
// import VideoDetailScreen from "../screens/VideoDetailScreen";

export default function LibraryScreen() {
  return (
    //   <SafeAreaView style={{ flex: 1, marginTop: 10 }}>
    //   <LibraryScreenComponent />
    //   {/* <VideoDetailScreen route={{ params: { video: { title: "فيديو 1", status: "تمت مشاهدته" } } }} navigation={{ navigate: () => {} }} /> */}
    // </SafeAreaView>
    <View style={styles.container}>

        <LibraryScreenComponent />
      <View style={styles.separator} />
      <ActiveDownloads />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
    backgroundColor: "#eee",
  },
});
