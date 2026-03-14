import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from "react-native";

import { Message } from "../types";
import { colors, shadows, spacing, radii, typography } from "../theme";


/**
 * Formats a Date into a human-readable relative string.
 * Shows "Just now", "Xm ago", "Xh ago", or "Xd ago".
 *
 * @param date - The timestamp to format
 * @returns Relative time string
 */
function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}


interface MessageCardProps {
    /** The message data to render */
    message: Message;

    /** Whether to show approve/reject action buttons */
    showActions: boolean;

    /** Stagger index for entrance animation */
    index: number;

    /** Called when the card body is tapped — navigates to detail view */
    onPress: () => void;

    /** Called when the approve button is tapped */
    onApprove?: () => void;

    /** Called when the reject button is tapped */
    onReject?: () => void;
}


/**
 * A single message card in the Notion-inspired list style.
 * Shows author, AI summary, timestamp, and optional action buttons.
 * Animates in with a subtle fade + slide on mount.
 */
export function MessageCard({
    message,
    showActions,
    index,
    onPress,
    onApprove,
    onReject,
}: MessageCardProps) {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(8)).current;


    /** Staggered entrance animation — fade in + slide up */
    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);


    return (
        <Animated.View
            style={[
                styles.card,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                style={styles.cardBody}
            >
                {/* Author initial avatar + name row */}
                <View style={styles.headerRow}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {message.author.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <View style={styles.headerText}>
                        <Text style={styles.authorName} numberOfLines={1}>
                            {message.author}
                        </Text>
                        <Text style={styles.timestamp}>
                            {formatRelativeTime(message.receivedAt)}
                        </Text>
                    </View>
                </View>

                {/* AI-generated summary */}
                <Text style={styles.summary} numberOfLines={2}>
                    {message.summary}
                </Text>

                {/* Content preview — first line of the actual message */}
                <Text style={styles.preview} numberOfLines={1}>
                    {message.content}
                </Text>
            </TouchableOpacity>

            {/* Approve / Reject action buttons */}
            {showActions && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={onReject}
                        style={styles.rejectButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onApprove}
                        style={styles.approveButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                </View>
            )}
        </Animated.View>
    );
}


const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgTertiary,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.borderPrimary,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.card,
    },

    cardBody: {
        padding: spacing.xl,
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.md,
    },

    avatar: {
        width: 32,
        height: 32,
        borderRadius: radii.full,
        backgroundColor: colors.bgAccent,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
    },

    avatarText: {
        fontSize: 13,
        fontFamily: "DMSans_700Bold",
        color: colors.textPrimary,
    },

    headerText: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    authorName: {
        ...typography.title,
        color: colors.textPrimary,
        flex: 1,
    },

    timestamp: {
        ...typography.caption,
        color: colors.textTertiary,
        marginLeft: spacing.sm,
    },

    summary: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },

    preview: {
        fontSize: 12.5,
        fontFamily: "DMSans_400Regular",
        fontStyle: "italic",
        color: colors.textTertiary,
    },

    actions: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: colors.borderSecondary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },

    rejectButton: {
        flex: 1,
        paddingVertical: spacing.sm + 2,
        borderRadius: radii.md,
        backgroundColor: colors.rejectBgRed,
        alignItems: "center",
    },

    rejectText: {
        ...typography.caption,
        color: colors.rejectRed,
        fontFamily: "DMSans_600SemiBold",
    },

    approveButton: {
        flex: 1,
        paddingVertical: spacing.sm + 2,
        borderRadius: radii.md,
        backgroundColor: colors.approveBgGreen,
        alignItems: "center",
    },

    approveText: {
        ...typography.caption,
        color: colors.approveGreen,
        fontFamily: "DMSans_600SemiBold",
    },
});
