import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { LevelBadge, type LevelBadgeSize } from "@opennihongo/ui";

const sizes: readonly LevelBadgeSize[] = ["normal", "compact"];

const meta = {
  title: "Components/LevelBadge",
  component: LevelBadge,
  args: {
    label: "Level",
    value: 12,
  },
  argTypes: {
    size: { control: "select", options: sizes },
  },
  parameters: {
    docs: {
      description: {
        component:
          "LevelBadge presents the label, value, and optional tier supplied by its caller. It does not calculate levels, tiers, thresholds, or progression. Its visual treatments use shared semantic color and typography tokens.",
      },
    },
  },
} satisfies Meta<typeof LevelBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};

export const Compact: Story = {
  args: {
    size: "compact",
    value: 12,
  },
};

export const WithTier: Story = {
  args: {
    tier: { label: "Gold", variant: "warning" },
  },
};

export const LightAndDarkThemes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {(["light", "dark"] as const).map((theme) => (
        <section
          aria-label={`${theme} theme`}
          data-theme={theme}
          key={theme}
          style={{
            alignItems: "center",
            backgroundColor: "var(--ns-color-canvas)",
            color: "var(--ns-color-text-primary)",
            display: "flex",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <strong>
            {theme.charAt(0).toUpperCase() + theme.slice(1)} theme
          </strong>
          <LevelBadge label="Level" value={12} />
          <LevelBadge
            label="Level"
            size="compact"
            tier={{ label: "Gold", variant: "warning" }}
            value={12}
          />
        </section>
      ))}
    </div>
  ),
};
