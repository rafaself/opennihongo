import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Badge, type BadgeVariant } from "@opennihongo/ui";
import "./badge.stories.css";

const variants: readonly BadgeVariant[] = [
  "neutral",
  "success",
  "warning",
  "info",
  "danger",
];

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: {
    children: "In progress",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Use Badge for concise, non-interactive status or category labels. Use a link, Button, or selection control when the user needs to navigate, act, or change a choice.",
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const SemanticVariants: Story = {
  render: () => (
    <div className="ns-badge-story-list">
      {variants.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant.charAt(0).toUpperCase() + variant.slice(1)}
        </Badge>
      ))}
    </div>
  ),
};

export const ThemeMappings: Story = {
  render: () => (
    <div className="ns-badge-story-themes">
      {(["light", "dark"] as const).map((theme) => (
        <section
          className="ns-badge-story-theme"
          data-theme={theme}
          key={theme}
          aria-label={`${theme} theme`}
        >
          <p>{theme.charAt(0).toUpperCase() + theme.slice(1)} theme</p>
          <div className="ns-badge-story-list">
            {variants.map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Badge>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};
