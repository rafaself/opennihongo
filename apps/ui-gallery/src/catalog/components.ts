export const componentCatalogCategories = [
  {
    id: "actions-and-forms",
    label: "Actions & Forms",
    description:
      "Actions, selection controls, and text entry from the shared UI package.",
    to: "/components/actions-and-forms",
    items: [
      "Button",
      "IconButton",
      "FormField",
      "Checkbox",
      "Switch",
      "Radio",
      "RadioGroup",
      "Select",
      "SelectTrigger",
      "SelectValue",
      "SelectContent",
      "SelectGroup",
      "SelectLabel",
      "SelectItem",
      "SelectSeparator",
      "Input",
      "Textarea",
    ],
  },
  {
    id: "content-and-progress",
    label: "Content & Progress",
    description:
      "Static content, status, determinate progress, and loading components.",
    to: "/components/content-and-progress",
    items: [
      "Avatar",
      "Badge",
      "Card",
      "Divider",
      "Progress",
      "ProgressRing",
      "Skeleton",
      "Spinner",
    ],
  },
  {
    id: "overlays-and-navigation",
    label: "Overlays & Navigation",
    description:
      "Dialogs, floating content, transient feedback, and local navigation.",
    to: "/components/overlays-and-navigation",
    items: [
      "Tabs",
      "TabsList",
      "TabsTrigger",
      "TabsContent",
      "Dialog",
      "DialogTrigger",
      "DialogContent",
      "DialogTitle",
      "DialogDescription",
      "DialogClose",
      "Popover",
      "PopoverTrigger",
      "PopoverContent",
      "Tooltip",
      "TooltipProvider",
      "Toast",
      "ToastProvider",
      "ToastViewport",
      "ToastTitle",
      "ToastDescription",
      "ToastAction",
      "ToastClose",
    ],
  },
] as const;

export const componentCatalogResources = [
  {
    id: "foundations",
    label: "Foundations and shared primitives",
    description:
      "Public layout, typography, and surface primitives documented with their canonical foundations.",
    items: [
      { name: "Text", to: "/foundations/typography" },
      { name: "Stack", to: "/foundations/spacing" },
      { name: "Inline", to: "/foundations/spacing" },
      { name: "Grid", to: "/foundations/spacing" },
      { name: "Surface", to: "/foundations/elevation" },
    ],
  },
  {
    id: "gamification",
    label: "Gamification",
    description:
      "Progression indicators, achievements, rewards, quests, and celebration.",
    items: [
      { name: "Achievement", to: "/gamification" },
      { name: "RewardCard", to: "/gamification" },
      { name: "QuestCard", to: "/gamification" },
      { name: "LeaderboardItem", to: "/gamification" },
      { name: "LevelBadge", to: "/gamification" },
      { name: "Streak", to: "/gamification" },
      { name: "XPBar", to: "/gamification" },
      { name: "Celebration", to: "/gamification" },
    ],
  },
  {
    id: "patterns",
    label: "Patterns",
    description:
      "Reusable completion and progress compositions made from shared UI.",
    items: [
      { name: "LessonCompleted", to: "/patterns" },
      { name: "RewardReceived", to: "/patterns" },
      { name: "AchievementUnlocked", to: "/patterns" },
      { name: "LevelUp", to: "/patterns" },
      { name: "ProgressSummary", to: "/patterns" },
      {
        name: "DailyGoalCompleted",
        to: "/patterns/daily-goal-completed",
      },
    ],
  },
  {
    id: "assets",
    label: "Assets",
    description:
      "Functional icons and their canonical accessibility and usage guidance.",
    items: [
      { name: "Icon", to: "/assets" },
      { name: "CheckIcon", to: "/assets" },
      { name: "CloseIcon", to: "/assets" },
      { name: "StarIcon", to: "/assets" },
    ],
  },
] as const;
