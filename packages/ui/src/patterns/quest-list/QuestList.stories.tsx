import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { QuestList } from "@opennihongo/ui";

const items = [
  {
    id: "xp",
    icon: <span>⚡</span>,
    title: "Gain 50 XP",
    progress: 0,
    goal: 50,
    reward: { icon: <span>🎁</span>, label: "XP reward" },
  },
  {
    id: "accuracy",
    icon: <span>🎯</span>,
    title: "Reach 90% accuracy in three lessons",
    progress: 1,
    goal: 3,
    reward: { icon: <span>🎁</span>, label: "Accuracy reward" },
  },
  {
    id: "practice",
    icon: <span>✨</span>,
    title: "Complete four practice lessons",
    progress: 4,
    goal: 4,
    reward: { icon: <span>🎁</span>, label: "Practice reward" },
  },
] as const;

const meta = {
  title: "Gamification/QuestList",
  component: QuestList,
  args: {
    items,
    remainingTime: "58 minutes left",
    title: "Daily quests",
  },
  parameters: {
    docs: {
      description: {
        component:
          "A compact quest group inspired by daily missions. The caller supplies order, values, artwork, rewards, and time text; QuestList does not calculate progress or run a timer.",
      },
    },
  },
} satisfies Meta<typeof QuestList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Daily: Story = {};

export const WithoutRewards: Story = {
  args: {
    items: items.map(({ id, icon, title, progress, goal }) => ({
      id,
      icon,
      title,
      progress,
      goal,
    })),
  },
};
