import type { AppNavIconName } from "../layouts/AppNavIcon";

type AppSection = {
  path: string;
  label: string;
  icon: AppNavIconName;
  status: "available" | "upcoming";
  description?: string;
};

export const appSections = {
  home: {
    path: "/",
    label: "Home",
    icon: "learn",
    status: "available",
  },
  kana: {
    path: "/kana",
    label: "Kana",
    icon: "kana",
    status: "available",
  },
  practice: {
    path: "/practice",
    label: "Practice",
    icon: "practice",
    status: "available",
    description: "Short practice sessions to reinforce what you have learned.",
  },
  progress: {
    path: "/progress",
    label: "Progress",
    icon: "progress",
    status: "upcoming",
    description: "A clear view of your learning activity and milestones.",
  },
  quests: {
    path: "/quests",
    label: "Quests",
    icon: "quests",
    status: "upcoming",
    description: "Small goals to keep your learning routine moving.",
  },
  library: {
    path: "/library",
    label: "Library",
    icon: "library",
    status: "upcoming",
    description: "Your study resources, all in one place.",
  },
  settings: {
    path: "/settings",
    label: "Settings",
    icon: "settings",
    status: "available",
  },
} as const satisfies Record<string, AppSection>;

export const navigationSections = [
  appSections.home,
  appSections.kana,
  appSections.practice,
  appSections.progress,
  appSections.settings,
];
