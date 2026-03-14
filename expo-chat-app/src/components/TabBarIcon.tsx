import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";


interface TabBarIconProps {
    /** Icon name — "inbox" or "check" */
    name: "inbox" | "check";

    /** Icon color from the tab bar */
    color: string;

    /** Icon size from the tab bar */
    size: number;
}


/**
 * Hand-crafted SVG tab icons — matching the Next.js app's inline SVG approach.
 * Uses stroke-based icons with rounded caps for a friendly, Notion-like feel.
 */
export function TabBarIcon({ name, color, size }: TabBarIconProps) {
    const strokeWidth = 1.75;

    if (name === "inbox") {
        return (
            <Svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* Inbox tray icon */}
                <Path d="M22 12H16L14 15H10L8 12H2" />
                <Path d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z" />
            </Svg>
        );
    }

    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Checkmark circle icon */}
            <Path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" />
            <Path d="M22 4L12 14.01L9 11.01" />
        </Svg>
    );
}
