import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { GalleryLayout } from "../layouts/GalleryLayout";
import { ButtonsPage } from "../pages/ButtonsPage";
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

const buttonsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/components/buttons",
  component: ButtonsPage,
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
  colorTokensRoute,
  spacingRoute,
  sizingRoute,
  elevationRoute,
  motionRoute,
  typographyRoute,
  buttonsRoute,
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
