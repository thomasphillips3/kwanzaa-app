import { view, label, button, textInput, scrollView } from "valdi";
import { colors, spacing, typography, buttonStyles, cardStyles, inputStyles } from "./components/Layout";
import {
    CommunityPost,
    ConnectionStatus,
    connect,
    subscribeToPosts,
    subscribeToStatus,
    publishPost,
    getConnectionStatus
} from "../logic/gunClient";
import {
    blockAuthor,
    isAuthorBlocked,
    hidePost,
    reportPost,
    filterPosts,
    REPORT_REASONS,
    ReportReason
} from "../logic/moderation";
import { getPublicIdentity, updateDisplayName } from "../logic/identity";

interface CommunityBoardScreenProps {
    onBack: () => void;
}

// Component state (in real app, use state management)
let posts: CommunityPost[] = [];
let connectionStatus: ConnectionStatus = getConnectionStatus();
let composeText = "";
let isComposing = false;
let reportingPost: CommunityPost | null = null;
let showSettings = false;
let displayNameInput = "";

// Initialize subscriptions
let unsubscribePosts: (() => void) | null = null;
let unsubscribeStatus: (() => void) | null = null;

function initializeSubscriptions() {
    if (!unsubscribePosts) {
        connect();
        
        unsubscribePosts = subscribeToPosts((post) => {
            // Add new posts, avoiding duplicates
            const exists = posts.find(p => p.id === post.id);
            if (!exists) {
                posts = [post, ...posts].sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }
        });
        
        unsubscribeStatus = subscribeToStatus((status) => {
            connectionStatus = status;
        });
    }
}

export function CommunityBoardScreen({ onBack }: CommunityBoardScreenProps) {
    // Initialize on first render
    initializeSubscriptions();
    
    const identity = getPublicIdentity();
    const filteredPosts = filterPosts(posts);
    
    // Header with connection status
    const header = view(
        {
            style: {
                padding: spacing.medium,
                backgroundColor: colors.primary,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between"
            }
        },
        view(
            { style: { flexDirection: "row", alignItems: "center" } },
            button(
                {
                    onPress: onBack,
                    style: {
                        padding: spacing.small,
                        marginRight: spacing.medium
                    }
                },
                label({ style: { color: colors.white, fontSize: 18 } }, "←")
            ),
            view(
                {},
                label(
                    { style: { ...typography.subtitle, color: colors.white } },
                    "Community Board"
                ),
                label(
                    {
                        style: {
                            ...typography.caption,
                            color: colors.white,
                            opacity: 0.8
                        }
                    },
                    connectionStatus.connected
                        ? `Connected • ${connectionStatus.peersConnected} peers`
                        : "Connecting..."
                )
            )
        ),
        button(
            {
                onPress: () => { showSettings = !showSettings; },
                style: { padding: spacing.small }
            },
            label({ style: { color: colors.white, fontSize: 18 } }, "⚙")
        )
    );
    
    // Settings panel
    const settingsPanel = showSettings ? view(
        {
            style: {
                ...cardStyles.container,
                margin: spacing.medium,
                marginBottom: 0
            }
        },
        label(
            { style: { ...typography.subtitle, marginBottom: spacing.medium } },
            "Settings"
        ),
        label(
            { style: { ...typography.caption, color: colors.textLight, marginBottom: spacing.small } },
            "Display Name"
        ),
        view(
            { style: { flexDirection: "row", marginBottom: spacing.medium } },
            textInput(
                {
                    value: displayNameInput || identity?.displayName || "",
                    onChangeText: (text: string) => { displayNameInput = text; },
                    placeholder: "Enter display name",
                    style: {
                        ...inputStyles.container,
                        flex: 1,
                        marginRight: spacing.small,
                        minHeight: 40
                    }
                }
            ),
            button(
                {
                    onPress: () => {
                        if (displayNameInput.trim()) {
                            updateDisplayName(displayNameInput.trim());
                            displayNameInput = "";
                        }
                    },
                    style: {
                        ...buttonStyles.secondary,
                        paddingHorizontal: spacing.medium
                    }
                },
                label({ style: buttonStyles.text }, "Save")
            )
        ),
        label(
            { style: { ...typography.caption, color: colors.textLight } },
            `Your ID: ${identity?.publicKey.substring(0, 16)}...`
        )
    ) : null;
    
    // Compose area
    const composeArea = view(
        {
            style: {
                ...cardStyles.container,
                margin: spacing.medium
            }
        },
        isComposing
            ? view(
                {},
                textInput(
                    {
                        value: composeText,
                        onChangeText: (text: string) => { composeText = text; },
                        placeholder: "Share your Kwanzaa thoughts...",
                        multiline: true,
                        style: {
                            ...inputStyles.container,
                            ...inputStyles.text,
                            marginBottom: spacing.medium
                        }
                    }
                ),
                view(
                    { style: { flexDirection: "row", justifyContent: "flex-end" } },
                    button(
                        {
                            onPress: () => {
                                isComposing = false;
                                composeText = "";
                            },
                            style: {
                                ...buttonStyles.secondary,
                                backgroundColor: colors.textLight,
                                marginRight: spacing.small
                            }
                        },
                        label({ style: buttonStyles.text }, "Cancel")
                    ),
                    button(
                        {
                            onPress: async () => {
                                if (composeText.trim()) {
                                    await publishPost(composeText.trim());
                                    composeText = "";
                                    isComposing = false;
                                }
                            },
                            style: buttonStyles.primary
                        },
                        label({ style: buttonStyles.text }, "Post")
                    )
                )
            )
            : button(
                {
                    onPress: () => { isComposing = true; },
                    style: {
                        ...inputStyles.container,
                        alignItems: "flex-start"
                    }
                },
                label(
                    { style: { color: colors.textLight } },
                    "Share your Kwanzaa thoughts..."
                )
            )
    );
    
    // Report modal
    const reportModal = reportingPost ? view(
        {
            style: {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                padding: spacing.large
            }
        },
        view(
            {
                style: {
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    padding: spacing.large,
                    width: "100%",
                    maxWidth: 400
                }
            },
            label(
                { style: { ...typography.subtitle, marginBottom: spacing.medium } },
                "Report Post"
            ),
            ...REPORT_REASONS.map(reason =>
                button(
                    {
                        onPress: () => {
                            if (reportingPost) {
                                reportPost(reportingPost, reason.value);
                                reportingPost = null;
                            }
                        },
                        style: {
                            padding: spacing.medium,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border
                        }
                    },
                    label({ style: typography.body }, reason.label)
                )
            ),
            button(
                {
                    onPress: () => { reportingPost = null; },
                    style: {
                        padding: spacing.medium,
                        marginTop: spacing.small
                    }
                },
                label({ style: { ...typography.body, color: colors.textLight } }, "Cancel")
            )
        )
    ) : null;
    
    // Post item component
    const renderPost = (post: CommunityPost) => {
        const isBlocked = isAuthorBlocked(post.author.publicKey);
        const myIdentity = getPublicIdentity();
        const isOwnPost = myIdentity?.publicKey === post.author.publicKey;
        
        return view(
            {
                key: post.id,
                style: {
                    ...cardStyles.container,
                    marginHorizontal: spacing.medium,
                    marginBottom: spacing.small
                }
            },
            // Author header
            view(
                {
                    style: {
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: spacing.small
                    }
                },
                view(
                    { style: { flexDirection: "row", alignItems: "center" } },
                    label(
                        { style: { ...typography.caption, fontWeight: "600" } },
                        post.author.displayName
                    ),
                    post.verified
                        ? label(
                            {
                                style: {
                                    ...typography.caption,
                                    color: colors.secondary,
                                    marginLeft: spacing.xs
                                }
                            },
                            "✓"
                        )
                        : null
                ),
                label(
                    { style: { ...typography.caption, color: colors.textLight } },
                    formatRelativeTime(post.createdAt)
                )
            ),
            // Post content
            label(
                { style: { ...typography.body, marginBottom: spacing.medium } },
                post.text
            ),
            // Actions
            !isOwnPost ? view(
                {
                    style: {
                        flexDirection: "row",
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        paddingTop: spacing.small
                    }
                },
                button(
                    {
                        onPress: () => { reportingPost = post; },
                        style: { marginRight: spacing.medium }
                    },
                    label(
                        { style: { ...typography.caption, color: colors.textLight } },
                        "Report"
                    )
                ),
                button(
                    {
                        onPress: () => { hidePost(post.id); }
                    },
                    label(
                        { style: { ...typography.caption, color: colors.textLight } },
                        "Hide"
                    )
                ),
                button(
                    {
                        onPress: () => { blockAuthor(post.author.publicKey); },
                        style: { marginLeft: "auto" }
                    },
                    label(
                        { style: { ...typography.caption, color: colors.primary } },
                        "Block User"
                    )
                )
            ) : null
        );
    };
    
    // Posts feed
    const feed = scrollView(
        { style: { flex: 1 } },
        filteredPosts.length > 0
            ? filteredPosts.map(renderPost)
            : view(
                {
                    style: {
                        padding: spacing.large,
                        alignItems: "center"
                    }
                },
                label(
                    { style: { ...typography.body, color: colors.textLight, textAlign: "center" } },
                    connectionStatus.connected
                        ? "No posts yet. Be the first to share!"
                        : "Connecting to community..."
                )
            )
    );
    
    // UGC notice footer
    const footer = view(
        {
            style: {
                padding: spacing.small,
                backgroundColor: colors.inputBackground,
                borderTopWidth: 1,
                borderTopColor: colors.border
            }
        },
        label(
            {
                style: {
                    ...typography.caption,
                    color: colors.textLight,
                    textAlign: "center",
                    fontSize: 11
                }
            },
            "Posts are user-generated. Report inappropriate content."
        )
    );
    
    return view(
        { style: { flex: 1, backgroundColor: colors.background } },
        header,
        settingsPanel,
        composeArea,
        feed,
        footer,
        reportModal
    );
}

// Helper: format relative time
function formatRelativeTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

// Cleanup function (call when unmounting)
export function cleanupCommunityBoard(): void {
    if (unsubscribePosts) {
        unsubscribePosts();
        unsubscribePosts = null;
    }
    if (unsubscribeStatus) {
        unsubscribeStatus();
        unsubscribeStatus = null;
    }
}
