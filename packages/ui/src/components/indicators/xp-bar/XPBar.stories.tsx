import type { CSSProperties } from "react";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { XPBar } from "@opennihongo/ui";

const meta = {
  title: "Components/XPBar",
  component: XPBar,
  args: {
    "aria-label": "XP to next level",
    current: 450,
    target: 600,
    text: "450 of 600 XP",
  },
  parameters: {
    docs: {
      description: {
        component:
          "XPBar composes Progress with the semantic reward color. The caller supplies either current and target values or a value and optional max, along with an accessible name. XP rules and thresholds remain with the caller. Its width transition uses shared motion tokens, which resolve to zero duration for reduced-motion preferences.",
      },
    },
  },
} satisfies Meta<typeof XPBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    current: 0,
    target: 600,
    text: "0 of 600 XP",
  },
};

export const Partial: Story = {};

export const NearTarget: Story = {
  args: {
    current: 575,
    target: 600,
    text: "575 of 600 XP",
  },
};

export const Complete: Story = {
  args: {
    current: 600,
    target: 600,
    text: "600 of 600 XP",
  },
};

function ReducedMotionDemo() {
  const [current, setCurrent] = useState(450);

  return (
    <div
      style={
        {
          "--ns-motion-duration-normal": "0ms",
          display: "grid",
          gap: "1rem",
        } as CSSProperties
      }
    >
      <label style={{ display: "grid", gap: "var(--ns-space-2)" }}>
        Current XP
        <input
          max={600}
          min={0}
          onChange={(event) => {
            setCurrent(Number(event.currentTarget.value));
          }}
          type="range"
          value={current}
        />
      </label>
      <XPBar
        aria-label="XP to next level"
        current={current}
        target={600}
        text={`${current.toString()} of 600 XP`}
      />
    </div>
  );
}

export const ReducedMotion: Story = {
  render: () => <ReducedMotionDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "This story sets the shared motion duration to its reduced-motion value so the XP indicator changes without a width transition.",
      },
    },
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
          {[0, 35, 90, 100].map((current) => (
            <XPBar
              aria-label={`${current.toString()}% XP progress`}
              current={current}
              key={current}
              target={100}
              text={`${current.toString()} of 100 XP`}
            />
          ))}
        </section>
      ))}
    </div>
  ),
};
