import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { GalleryLayout } from "../layouts/GalleryLayout";
import { ButtonsPage } from "../pages/ButtonsPage";
import { ColorTokensPage } from "../pages/ColorTokensPage";
import { DailyGoalCompletedPage } from "../pages/DailyGoalCompletedPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { PlaygroundPage } from "../pages/PlaygroundPage";

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

const colorTokensRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/foundations/colors",
  component: ColorTokensPage,
});

const dailyGoalCompletedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/patterns/daily-goal-completed",
  component: DailyGoalCompletedPage,
});

const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/playground",
  component: PlaygroundPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  colorTokensRoute,
  buttonsRoute,
  dailyGoalCompletedRoute,
  playgroundRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
