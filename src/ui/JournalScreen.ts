import { view, label, button, textInput } from "valdi";
import { principles } from "../data/principles";
import { saveJournalEntry, loadJournalEntry, getJournalKey } from "../logic/storage";
import { colors, spacing, typography, buttonStyles, inputStyles, cardStyles } from "./components/Layout";

interface JournalScreenProps {
    principleId: number;
    onBack: () => void;
}

// State management for the journal entry
let currentText = "";
let isLoading = true;
let isSaving = false;
let saveMessage = "";

export function JournalScreen({ principleId, onBack }: JournalScreenProps) {
    const principle = principles.find(p => p.id === principleId);
    
    if (!principle) {
        return view(
            { style: { flex: 1, padding: spacing.medium, backgroundColor: colors.background } },
            label({ style: { color: colors.text } }, "Principle not found")
        );
    }

    const journalKey = getJournalKey(principleId);
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    // Load existing entry on mount
    const loadEntry = async () => {
        isLoading = true;
        const existingEntry = await loadJournalEntry(journalKey);
        if (existingEntry) {
            currentText = existingEntry;
        }
        isLoading = false;
    };

    // Save the current entry
    const handleSave = async () => {
        isSaving = true;
        saveMessage = "";
        try {
            await saveJournalEntry(journalKey, currentText);
            saveMessage = "Saved!";
            setTimeout(() => {
                saveMessage = "";
            }, 2000);
        } catch (error) {
            saveMessage = "Failed to save";
        }
        isSaving = false;
    };

    // Handle text change
    const handleTextChange = (text: string) => {
        currentText = text;
    };

    // Initialize loading
    loadEntry();

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
                        ...typography.subtitle,
                        color: colors.text,
                        flex: 1
                    }
                },
                "Journal"
            )
        ),
        view(
            {
                style: {
                    flex: 1,
                    padding: spacing.medium
                }
            },
            // Date display
            label(
                {
                    style: {
                        ...typography.caption,
                        color: colors.textLight,
                        marginBottom: spacing.xs
                    }
                },
                today
            ),
            // Principle title
            label(
                {
                    style: {
                        ...typography.title,
                        color: colors.primary,
                        marginBottom: spacing.medium
                    }
                },
                principle.name
            ),
            // Reflection prompt reminder
            view(
                {
                    style: {
                        ...cardStyles.container,
                        backgroundColor: "#FFF8E7",
                        borderColor: "#E6D5A8",
                        marginBottom: spacing.medium
                    }
                },
                label(
                    {
                        style: {
                            ...typography.caption,
                            color: colors.textLight,
                            fontStyle: "italic"
                        }
                    },
                    principle.reflectionPrompt
                )
            ),
            // Text input area
            view(
                {
                    style: {
                        ...inputStyles.container,
                        flex: 1,
                        marginBottom: spacing.medium
                    }
                },
                textInput(
                    {
                        style: {
                            ...inputStyles.text,
                            flex: 1
                        },
                        placeholder: "Write your reflection here...",
                        placeholderTextColor: colors.textLight,
                        multiline: true,
                        value: currentText,
                        onChangeText: handleTextChange
                    }
                )
            ),
            // Save button and status
            view(
                {
                    style: {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }
                },
                button(
                    {
                        onPress: handleSave,
                        style: {
                            ...buttonStyles.secondary,
                            opacity: isSaving ? 0.7 : 1
                        },
                        disabled: isSaving
                    },
                    label(
                        { style: buttonStyles.text },
                        isSaving ? "Saving..." : "Save Entry"
                    )
                ),
                saveMessage
                    ? label(
                        {
                            style: {
                                ...typography.caption,
                                color: saveMessage === "Saved!" ? colors.secondary : colors.primary
                            }
                        },
                        saveMessage
                    )
                    : null
            )
        )
    );
}

