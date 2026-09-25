import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Streak, type StreakState } from "@opennihongo/ui";

const states: readonly StreakState[] = [
  "active",
  "at-risk",
  "protected",
  "completed",
  "inactive",
];

const meta = {
  title: "Gamification/Streak",
  component: Streak,
  args: {
    count: 12,
    label: "Current streak",
    state: "active",
  },
  argTypes: {
    state: { control: "select", options: states },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Streak presents a caller-supplied count and state. It does not calculate, protect, expire, or recover streaks. State labels remain visible so color is never the only state cue; callers can localize the state label. Its state transitions use shared motion tokens and stop when reduced motion is requested.",
      },
    },
  },
} satisfies Meta<typeof Streak>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const AtRisk: Story = {
  args: { state: "at-risk" },
};

export const Protected: Story = {
  args: { state: "protected" },
};

export const Completed: Story = {
  args: { state: "completed" },
};

export const Inactive: Story = {
  args: { state: "inactive" },
};

export const Localized: Story = {
  args: {
    label: "連続学習日数",
    state: "at-risk",
    stateLabel: "要注意",
    unit: "日",
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ns-space-3)" }}>
      {states.map((state) => (
        <Streak
          count={12}
          key={state}
          label={`${state} streak`}
          state={state}
        />
      ))}
    </div>
  ),
};

export const ReducedMotion: Story = {
  render: () => (
    <div
      style={
        {
          "--ns-motion-duration-fast": "0ms",
        } as CSSProperties
      }
    >
      <Streak count={12} label="Current streak" state="active" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The shared motion duration is set to its reduced-motion value, so changing the state has no visual transition.",
      },
    },
  },
};
