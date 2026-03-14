import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { HandledStackParamList } from "../types";
import { MessageCard } from "../components/MessageCard";
import { colors, spacing, typography } from "../theme";
import { MessagesContext } from "../navigation/MessagesContext";


type Props = NativeStackScreenProps<HandledStackParamList, "HandledList">;


/**
 * Handled screen — shows approved messages in the same card style,
 * but without any action buttons. A clean audit trail of processed items.
 */
export function HandledScreen({ navigation }: Props) {
    const { handled } = React.useContext(MessagesContext);


    /** Empty state when nothing has been approved yet */
    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>↗</Text>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptySubtitle}>
                Approved messages will appear here
            </Text>
        </View>
    );


    return (
        <View style={styles.container}>
            {/* Section label */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                    HANDLED — {handled.length} APPROVED
                </Text>
            </View>

            <FlatList
                data={handled}
                keyExtractor={(item) => `handled-${item.id}`}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
                renderItem={({ item, index }) => (
                    <MessageCard
                        message={item}
                        showActions={false}
                        index={index}
                        onPress={() =>
                            navigation.navigate("HandledDetail", {
                                message: item,
                            })
                        }
                    />
                )}
            />
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

    emptyContainer: {
        alignItems: "center",
        paddingTop: 80,
        paddingHorizontal: spacing.xxxl,
    },

    emptyIcon: {
        fontSize: 32,
        color: colors.textTertiary,
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
    },
});
