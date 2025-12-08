import { view, label, button, scrollView } from "valdi";
import { principles } from "../data/principles";
import { colors, spacing, typography, buttonStyles, cardStyles } from "./components/Layout";

interface PrincipleDetailScreenProps {
    principleId: number;
    onOpenJournal: (principleId: number) => void;
    onBack: () => void;
}

export function PrincipleDetailScreen({ principleId, onOpenJournal, onBack }: PrincipleDetailScreenProps) {
    const principle = principles.find(p => p.id === principleId);
    
    if (!principle) {
        return view(
            { style: { flex: 1, padding: spacing.medium, backgroundColor: colors.background } },
            label({ style: { color: colors.text } }, "Principle not found")
        );
    }

    // Candle colors: 3 red, 1 black (center), 3 green
    const getCandleColor = (dayIndex: number): string => {
        if (dayIndex <= 3) return "#cc0000"; // Red (left)
        if (dayIndex === 4) return "#000000"; // Black (center)
        return "#228B22"; // Green (right)
    };

    return view(
        {
            style: {
                flex: 1,
                backgroundColor: colors.background
            }
        },
        // Header
        view(
            {
                style: {
                    flexDirection: "row",
                    alignItems: "center",
                    padding: spacing.medium,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border
                }
            },
            button(
                {
                    onPress: onBack,
                    style: { marginRight: spacing.medium }
                },
                label({ style: { color: colors.primary, fontSize: 16 } }, "← Back")
            ),
            label(
                {
                    style: {
                        ...typography.body,
                        color: colors.textLight,
                        flex: 1
                    }
                },
                `Day ${principle.id} of Kwanzaa`
            )
        ),
        scrollView(
            {
                style: {
                    flex: 1,
                    padding: spacing.medium
                }
            },
            // Day indicator with candle
            view(
                {
                    style: {
                        alignItems: "center",
                        marginBottom: spacing.large
                    }
                },
                view(
                    {
                        style: {
                            width: 40,
                            height: 80,
                            backgroundColor: getCandleColor(principle.id),
                            borderRadius: 6,
                            marginBottom: spacing.small
                        }
                    }
                ),
                view(
                    {
                        style: {
                            width: 50,
                            height: 20,
                            backgroundColor: "#8B4513",
                            borderRadius: 4
                        }
                    }
                )
            ),
            // Principle name
            label(
                {
                    style: {
                        ...typography.title,
                        color: colors.primary,
                        textAlign: "center",
                        marginBottom: spacing.medium
                    }
                },
                principle.name
            ),
            // Description card
            view(
                {
                    style: {
                        ...cardStyles.container,
                        marginBottom: spacing.large
                    }
                },
                label(
                    {
                        style: {
                            ...typography.caption,
                            color: colors.textLight,
                            marginBottom: spacing.xs
                        }
                    },
                    "MEANING"
                ),
                label(
                    {
                        style: {
                            ...typography.body,
                            color: colors.text,
                            lineHeight: 24
                        }
                    },
                    principle.description
                )
            ),
            // Reflection prompt card
            view(
                {
                    style: {
                        ...cardStyles.container,
                        backgroundColor: "#FFF8E7",
                        borderColor: "#E6D5A8",
                        marginBottom: spacing.large
                    }
                },
                label(
                    {
                        style: {
                            ...typography.caption,
                            color: colors.textLight,
                            marginBottom: spacing.xs
                        }
                    },
                    "REFLECTION PROMPT"
                ),
                label(
                    {
                        style: {
                            ...typography.body,
                            color: colors.text,
                            fontStyle: "italic",
                            lineHeight: 24
                        }
                    },
                    principle.reflectionPrompt
                )
            ),
            // Journal button
            button(
                {
                    onPress: () => onOpenJournal(principle.id),
                    style: buttonStyles.primary
                },
                label(
                    { style: buttonStyles.text },
                    "Write Journal Entry"
                )
            )
        )
    );
}

