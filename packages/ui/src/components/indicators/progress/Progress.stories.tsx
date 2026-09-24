import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Progress } from "@opennihongo/ui";

const meta = {
  title: "Components/Progress",
  component: Progress,
  args: {
    "aria-label": "Course progress",
    max: 100,
    value: 40,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Progress renders a static determinate value. `max` defaults to 100 and falls back to 100 when it is invalid, non-finite, or not positive. Invalid or non-finite `value` resolves to 0; finite values are clamped to the range. Provide a non-empty `aria-label` or an `aria-labelledby` reference.",
      },
    },
  },
} satisfies Meta<typeof Progress>;

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

export const ThemeStates: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {(["light", "dark"] as const).map((theme) => (
        <section
          aria-label={`${theme} theme`}
          data-theme={theme}
          key={theme}
          style={{
            backgroundColor: "var(--ns-color-canvas)",
            color: "var(--ns-color-text-primary)",
            display: "grid",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <strong>
            {theme.charAt(0).toUpperCase() + theme.slice(1)} theme
          </strong>
          {[
            { label: "Empty", value: 0 },
            { label: "Partial", value: 40 },
            { label: "Complete", value: 100 },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "grid", gap: "0.5rem" }}>
              <span>{label}</span>
              <Progress aria-label={`${label} course progress`} value={value} />
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
};
