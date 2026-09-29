import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppLayout } from "../layouts/AppLayout";
import { AcknowledgementsPage } from "../pages/AcknowledgementsPage";
import { KanaChartPage } from "../pages/KanaChartPage";
import { HomePage } from "../pages/HomePage";
import { KanaPage } from "../pages/KanaPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { UpcomingSectionPage } from "../pages/UpcomingSectionPage";
import { WordsPage } from "../pages/WordsPage";
import { PracticeView } from "../views/practice/PracticeView";
import { appSections } from "./sections";

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

const practiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: appSections.practice.path,
  component: PracticeView,
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
  practiceRoute,
  progressRoute,
  questsRoute,
  libraryRoute,
  acknowledgementsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
