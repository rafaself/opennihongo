export interface GalleryNavigationLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
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
        { id: "color-tokens", label: "Color tokens", href: "/#foundations" },
      ],
    },
    {
      id: "components",
      label: "Components",
      description:
        "Domain-agnostic interface components from the public UI package.",
      links: [{ id: "buttons", label: "Buttons", href: "/#components" }],
    },
    {
      id: "gamification",
      label: "Gamification",
      description:
        "Feature-owned reward and progression UI, documented without moving product behavior into shared UI.",
      links: [],
    },
    {
      id: "patterns",
      label: "Patterns",
      description:
        "Reusable compositions that combine shared components without owning feature rules.",
      links: [],
    },
    {
      id: "assets",
      label: "Assets",
      description:
        "Illustrations, iconography, and other visual resources with documented usage.",
      links: [],
    },
    {
      id: "playground",
      label: "Playground",
      description:
        "Isolated examples for exploring component variants and interaction states.",
      links: [],
    },
  ],
} as const satisfies {
  readonly overview: { readonly label: string; readonly to: "/" };
  readonly sections: readonly GalleryNavigationSection[];
};
