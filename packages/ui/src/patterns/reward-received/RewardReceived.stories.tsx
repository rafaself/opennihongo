import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Button, RewardReceived, Text } from "@opennihongo/ui";
import "./reward-received.stories.css";

const meta = {
  title: "Patterns/Reward Received",
  component: RewardReceived,
  args: {
    celebration: true,
    description: "Your effort is adding up. Keep your learning streak going.",
    heading: "Reward received",
    primaryAction: <Button>Continue learning</Button>,
    reward: {
      category: "xp",
      label: "Experience points",
      state: "earned",
      value: "+125 XP",
    },
    secondaryAction: <Button variant="secondary">View rewards</Button>,
  },
  parameters: {
    docs: {
      description: {
        component:
          "A responsive reward presentation. The caller supplies reward metadata and state, supporting content, and actions. It does not calculate, claim, grant, or persist rewards. Celebration is optional and honors reduced-motion preferences.",
      },
    },
  },
} satisfies Meta<typeof RewardReceived>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExperiencePoints: Story = {};

export const Streak: Story = {
  args: {
    reward: {
      category: "streak",
      label: "Daily learning streak",
      state: "earned",
      value: "7 days",
    },
  },
};

export const Achievement: Story = {
  args: {
    reward: {
      category: "achievement",
      label: "Kana explorer",
      state: "earned",
      value: "First milestone",
    },
  },
};

export const ResponsiveComposition: Story = {
  render: (args) => (
    <div className="ns-reward-received-story-responsive">
      <div className="ns-reward-received-story-responsive__narrow">
        <Text as="h3" color="secondary" variant="label">
          Narrow layout
        </Text>
        <RewardReceived {...args} />
      </div>
      <div className="ns-reward-received-story-responsive__wide">
        <Text as="h3" color="secondary" variant="label">
          Wide layout
        </Text>
        <RewardReceived {...args} />
      </div>
    </div>
  ),
};

export const CelebrationDisabled: Story = {
  args: { celebration: false },
};

export const ReducedMotion: Story = {
  decorators: [
    (StoryComponent) => (
      <div className="ns-reward-received-story-reduced-motion">
        <StoryComponent />
      </div>
    ),
  ],
};
