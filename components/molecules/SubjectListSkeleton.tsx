import { Colors } from "@/constants/Colors";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Card, useTheme } from "react-native-paper";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

const SkeletonItem = () => {
    const theme = useTheme();
    const isDark = theme.dark;
    const colors = isDark ? Colors.dark : Colors.light;
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.5, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
            <Card.Content style={styles.content}>
                <View style={styles.leftContent}>
                    <Animated.View
                        style={[
                            styles.imagePlaceholder,
                            { backgroundColor: colors.border },
                            animatedStyle,
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.textPlaceholder,
                            { backgroundColor: colors.border },
                            animatedStyle,
                        ]}
                    />
                </View>
                <Animated.View
                    style={[
                        styles.switchPlaceholder,
                        { backgroundColor: colors.border },
                        animatedStyle,
                    ]}
                />
            </Card.Content>
        </Card>
    );
};

export const SubjectListSkeleton = () => {
    return (
        <View style={styles.container}>
            {[1, 2, 3, 4, 5, 6].map((key) => (
                <SkeletonItem key={key} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        marginBottom: 12,
        elevation: 2,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    leftContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 16,
    },
    imagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    textPlaceholder: {
        height: 20,
        width: "60%",
        borderRadius: 4,
    },
    switchPlaceholder: {
        width: 40,
        height: 24,
        borderRadius: 12,
    },
});
