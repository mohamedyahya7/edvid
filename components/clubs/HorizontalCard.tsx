import { storageUrl } from "@/api/Axios";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../ui/ThemedText";

export default function HorizontalCard({
  item,
  style,
  image, // Use a dedicated prop for external images
  ...props
}: {
  item: any;
  style?: any;
  image?: string;
  [x: string]: any;
}) {
  const { colors } = useTheme();
  if (item.type === "create") {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          styles.createContainer,
          { backgroundColor: colors.card },
          style,
        ]}
        {...props}
      >
        <ThemedText style={styles.createText}>+ Create club</ThemedText>
      </TouchableOpacity>
    );
  }

  // Use the external `image` prop if provided, otherwise fall back to `item.image`
  const imageUrl = image || (item.image ? storageUrl + item.image : undefined);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }, style]}
      {...props}
    >
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
      <View style={styles.textContainer}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {item.title}
        </ThemedText>
        {item.teacher_name && (
          <View style={styles.teacherInfoContainer}>
            {item.teacher_profile_picture_url && (
              <Image
                source={{
                  uri: storageUrl + item.teacher_profile_picture_url,
                }}
                style={styles.teacherImage}
              />
            )}
            <View style={styles.teacherTextContainer}>
              <ThemedText style={styles.teacherName} numberOfLines={1}>
                {item.teacher_name}
              </ThemedText>
              {item.teacher_subject && (
                <ThemedText style={styles.teacherSubject} numberOfLines={1}>
                  {item.teacher_subject}
                </ThemedText>
              )}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginRight: 10,
    borderRadius: 16,
    overflow: "hidden",
  },
  createContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 225,
  },
  createText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 100,
    // borderBottomLeftRadius: 8,
    borderBottomRightRadius: 18,
  },
  textContainer: {
    padding: 8,
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  teacherInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  teacherImage: {
    width: 28,
    height: 28,
    borderRadius: 12,
    marginRight: 8,
  },
  teacherTextContainer: {
    flex: 1,
    // gap: 1,
  },
  teacherName: {
    fontSize: 12,
  },
  teacherSubject: {
    fontSize: 10,
    opacity: 0.8,
  },
});
