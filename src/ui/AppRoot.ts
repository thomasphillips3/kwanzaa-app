import { view } from "valdi";
import { HomeScreen } from "./HomeScreen";
import { PrinciplesListScreen } from "./PrinciplesListScreen";
import { PrincipleDetailScreen } from "./PrincipleDetailScreen";
import { JournalScreen } from "./JournalScreen";
import { CommunityBoardScreen } from "./CommunityBoardScreen";

// Navigation state types
type Screen = 
    | { name: "Home" }
    | { name: "PrinciplesList" }
    | { name: "PrincipleDetail"; principleId: number }
    | { name: "Journal"; principleId: number }
    | { name: "CommunityBoard" };

// Global navigation state
let currentScreen: Screen = { name: "Home" };
let navigationStack: Screen[] = [];

// Navigation functions
function navigate(screen: Screen) {
    navigationStack.push(currentScreen);
    currentScreen = screen;
}

function goBack() {
    const previousScreen = navigationStack.pop();
    if (previousScreen) {
        currentScreen = previousScreen;
    }
}

function goHome() {
    navigationStack = [];
    currentScreen = { name: "Home" };
}

// Navigation handlers to pass to screens
const navigationHandlers = {
    goToPrinciplesList: () => navigate({ name: "PrinciplesList" }),
    goToPrincipleDetail: (principleId: number) => navigate({ name: "PrincipleDetail", principleId }),
    goToJournal: (principleId: number) => navigate({ name: "Journal", principleId }),
    goToCommunityBoard: () => navigate({ name: "CommunityBoard" }),
    goBack,
    goHome
};

export function AppRoot() {
    const screen = currentScreen;

    switch (screen.name) {
        case "Home":
            return view(
                { style: { flex: 1 } },
                HomeScreen({
                    onViewPrinciples: navigationHandlers.goToPrinciplesList,
                    onViewPrinciple: navigationHandlers.goToPrincipleDetail,
                    onViewCommunity: navigationHandlers.goToCommunityBoard
                })
            );

        case "PrinciplesList":
            return view(
                { style: { flex: 1 } },
                PrinciplesListScreen({
                    onSelectPrinciple: navigationHandlers.goToPrincipleDetail,
                    onBack: navigationHandlers.goBack
                })
            );

        case "PrincipleDetail":
            return view(
                { style: { flex: 1 } },
                PrincipleDetailScreen({
                    principleId: screen.principleId,
                    onOpenJournal: navigationHandlers.goToJournal,
                    onBack: navigationHandlers.goBack
                })
            );

        case "Journal":
            return view(
                { style: { flex: 1 } },
                JournalScreen({
                    principleId: screen.principleId,
                    onBack: navigationHandlers.goBack
                })
            );

        case "CommunityBoard":
            return view(
                { style: { flex: 1 } },
                CommunityBoardScreen({
                    onBack: navigationHandlers.goBack
                })
            );

        default:
            return view(
                { style: { flex: 1 } },
                HomeScreen({
                    onViewPrinciples: navigationHandlers.goToPrinciplesList,
                    onViewPrinciple: navigationHandlers.goToPrincipleDetail,
                    onViewCommunity: navigationHandlers.goToCommunityBoard
                })
            );
    }
}
}
