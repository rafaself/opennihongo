import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { ProgressRing } from "@opennihongo/ui";

const meta = {
  title: "Components/ProgressRing",
  component: ProgressRing,
  args: {
    "aria-label": "Course progress",
    max: 100,
    size: "medium",
    value: 40,
  },
  parameters: {
    docs: {
      description: {
        component:
          "ProgressRing uses the same determinate range as Progress. `max` defaults to 100 and invalid values resolve to an empty range. Supply an `aria-label` or `aria-labelledby`. Optional centered content is rendered outside the progressbar semantics so it remains available to assistive technology.",
      },
    },
  },
} satisfies Meta<typeof ProgressRing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Partial: Story = {};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

export const CenteredContent: Story = {
  args: {
    children: "On track",
    "aria-label": "Current course progress",
    value: 65,
  },
};

export const ThemeAndSizeScale: Story = {
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
          {(["small", "medium", "large"] as const).map((size) => (
            <div
              key={size}
              style={{ alignItems: "center", display: "grid", gap: "0.5rem" }}
            >
              <ProgressRing
                aria-label={`${size} ${theme} progress`}
                size={size}
                value={65}
              >
                {size}
              </ProgressRing>
              <span>{size}</span>
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
};
