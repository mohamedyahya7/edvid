// import VideoDetailScreen from "@/screens/VideoDetailScreen";

// export default function VideoScreen() {
//   return <VideoDetailScreen />;
// }
// import { useVideoScreen } from "@/hooks/useVideoScreen";
import React from "react";
import VideoDetailScreen from "@/screens/VideoDetailScreen";
// import React from "react";
// import {
//   ActivityIndicator,
//   Dimensions,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import YoutubeIframe from "react-native-youtube-iframe";

export default function VideoScreen() {
  return <VideoDetailScreen />;
  // const {
  //   isLoading,
  //   videoDetails,
  //   playing,
  //   playerRef,
  //   onReady,
  //   onStateChange,
  // } = useVideoScreen();
  // const { width, height } = Dimensions.get("window");

  // if (isLoading) {
  //   return (
  //     <View style={styles.container}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  // if (!videoDetails) {
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.text}>Video not found.</Text>
  //     </View>
  //   );
  // }

  // return (
  //   <View style={styles.container}>
  //     {videoDetails.youtube_id ? (
  //       <YoutubeIframe
  //         ref={playerRef}
  //         height={height * 0.3}
  //         width={width}
  //         play={playing}
  //         videoId={videoDetails.youtube_id}
  //         onChangeState={onStateChange}
  //         onReady={onReady}
  //       />
  //     ) : (
  //       <View style={styles.placeholderVideo}>
  //         <Text style={styles.placeholderText}>This is a paid video.</Text>
  //       </View>
  //     )}
  //     <Text style={styles.title}>{videoDetails.title}</Text>
  //     <Text style={styles.teacherName}>
  //       مقدم من: {videoDetails.teacher_name}
  //     </Text>
  //   </View>
  //);
}
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#111",
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#fff",
//     marginTop: 20,
//     marginHorizontal: 16,
//     textAlign: "right",
//   },
//   teacherName: {
//     fontSize: 16,
//     color: "#ccc",
//     marginTop: 8,
//     marginHorizontal: 16,
//     textAlign: "right",
//   },
//   placeholderVideo: {
//     height: "30%",
//     backgroundColor: "#000",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   placeholderText: {
//     color: "#fff",
//   },
//   text: {
//     fontSize: 20,
//     marginTop: 10,
//     textAlign: "center",
//     color: "#fff",
//   },
// });
