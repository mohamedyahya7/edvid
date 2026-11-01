import { useAuthStore } from "@/lib/store/authStore";
import React from "react";
import { Button, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { url } from "../api/Axios";

const TeacherDashboardScreen = () => {
  const { signOut } = useAuthStore((state) => state.actions);
  return (
    <View style={styles.container}>
      <Button title="Logout" onPress={() => signOut()} />
      <WebView
        source={{ uri: `${url}/teacher`}}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default TeacherDashboardScreen;
