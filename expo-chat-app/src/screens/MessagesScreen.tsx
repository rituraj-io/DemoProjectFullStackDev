import React from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { MessagesStackParamList } from "../types";
import { useMessages } from "../hooks/useMessages";
import { MessageCard } from "../components/MessageCard";
import { colors, spacing, typography } from "../theme";
import { MessagesContext } from "../navigation/MessagesContext";


type Props = NativeStackScreenProps<MessagesStackParamList, "MessagesList">;


/**
 * Inbox screen — displays pending messages as a clean list.
 * Each message card shows the AI summary with approve/reject actions.
 * Pull-to-refresh fetches new messages from the API.
 */
export function MessagesScreen({ navigation }: Props) {
    const { inbox, loading, error, approve, reject, refresh } =
        React.useContext(MessagesContext);


    /** Navigate to full message detail on card tap */
    const handlePress = (message: (typeof inbox)[0]) => {
        navigation.navigate("MessageDetail", { message });
    };


    /** Empty state when all messages have been processed */
    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>✓</Text>
                <Text style={styles.emptyTitle}>All caught up</Text>
                <Text style={styles.emptySubtitle}>
                    No pending messages to review
                </Text>
                <TouchableOpacity
                    onPress={refresh}
                    style={styles.refreshButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.refreshText}>Load new messages</Text>
                </TouchableOpacity>
            </View>
        );
    };


    /** Error state with retry */
    if (error && inbox.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>
                    Could not load messages
                </Text>
                <TouchableOpacity
                    onPress={refresh}
                    style={styles.refreshButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.refreshText}>Try again</Text>
                </TouchableOpacity>
            </View>
        );
    }


    return (
        <View style={styles.container}>
            {/* Section label — Notion-style uppercase heading */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                    INBOX — {inbox.length} PENDING
                </Text>
            </View>

            {loading && inbox.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator
                        size="small"
                        color={colors.textTertiary}
                    />
                </View>
            ) : (
                <FlatList
                    data={inbox}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                            tintColor={colors.textTertiary}
                        />
                    }
                    renderItem={({ item, index }) => (
                        <MessageCard
                            message={item}
                            showActions
                            index={index}
                            onPress={() => handlePress(item)}
                            onApprove={() => approve(item.id)}
                            onReject={() => reject(item.id)}
                        />
                    )}
                />
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
    },

    sectionHeader: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },

    sectionLabel: {
        ...typography.sectionLabel,
        color: colors.textTertiary,
    },

    list: {
        paddingBottom: spacing.xxxl,
    },

    centerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xxxl,
    },

    emptyContainer: {
        alignItems: "center",
        paddingTop: 80,
        paddingHorizontal: spacing.xxxl,
    },

    emptyIcon: {
        fontSize: 32,
        color: colors.approveGreen,
        marginBottom: spacing.lg,
    },

    emptyTitle: {
        ...typography.title,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },

    emptySubtitle: {
        ...typography.body,
        color: colors.textTertiary,
        textAlign: "center",
        marginBottom: spacing.xxl,
    },

    refreshButton: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.xl,
        borderRadius: 8,
        backgroundColor: colors.bgAccent,
        borderWidth: 1,
        borderColor: colors.borderPrimary,
    },

    refreshText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontFamily: "DMSans_600SemiBold",
    },

    errorText: {
        ...typography.body,
        color: colors.rejectRed,
        marginBottom: spacing.lg,
        textAlign: "center",
    },
});
