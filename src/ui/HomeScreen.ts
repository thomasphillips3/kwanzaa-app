import { view, label, button } from "valdi";
import { getKwanzaaDayIndex, getNextKwanzaaStart, isInKwanzaaRange } from "../logic/kwanzaaDates";
import { principles } from "../data/principles";
import { colors, spacing, typography, buttonStyles, cardStyles } from "./components/Layout";
import { Kinara } from "./components/Kinara";

interface HomeScreenProps {
    onViewPrinciples: () => void;
    onViewPrinciple: (principleId: number) => void;
}

export function HomeScreen({ onViewPrinciples, onViewPrinciple }: HomeScreenProps) {
    const today = new Date();
    const dayIndex = getKwanzaaDayIndex(today);
    const isKwanzaa = isInKwanzaaRange(today);
    const todaysPrinciple = dayIndex ? principles[dayIndex - 1] : null;

    // Calculate days until next Kwanzaa if not currently in Kwanzaa
    const getCountdown = (): string | null => {
        if (isKwanzaa) return null;
        const nextStart = getNextKwanzaaStart(today);
        const diffTime = nextStart.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days until Kwanzaa`;
    };

    const countdown = getCountdown();

    return view(
        {
            style: {
                flex: 1,
                backgroundColor: colors.background
            }
        },
        // Header section
        view(
            {
                style: {
                    padding: spacing.large,
                    alignItems: "center",
                    backgroundColor: colors.primary
                }
            },
            label(
                {
                    style: {
                        ...typography.title,
                        color: colors.white,
                        marginBottom: spacing.small
                    }
                },
                "Kwanzaa Pocket Guide"
            ),
            label(
                {
                    style: {
                        ...typography.body,
                        color: colors.white,
                        opacity: 0.9
                    }
                },
                isKwanzaa
                    ? `Day ${dayIndex} of Kwanzaa`
                    : countdown ?? "Celebrate the Seven Principles"
            )
        ),
        // Kinara display
        view(
            {
                style: {
                    paddingVertical: spacing.large,
                    backgroundColor: "#FFF8E7"
                }
            },
        Kinara({ litCandles: dayIndex ?? 0 })
        ),
        // Main content
        view(
            {
                style: {
                    flex: 1,
                    padding: spacing.medium
                }
            },
            // Today's principle card (if during Kwanzaa)
            todaysPrinciple
                ? view(
                    {
                        style: {
                            ...cardStyles.container,
                            marginBottom: spacing.medium
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
                        "TODAY'S PRINCIPLE"
                    ),
                    label(
                        {
                            style: {
                                ...typography.subtitle,
                                color: colors.primary,
                                marginBottom: spacing.small
                            }
                        },
                        todaysPrinciple.name
                    ),
                    label(
                        {
                            style: {
                                ...typography.body,
                                color: colors.text,
                                marginBottom: spacing.medium
                            }
                        },
                        todaysPrinciple.description
                    ),
                    button(
                        {
                            onPress: () => onViewPrinciple(todaysPrinciple.id),
                            style: buttonStyles.primary
                        },
                        label({ style: buttonStyles.text }, "View Details & Journal")
                    )
                )
                : view(
                    {
                        style: {
                            ...cardStyles.container,
                            marginBottom: spacing.medium,
                            alignItems: "center"
                        }
                    },
                    label(
                        {
                            style: {
                                ...typography.body,
                                color: colors.text,
                                textAlign: "center",
                                marginBottom: spacing.small
                            }
                        },
                        "Kwanzaa is celebrated from December 26 to January 1 each year."
                    ),
                    label(
                        {
                            style: {
                                ...typography.caption,
                                color: colors.textLight,
                                textAlign: "center"
                            }
                        },
                        "Explore the seven principles below to prepare for the celebration."
                    )
                ),
            // View all principles button
            button(
                {
                    onPress: onViewPrinciples,
                    style: {
                        ...buttonStyles.secondary,
                        marginBottom: spacing.medium
                    }
                },
                label({ style: buttonStyles.text }, "View All 7 Principles")
            ),
            // Quick info
            view(
                {
                    style: {
                        marginTop: "auto",
                        paddingTop: spacing.medium
                    }
                },
                label(
                    {
                        style: {
                            ...typography.caption,
                            color: colors.textLight,
                            textAlign: "center"
                        }
                    },
                    "Nguzo Saba • The Seven Principles of Kwanzaa"
                )
            )
        )
    );
}
