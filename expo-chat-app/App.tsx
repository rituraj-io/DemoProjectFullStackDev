import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
    useFonts,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { colors } from "./src/theme";


/**
 * Root component — loads DM Sans font family before rendering the app.
 * Shows a minimal loading indicator while fonts are being fetched.
 */
export default function App() {
    const [fontsLoaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold,
    });


    /* Hold on a loading screen until fonts are ready */
    if (!fontsLoaded) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="small" color={colors.textTertiary} />
            </View>
        );
    }


    return (
        <>
            <StatusBar style="dark" />
            <AppNavigator />
        </>
    );
}


const styles = StyleSheet.create({
    loading: {
        flex: 1,
        backgroundColor: colors.bgSecondary,
        alignItems: "center",
        justifyContent: "center",
    },
});
