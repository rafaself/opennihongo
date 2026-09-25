import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Button, QuestCard, type QuestCardStatus } from "@opennihongo/ui";

const statuses: readonly QuestCardStatus[] = ["incomplete", "completed"];

const meta = {
  title: "Gamification/QuestCard",
  component: QuestCard,
  args: {
    description: "Practice a few words each day to build your vocabulary.",
    goal: 5,
    progress: 2,
    status: "incomplete",
    title: "Daily word practice",
  },
  argTypes: {
    status: { control: "select", options: statuses },
  },
  parameters: {
    docs: {
      description: {
        component:
          "QuestCard presents caller-supplied title, description, progress, goal, status, reward, and optional action. Status is not derived from progress; the component does not generate quests, determine completion, or award rewards.",
      },
    },
  },
} satisfies Meta<typeof QuestCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Incomplete: Story = {
  args: {
    action: <Button>Continue quest</Button>,
    reward: {
      category: "xp",
      label: "Quest reward",
      state: "preview",
      value: "+30 XP",
    },
  },
};

export const Completed: Story = {
  args: {
    goal: 5,
    progress: 5,
    reward: {
      category: "achievement",
      label: "Quest reward",
      state: "earned",
      value: "Achievement badge",
    },
    status: "completed",
  },
};
