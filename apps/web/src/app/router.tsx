import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppLayout } from "../layouts/AppLayout";
import { HomePage } from "../pages/HomePage";
import { KanaPage } from "../pages/KanaPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { UpcomingSectionPage } from "../pages/UpcomingSectionPage";
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
  component: KanaPage,
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

const routeTree = rootRoute.addChildren([
  homeRoute,
  kanaRoute,
  practiceRoute,
  progressRoute,
  questsRoute,
  libraryRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
