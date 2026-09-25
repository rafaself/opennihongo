import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Button, DailyGoalCompleted } from "@opennihongo/ui";
import "./daily-goal-completed.stories.css";

const meta = {
  title: "Patterns/Daily Goal Completed",
  component: DailyGoalCompleted,
  args: {
    completionLabel: "Goal completed",
    description: "Your steady practice is building a strong habit.",
    goal: {
      description: "Words practiced in today's study session.",
      label: "Practice 20 words",
      max: 20,
      value: 20,
      valueLabel: "20 of 20",
    },
    heading: "Daily goal complete",
    primaryAction: <Button>Continue learning</Button>,
    rewards: [
      {
        category: "xp",
        label: "Experience points",
        state: "earned",
        value: "+50 XP",
      },
      {
        category: "streak",
        label: "Learning streak",
        state: "earned",
        value: "7 days",
      },
    ],
    secondaryAction: <Button variant="secondary">Review progress</Button>,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Presents a daily goal the caller has confirmed complete, its supplied progress values and rewards, and caller-provided actions. Completion and rewards are never calculated. The optional Celebration respects reduced-motion preferences.",
      },
    },
  },
} satisfies Meta<typeof DailyGoalCompleted>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completed: Story = {};

export const SingleReward: Story = {
  args: {
    rewards: [
      {
        category: "xp",
        label: "Experience points",
        state: "earned",
        value: "+50 XP",
      },
    ],
  },
};

export const CelebrationDisabled: Story = {
  args: { celebration: false },
};

export const ReducedMotion: Story = {
  decorators: [
    (StoryComponent) => (
      <div className="ns-daily-goal-completed-story-reduced-motion">
        <StoryComponent />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Celebration is suppressed when the viewer's operating system requests reduced motion. This story also removes the emphasis animation for visual inspection.",
      },
    },
  },
};
