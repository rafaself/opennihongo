import type { KanaPracticeGame } from "@opennihongo/content";
import { CardStackPage } from "../pages/practice/CardStackPage";
import { KanaPracticeSetupPage } from "../pages/practice/setup/KanaPracticeSetupPage";
import { getKanaPracticeSummary } from "../views/practice/session/kanaPracticeContent";
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { AppLayout } from "../layouts/AppLayout";
import { AcknowledgementsPage } from "../pages/AcknowledgementsPage";
import { KanaChartPage } from "../pages/KanaChartPage";
import { HomePage } from "../pages/HomePage";
import { KanaVowelsPage } from "../pages/practice/KanaVowelsPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { UpcomingSectionPage } from "../pages/UpcomingSectionPage";
import { VocabularyPage } from "../pages/practice/words/VocabularyPage";
import { PracticePage } from "../pages/practice/PracticePage";
import { KanaPracticePage } from "../pages/practice/KanaPracticePage";
import { WordsPracticeView } from "../views/practice/words/WordsPracticeView";
import { appSections } from "./sections";
import { validatePracticeSearch, type PracticeSearch } from "./practiceSearch";

const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.home.path,
  component: HomePage,
});

const kanaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.kana.path,
  component: KanaChartPage,
});

const kanaVowelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/vowels",
  component: KanaVowelsPage,
});

const vocabularyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/words/vocabulary",
  component: VocabularyPage,
  validateSearch: validatePracticeSearch,
});

const wordsPracticeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/words/practice",
  beforeLoad: (): void => {
    redirect({ to: "/practice/words/matching", replace: true, throw: true });
  },
});

const practiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.practice.path,
  component: PracticePage,
  validateSearch: validatePracticeSearch,
});

function ensureKanaSession(game: KanaPracticeGame, search: PracticeSearch) {
  if (!getKanaPracticeSummary(game, search).canStart) {
    redirect({
      throw: true,
      to: "/practice/kana/$game/setup",
      params: { game },
      search,
      replace: true,
    });
  }
}

const kanaSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/$game/setup",
  validateSearch: validatePracticeSearch,
  component: KanaPracticeSetupPage,
});

const kanaReadingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/reading",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanaSession("reading", search);
  },
  component: () => <KanaPracticePage mode="reading" />,
});

const kanaMatchingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/matching",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanaSession("matching", search);
  },
  component: () => <KanaPracticePage mode="matching" />,
});

const kanaQuizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/quiz",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanaSession("quiz", search);
  },
  component: () => <KanaPracticePage mode="quiz" />,
});

const kanaCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/cards",
  validateSearch: validatePracticeSearch,
  beforeLoad: ({ search }) => {
    ensureKanaSession("cards", search);
  },
  component: () => <CardStackPage subject="kana" />,
});
const wordCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/words/cards",
  validateSearch: validatePracticeSearch,
  component: () => <CardStackPage subject="words" />,
});

const wordMatchingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/words/matching",
  component: WordsPracticeView,
});

const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.progress.path,
  component: () => <UpcomingSectionPage {...appSections.progress} />,
});

const questsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.quests.path,
  component: () => <UpcomingSectionPage {...appSections.quests} />,
});

const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.library.path,
  component: () => <UpcomingSectionPage {...appSections.library} />,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.settings.path,
  component: SettingsPage,
});

const acknowledgementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/acknowledgements",
  component: AcknowledgementsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  kanaRoute,
  kanaVowelsRoute,
  vocabularyRoute,
  wordsPracticeRoute,
  practiceRoute,
  kanaSetupRoute,
  kanaReadingRoute,
  kanaMatchingRoute,
  kanaQuizRoute,
  wordMatchingRoute,
  kanaCardsRoute,
  wordCardsRoute,
  progressRoute,
  questsRoute,
  libraryRoute,
  settingsRoute,
  acknowledgementsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
