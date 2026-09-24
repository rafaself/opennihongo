import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import {
  RewardCard,
  type RewardCardCategory,
  type RewardCardState,
} from "@opennihongo/ui";

const categories: readonly RewardCardCategory[] = [
  "xp",
  "streak",
  "achievement",
];
const states: readonly RewardCardState[] = ["earned", "preview", "locked"];

const meta = {
  title: "Gamification/RewardCard",
  component: RewardCard,
  args: {
    category: "xp",
    label: "Lesson bonus",
    state: "earned",
    value: "+50 XP",
  },
  argTypes: {
    category: { control: "select", options: categories },
    state: { control: "select", options: states },
  },
  parameters: {
    docs: {
      description: {
        component:
          "RewardCard presents a caller-supplied category, label, value, and state. Category and state labels can be localized by the caller. It does not award, calculate, claim, or persist rewards.",
      },
    },
  },
} satisfies Meta<typeof RewardCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Earned: Story = {};

export const Preview: Story = {
  args: {
    category: "streak",
    label: "Seven-day milestone",
    state: "preview",
    value: "7 days",
  },
};

export const Locked: Story = {
  args: {
    category: "achievement",
    label: "Kana explorer",
    state: "locked",
    value: "Achievement badge",
  },
};

export const Categories: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ns-space-3)" }}>
      <RewardCard
        category="xp"
        label="Lesson bonus"
        state="earned"
        value="+50 XP"
      />
      <RewardCard
        category="streak"
        label="Seven-day milestone"
        state="earned"
        value="7 days"
      />
      <RewardCard
        category="achievement"
        label="Kana explorer"
        state="earned"
        value="Achievement badge"
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ns-space-3)" }}>
      {states.map((state) => (
        <RewardCard
          category="xp"
          key={state}
          label="Lesson bonus"
          state={state}
          value="+50 XP"
        />
      ))}
    </div>
  ),
};
