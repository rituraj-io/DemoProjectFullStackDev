import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
    RootTabParamList,
    MessagesStackParamList,
    HandledStackParamList,
} from "../types";
import { MessagesScreen } from "../screens/MessagesScreen";
import { HandledScreen } from "../screens/HandledScreen";
import { MessageDetailScreen } from "../screens/MessageDetailScreen";
import { useMessages } from "../hooks/useMessages";
import { MessagesContext } from "./MessagesContext";
import { colors, typography, spacing, radii } from "../theme";
import { TabBarIcon } from "../components/TabBarIcon";


const Tab = createBottomTabNavigator<RootTabParamList>();
const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();
const HandledStack = createNativeStackNavigator<HandledStackParamList>();


/** Shared header styling — matches the Notion-inspired aesthetic */
const screenOptions = {
    headerStyle: {
        backgroundColor: colors.bgSecondary,
    },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
        fontFamily: "DMSans_600SemiBold",
        fontSize: 15,
        letterSpacing: 0.3,
    },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
    contentStyle: {
        backgroundColor: colors.bgSecondary,
    },
};


/** Messages tab — inbox list + detail view */
function MessagesStackScreen() {
    return (
        <MessagesStack.Navigator screenOptions={screenOptions}>
            <MessagesStack.Screen
                name="MessagesList"
                component={MessagesScreen}
                options={{ title: "Messages" }}
            />
            <MessagesStack.Screen
                name="MessageDetail"
                component={MessageDetailScreen}
                options={{ title: "Message" }}
            />
        </MessagesStack.Navigator>
    );
}


/** Handled tab — approved messages list + detail view */
function HandledStackScreen() {
    return (
        <HandledStack.Navigator screenOptions={screenOptions}>
            <HandledStack.Screen
                name="HandledList"
                component={HandledScreen}
                options={{ title: "Handled" }}
            />
            <HandledStack.Screen
                name="HandledDetail"
                component={MessageDetailScreen}
                options={{ title: "Message" }}
            />
        </HandledStack.Navigator>
    );
}


/**
 * Root navigator — bottom tab bar with Messages and Handled tabs.
 * Wraps everything in the shared MessagesContext for cross-tab state.
 */
export function AppNavigator() {
    const messagesState = useMessages();

    return (
        <MessagesContext.Provider value={messagesState}>
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: {
                            backgroundColor: colors.bgPrimary,
                            borderTopColor: colors.borderPrimary,
                            borderTopWidth: 1,
                            height: Platform.OS === "ios" ? 84 : 64,
                            paddingTop: spacing.sm,
                            paddingBottom:
                                Platform.OS === "ios"
                                    ? spacing.xxl
                                    : spacing.md,
                        },
                        tabBarActiveTintColor: colors.accentBlue,
                        tabBarInactiveTintColor: colors.textTertiary,
                        tabBarLabelStyle: {
                            ...typography.tabLabel,
                            marginTop: 2,
                        },
                    }}
                >
                    <Tab.Screen
                        name="MessagesTab"
                        component={MessagesStackScreen}
                        options={{
                            title: "Messages",
                            tabBarBadge:
                                messagesState.inbox.length > 0
                                    ? messagesState.inbox.length
                                    : undefined,
                            tabBarBadgeStyle: {
                                backgroundColor: colors.accentBlue,
                                fontFamily: "DMSans_600SemiBold",
                                fontSize: 10,
                                minWidth: 18,
                                height: 18,
                                borderRadius: 9,
                            },
                            tabBarIcon: ({ color, size }) => (
                                <TabBarIcon
                                    name="inbox"
                                    color={color}
                                    size={size}
                                />
                            ),
                        }}
                    />

                    <Tab.Screen
                        name="HandledTab"
                        component={HandledStackScreen}
                        options={{
                            title: "Handled",
                            tabBarIcon: ({ color, size }) => (
                                <TabBarIcon
                                    name="check"
                                    color={color}
                                    size={size}
                                />
                            ),
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </MessagesContext.Provider>
    );
}
