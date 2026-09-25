export interface GalleryNavigationLink {
  readonly id: string;
  readonly label: string;
  readonly to: string;
}

export interface GalleryNavigationSection {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly links: readonly GalleryNavigationLink[];
}

export const galleryNavigation = {
  overview: { label: "Overview", to: "/" },
  sections: [
    {
      id: "foundations",
      label: "Foundations",
      description:
        "Shared visual primitives and semantic design tokens for product interfaces.",
      links: [
        {
          id: "spacing",
          label: "Spacing",
          to: "/foundations/spacing",
        },
        {
          id: "sizing",
          label: "Sizing, radius, borders",
          to: "/foundations/sizing",
        },
        {
          id: "elevation",
          label: "Surfaces and elevation",
          to: "/foundations/elevation",
        },
        {
          id: "color-tokens",
          label: "Color tokens",
          to: "/foundations/colors",
        },
        {
          id: "typography",
          label: "Typography",
          to: "/foundations/typography",
        },
        {
          id: "motion",
          label: "Motion",
          to: "/foundations/motion",
        },
      ],
    },
    {
      id: "components",
      label: "Components",
      description:
        "Domain-agnostic interface components from the public UI package.",
      links: [{ id: "buttons", label: "Buttons", to: "/components/buttons" }],
    },
    {
      id: "gamification",
      label: "Gamification",
      description:
        "Feature-owned reward and progression UI, documented without moving product behavior into shared UI.",
      links: [
        {
          id: "gamification-catalog",
          label: "Progress and rewards",
          to: "/gamification",
        },
      ],
    },
    {
      id: "patterns",
      label: "Patterns",
      description:
        "Reusable compositions that combine shared components without owning feature rules.",
      links: [
        {
          id: "patterns-catalog",
          label: "Pattern catalog",
          to: "/patterns",
        },
        {
          id: "daily-goal-completed",
          label: "Daily goal completed details",
          to: "/patterns/daily-goal-completed",
        },
      ],
    },
    {
      id: "assets",
      label: "Assets",
      description:
        "Illustrations, iconography, and other visual resources with documented usage.",
      links: [
        {
          id: "assets-catalog",
          label: "Icons and illustrations",
          to: "/assets",
        },
      ],
    },
    {
      id: "playground",
      label: "Playground",
      description:
        "Isolated examples for exploring component variants and interaction states.",
      links: [{ id: "playground", label: "Playground", to: "/playground" }],
    },
  ],
} as const satisfies {
  readonly overview: { readonly label: string; readonly to: "/" };
  readonly sections: readonly GalleryNavigationSection[];
};
