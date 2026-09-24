import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Achievement, type AchievementState } from "@opennihongo/ui";

const states: readonly AchievementState[] = [
  "locked",
  "in-progress",
  "unlocked",
  "new",
];

const meta = {
  title: "Components/Achievement",
  component: Achievement,
  args: {
    description: "Explore Japanese one small step at a time.",
    state: "new",
    title: "Kana explorer",
  },
  argTypes: {
    state: { control: "select", options: states },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Achievement presents caller-supplied metadata, state, and optional progress. It does not decide eligibility, unlock conditions, or persistence. The state label is visible and included in the accessible group name; progress uses a named progressbar.",
      },
    },
  },
} satisfies Meta<typeof Achievement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Locked: Story = {
  args: {
    state: "locked",
  },
};

export const InProgress: Story = {
  args: {
    progress: {
      current: 3,
      label: "3 of 5 kana challenges",
      target: 5,
    },
    state: "in-progress",
  },
};

export const Unlocked: Story = {
  args: {
    state: "unlocked",
  },
};

export const New: Story = {};
