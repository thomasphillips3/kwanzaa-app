import { view, label, button, textInput } from "valdi";

export const colors = {
    background: "#fff",
    text: "#222",
    textLight: "#666",
    primary: "#cc0000",
    primaryDark: "#990000",
    secondary: "#228B22",
    candleLit: "#ff6600",
    candleUnlit: "#ccc",
    border: "#ddd",
    inputBackground: "#f9f9f9",
    white: "#fff"
};

export const spacing = {
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32
};

export const typography = {
    title: {
        fontSize: 24,
        fontWeight: "bold" as const
    },
    subtitle: {
        fontSize: 20,
        fontWeight: "600" as const
    },
    body: {
        fontSize: 16
    },
    caption: {
        fontSize: 14
    }
};

export const buttonStyles = {
    primary: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.medium,
        paddingHorizontal: spacing.large,
        borderRadius: 8,
        alignItems: "center" as const,
        justifyContent: "center" as const
    },
    secondary: {
        backgroundColor: colors.secondary,
        paddingVertical: spacing.medium,
        paddingHorizontal: spacing.large,
        borderRadius: 8,
        alignItems: "center" as const,
        justifyContent: "center" as const
    },
    text: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "600" as const
    }
};

export const inputStyles = {
    container: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: spacing.medium
    },
    text: {
        fontSize: 16,
        color: colors.text,
        minHeight: 120,
        textAlignVertical: "top" as const
    }
};

export const cardStyles = {
    container: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: spacing.medium,
        marginBottom: spacing.medium,
        borderWidth: 1,
        borderColor: colors.border
    }
};