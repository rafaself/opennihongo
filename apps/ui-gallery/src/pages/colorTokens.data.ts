export const colorSteps = ["50", "100", "300", "500", "600", "700", "900"];

export const brandAndNeutralPalettes = [
  {
    family: "hinomaru",
    label: "Hinomaru",
    description:
      "A Japanese flag-inspired brand red scale; not a claim about a legally canonical flag color.",
  },
  {
    family: "sumi",
    label: "Sumi",
    description: "Warm, ink-like neutrals for the interface foundation.",
  },
] as const;

export const accentPalettes = [
  { family: "green", label: "Green", role: "Success feedback" },
  { family: "amber", label: "Amber", role: "Warning and XP/reward accents" },
  { family: "blue", label: "Blue", role: "Information feedback" },
  { family: "orange", label: "Orange", role: "Streak accents" },
  { family: "indigo", label: "Indigo", role: "Achievement accents" },
] as const;

export interface ColorSample {
  readonly label: string;
  readonly background: string;
  readonly foreground: string;
  readonly tokens: readonly string[];
  readonly border?: string;
  readonly focus?: boolean;
  readonly swatchOnly?: boolean;
}

export interface ColorRoleGroup {
  readonly title: string;
  readonly samples: readonly ColorSample[];
}

export const semanticGroups: readonly ColorRoleGroup[] = [
  {
    title: "Surfaces",
    samples: [
      {
        label: "Canvas",
        background: "--ns-color-canvas",
        foreground: "--ns-color-text-primary",
        tokens: ["--ns-color-canvas", "--ns-color-text-primary"],
      },
      {
        label: "Default surface",
        background: "--ns-color-surface",
        foreground: "--ns-color-text-primary",
        tokens: ["--ns-color-surface", "--ns-color-text-primary"],
      },
      {
        label: "Subtle surface",
        background: "--ns-color-surface-subtle",
        foreground: "--ns-color-text-primary",
        tokens: ["--ns-color-surface-subtle", "--ns-color-text-primary"],
      },
      {
        label: "Raised surface",
        background: "--ns-color-surface-raised",
        foreground: "--ns-color-text-primary",
        tokens: ["--ns-color-surface-raised", "--ns-color-text-primary"],
      },
    ],
  },
  {
    title: "Text",
    samples: [
      {
        label: "Primary",
        background: "--ns-color-canvas",
        foreground: "--ns-color-text-primary",
        tokens: ["--ns-color-text-primary", "--ns-color-canvas"],
      },
      {
        label: "Secondary",
        background: "--ns-color-canvas",
        foreground: "--ns-color-text-secondary",
        tokens: ["--ns-color-text-secondary", "--ns-color-canvas"],
      },
      {
        label: "Tertiary",
        background: "--ns-color-canvas",
        foreground: "--ns-color-text-tertiary",
        tokens: ["--ns-color-text-tertiary", "--ns-color-canvas"],
      },
      {
        label: "Inverse",
        background: "--ns-color-text-primary",
        foreground: "--ns-color-text-inverse",
        tokens: ["--ns-color-text-inverse", "--ns-color-text-primary"],
      },
    ],
  },
  {
    title: "Brand and primary action",
    samples: [
      {
        label: "Primary action",
        background: "--ns-color-action-primary",
        foreground: "--ns-color-action-primary-foreground",
        tokens: [
          "--ns-color-action-primary",
          "--ns-color-action-primary-foreground",
        ],
      },
      {
        label: "Primary action hover",
        background: "--ns-color-action-primary-hover",
        foreground: "--ns-color-action-primary-foreground",
        tokens: [
          "--ns-color-action-primary-hover",
          "--ns-color-action-primary-foreground",
        ],
      },
    ],
  },
  {
    title: "Borders",
    samples: [
      {
        label: "Subtle",
        background: "--ns-color-surface",
        foreground: "--ns-color-text-primary",
        border: "--ns-color-border-subtle",
        tokens: ["--ns-color-border-subtle"],
      },
      {
        label: "Standard",
        background: "--ns-color-surface",
        foreground: "--ns-color-text-primary",
        border: "--ns-color-border",
        tokens: ["--ns-color-border"],
      },
      {
        label: "Strong",
        background: "--ns-color-surface",
        foreground: "--ns-color-text-primary",
        border: "--ns-color-border-strong",
        tokens: ["--ns-color-border-strong"],
      },
    ],
  },
  {
    title: "Focus and selection",
    samples: [
      {
        label: "Focus indicator",
        background: "--ns-color-surface",
        foreground: "--ns-color-text-primary",
        border: "--ns-color-border",
        focus: true,
        tokens: ["--ns-color-focus", "--ns-color-border"],
      },
      {
        label: "Selection",
        background: "--ns-color-selection",
        foreground: "--ns-color-selection-foreground",
        tokens: ["--ns-color-selection", "--ns-color-selection-foreground"],
      },
    ],
  },
  {
    title: "Overlay backdrop",
    samples: [
      {
        label: "Modal scrim",
        background: "--ns-color-overlay-backdrop",
        foreground: "--ns-color-text-inverse",
        swatchOnly: true,
        tokens: ["--ns-color-overlay-backdrop"],
      },
    ],
  },
  {
    title: "Feedback accents",
    samples: [
      {
        label: "Success",
        background: "--ns-color-feedback-success-surface",
        foreground: "--ns-color-feedback-success",
        tokens: [
          "--ns-color-feedback-success",
          "--ns-color-feedback-success-surface",
        ],
      },
      {
        label: "Warning",
        background: "--ns-color-feedback-warning-surface",
        foreground: "--ns-color-feedback-warning",
        tokens: [
          "--ns-color-feedback-warning",
          "--ns-color-feedback-warning-surface",
        ],
      },
      {
        label: "Information",
        background: "--ns-color-feedback-info-surface",
        foreground: "--ns-color-feedback-info",
        tokens: [
          "--ns-color-feedback-info",
          "--ns-color-feedback-info-surface",
        ],
      },
      {
        label: "Danger",
        background: "--ns-color-feedback-danger-surface",
        foreground: "--ns-color-feedback-danger",
        tokens: [
          "--ns-color-feedback-danger",
          "--ns-color-feedback-danger-surface",
        ],
      },
    ],
  },
  {
    title: "Reward accents",
    samples: [
      {
        label: "XP",
        background: "--ns-color-reward-xp-surface",
        foreground: "--ns-color-reward-xp",
        tokens: ["--ns-color-reward-xp", "--ns-color-reward-xp-surface"],
      },
      {
        label: "Streak",
        background: "--ns-color-reward-streak-surface",
        foreground: "--ns-color-reward-streak",
        tokens: [
          "--ns-color-reward-streak",
          "--ns-color-reward-streak-surface",
        ],
      },
      {
        label: "Achievement",
        background: "--ns-color-reward-achievement-surface",
        foreground: "--ns-color-reward-achievement",
        tokens: [
          "--ns-color-reward-achievement",
          "--ns-color-reward-achievement-surface",
        ],
      },
    ],
  },
];
