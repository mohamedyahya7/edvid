import React from "react";
import { SafeAreaView } from "react-native";

import LibraryScreenComponent from "../screens/LibraryScreen";
import VideoDetailScreen from "../screens/VideoDetailScreen";

export default function LibraryScreen() {
  return (
    <SafeAreaView style={{ flex: 1, marginTop: 10 }}>
      <LibraryScreenComponent />
      {/* <VideoDetailScreen route={{ params: { video: { title: "فيديو 1", status: "تمت مشاهدته" } } }} navigation={{ navigate: () => {} }} /> */}
    </SafeAreaView>
  );
}
