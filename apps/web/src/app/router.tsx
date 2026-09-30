import { KanaQuizPage } from "../pages/practice/KanaQuizPage";
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
import { KanaPage } from "../pages/KanaPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { UpcomingSectionPage } from "../pages/UpcomingSectionPage";
import { WordsPage } from "../pages/words/WordsPage";
import { PracticePage } from "../pages/practice/PracticePage";
import { KanaPracticePage } from "../pages/practice/KanaPracticePage";
import { WordsPracticeView } from "../views/words/WordsPracticeView";
import { appSections } from "./sections";
import {
  validatePracticeSearch,
  validateKanaQuizSearch,
} from "./practiceSearch";

const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.learn.path,
  component: HomePage,
});

const kanaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.kana.path,
  component: KanaChartPage,
});

const kanaLessonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kana/lesson",
  component: KanaPage,
});

const wordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.words.path,
  component: WordsPage,
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

const kanaReadingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/reading",
  validateSearch: validatePracticeSearch,
  component: () => <KanaPracticePage mode="reading" />,
});

const kanaMatchingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/matching",
  validateSearch: validatePracticeSearch,
  component: () => <KanaPracticePage mode="matching" />,
});

const kanaQuizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/practice/kana/quiz",
  validateSearch: validateKanaQuizSearch,
  component: KanaQuizPage,
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
  kanaLessonRoute,
  wordsRoute,
  wordsPracticeRoute,
  practiceRoute,
  kanaReadingRoute,
  kanaMatchingRoute,
  kanaQuizRoute,
  wordMatchingRoute,
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
