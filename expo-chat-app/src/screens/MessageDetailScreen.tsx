import React from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Animated,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { MessagesStackParamList, HandledStackParamList } from "../types";
import { colors, spacing, radii, typography, shadows } from "../theme";


type Props =
    | NativeStackScreenProps<MessagesStackParamList, "MessageDetail">
    | NativeStackScreenProps<HandledStackParamList, "HandledDetail">;


/**
 * Full-screen message detail view.
 * Shows the complete message content with author info and AI summary.
 * The native stack provides the "< Back" button automatically.
 */
export function MessageDetailScreen({ route }: Props) {
    const { message } = route.params;

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(12)).current;


    /** Entrance animation — gentle fade + slide up */
    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);


    /** Format the received date for display */
    const formattedDate = new Date(message.receivedAt).toLocaleDateString(
        "en-US",
        {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }
    );


    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                }}
            >
                {/* Author header */}
                <View style={styles.authorSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {message.author.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <Text style={styles.authorName}>{message.author}</Text>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                </View>

                {/* AI summary badge */}
                <View style={styles.summaryBadge}>
                    <Text style={styles.summaryLabel}>AI SUMMARY</Text>
                    <Text style={styles.summaryText}>{message.summary}</Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Full message content */}
                <Text style={styles.messageContent}>{message.content}</Text>
            </Animated.View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
    },

    content: {
        padding: spacing.xxl,
        paddingTop: spacing.xxxl,
    },

    authorSection: {
        alignItems: "center",
        marginBottom: spacing.xxl,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: radii.full,
        backgroundColor: colors.bgAccent,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.borderPrimary,
    },

    avatarText: {
        fontSize: 18,
        fontFamily: "DMSans_700Bold",
        color: colors.textPrimary,
    },

    authorName: {
        ...typography.title,
        fontSize: 17,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },

    dateText: {
        ...typography.caption,
        color: colors.textTertiary,
    },

    summaryBadge: {
        backgroundColor: colors.bgTertiary,
        borderRadius: radii.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.borderPrimary,
        marginBottom: spacing.xxl,
        ...shadows.card,
    },

    summaryLabel: {
        ...typography.sectionLabel,
        fontSize: 10,
        color: colors.accentBlue,
        marginBottom: spacing.sm,
    },

    summaryText: {
        ...typography.body,
        color: colors.textSecondary,
    },

    divider: {
        height: 1,
        backgroundColor: colors.borderPrimary,
        marginBottom: spacing.xxl,
    },

    messageContent: {
        fontSize: 16,
        fontFamily: "DMSans_400Regular",
        color: colors.textPrimary,
        lineHeight: 26,
        letterSpacing: 0.15,
    },
});
