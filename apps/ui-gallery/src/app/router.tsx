import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { GalleryLayout } from "../layouts/GalleryLayout";
import { ActionsAndFormsPage } from "../pages/components/ActionsAndFormsPage";
import { ContentAndProgressPage } from "../pages/components/ContentAndProgressPage";
import { AssetsPage } from "../pages/assets/AssetsPage";
import { ColorTokensPage } from "../pages/foundations/colors/ColorTokensPage";
import { DailyGoalCompletedPage } from "../pages/DailyGoalCompletedPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PlaygroundPage } from "../pages/PlaygroundPage";
import { ElevationPage } from "../pages/foundations/ElevationPage";
import { MotionPage } from "../pages/foundations/MotionPage";
import { SizingPage } from "../pages/foundations/SizingPage";
import { SpacingPage } from "../pages/foundations/SpacingPage";
import { TypographyPage } from "../pages/foundations/TypographyPage";
import { GamificationPage } from "../pages/gamification/GamificationPage";
import { PatternsPage } from "../pages/patterns/PatternsPage";

const rootRoute = createRootRoute({
  component: GalleryLayout,
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const actionsAndFormsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/components/actions-and-forms",
  component: ActionsAndFormsPage,
});

const contentAndProgressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/components/content-and-progress",
  component: ContentAndProgressPage,
});

const overlaysAndNavigationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/components/overlays-and-navigation",
  component: lazyRouteComponent(
    () =>
      import("../pages/components/overlays-navigation/OverlaysAndNavigationPage"),
    "OverlaysAndNavigationPage",
  ),
});

const legacyButtonsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/components/buttons",
  component: ActionsAndFormsPage,
});

const assetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/assets",
  component: AssetsPage,
});

const gamificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gamification",
  component: GamificationPage,
});

const colorTokensRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/foundations/colors",
  component: ColorTokensPage,
});

const spacingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/foundations/spacing",
  component: SpacingPage,
});

const sizingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/foundations/sizing",
  component: SizingPage,
});

const elevationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/foundations/elevation",
  component: ElevationPage,
});

const motionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/foundations/motion",
  component: MotionPage,
});

const typographyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/foundations/typography",
  component: TypographyPage,
});

const dailyGoalCompletedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patterns/daily-goal-completed",
  component: DailyGoalCompletedPage,
});

const patternsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patterns",
  component: PatternsPage,
});

const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/playground",
  component: PlaygroundPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  assetsRoute,
  colorTokensRoute,
  spacingRoute,
  sizingRoute,
  elevationRoute,
  motionRoute,
  typographyRoute,
  actionsAndFormsRoute,
  contentAndProgressRoute,
  overlaysAndNavigationRoute,
  legacyButtonsRoute,
  gamificationRoute,
  patternsRoute,
  dailyGoalCompletedRoute,
  playgroundRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
