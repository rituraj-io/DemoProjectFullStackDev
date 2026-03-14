/**
 * Design tokens derived from the Next.js dashboard's Notion-inspired palette.
 * Warm neutrals, semantic accents, and subtle depth through shadows.
 */


/** Core color palette — warm Notion-inspired neutrals */
export const colors = {
    /** Page & card backgrounds */
    bgPrimary: "#ffffff",
    bgSecondary: "#f7f6f3",
    bgTertiary: "#ffffff",
    bgHover: "#f1f0ed",
    bgAccent: "#f0eeeb",

    /** Text hierarchy */
    textPrimary: "#37352f",
    textSecondary: "#787774",
    textTertiary: "#b4b4b0",

    /** Borders */
    borderPrimary: "#e8e5e0",
    borderSecondary: "#ebebea",

    /** Semantic accents */
    approveGreen: "#2e7d32",
    approveBgGreen: "#e8f5e9",
    rejectRed: "#c62828",
    rejectBgRed: "#fce4ec",

    /** Tab bar accent */
    accentBlue: "#3d7ce0",
    accentBlueMuted: "#e3f0ff",
};


/** Shadow presets for cards */
export const shadows = {
    card: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },

    cardLifted: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },
};


/** Spacing scale (multiples of 4) */
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};


/** Border radius tokens */
export const radii = {
    sm: 6,
    md: 8,
    lg: 12,
    full: 999,
};


/** Typography presets — paired with DM Sans loaded via expo-font */
export const typography = {
    /** Page/section headings */
    sectionLabel: {
        fontSize: 11,
        fontFamily: "DMSans_600SemiBold",
        letterSpacing: 1.6,
        textTransform: "uppercase" as const,
    },

    /** Card titles */
    title: {
        fontSize: 15,
        fontFamily: "DMSans_600SemiBold",
        letterSpacing: 0.1,
    },

    /** Body / summary text */
    body: {
        fontSize: 13.5,
        fontFamily: "DMSans_400Regular",
        lineHeight: 20,
    },

    /** Small labels and metadata */
    caption: {
        fontSize: 12,
        fontFamily: "DMSans_500Medium",
        letterSpacing: 0.2,
    },

    /** Tab bar labels */
    tabLabel: {
        fontSize: 11,
        fontFamily: "DMSans_600SemiBold",
        letterSpacing: 0.4,
    },
};
