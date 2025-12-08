import { view, label, button, scrollView } from "valdi";
import { principles, Principle } from "../data/principles";
import { colors, spacing, typography, cardStyles } from "./components/Layout";

interface PrinciplesListScreenProps {
    onSelectPrinciple: (principleId: number) => void;
    onBack: () => void;
}

function PrincipleRow(
    principle: Principle,
    onSelect: (id: number) => void
) {
    return view(
        {
            key: principle.id,
            style: {
                ...cardStyles.container,
                flexDirection: "row",
                alignItems: "center"
            },
            onPress: () => onSelect(principle.id)
        },
        view(
            { style: { flex: 1 } },
            label(
                {
                    style: {
                        ...typography.subtitle,
                        color: colors.primary,
                        marginBottom: spacing.xs
                    }
                },
                principle.name
            ),
            label(
                {
                    style: {
                        ...typography.caption,
                        color: colors.textLight,
                        numberOfLines: 2
                    }
                },
                principle.description
            )
        ),
        view(
            {
                style: {
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: spacing.medium
                }
            },
            label(
                { style: { color: colors.white, fontWeight: "bold" } },
                principle.id.toString()
            )
        )
    );
}

export function PrinciplesListScreen({ onSelectPrinciple, onBack }: PrinciplesListScreenProps) {
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
                        ...typography.title,
                        color: colors.text,
                        flex: 1
                    }
                },
                "Nguzo Saba"
            )
        ),
        // Subtitle
        view(
            { style: { paddingHorizontal: spacing.medium, paddingTop: spacing.small } },
            label(
                { style: { ...typography.body, color: colors.textLight } },
                "The Seven Principles of Kwanzaa"
            )
        ),
        // Scrollable list of principles
        scrollView(
            {
                style: {
                    flex: 1,
                    padding: spacing.medium
                }
            },
            ...principles.map(principle =>
                PrincipleRow(principle, onSelectPrinciple)
            )
        )
    );
}

