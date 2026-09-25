import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Button, LevelUp, RewardCard, type LevelUpSize } from "@opennihongo/ui";
import "./level-up.stories.css";

const sizes: readonly LevelUpSize[] = ["compact", "full"];

const meta = {
  title: "Patterns/Level Up",
  component: LevelUp,
  args: {
    celebration: true,
    description: "Your dedication is paying off.",
    heading: "Level up!",
    newLevel: { label: "Level", value: 6 },
    previousLevel: { label: "Level", value: 5 },
    primaryAction: <Button>Continue learning</Button>,
    rewards: (
      <RewardCard
        category="xp"
        label="Experience points"
        state="earned"
        value="+100 XP"
      />
    ),
    secondaryAction: <Button variant="secondary">View profile</Button>,
    size: "full",
  },
  argTypes: {
    size: { control: "select", options: sizes },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A caller-driven level transition presentation. The caller supplies both levels, optional reward content, and actions. The pattern does not calculate progression or unlocks, and its optional Celebration honors reduced-motion preferences.",
      },
    },
  },
} satisfies Meta<typeof LevelUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullComposition: Story = {};

export const CompactComposition: Story = {
  args: { size: "compact" },
  render: ({ heading, newLevel, previousLevel, primaryAction }) => (
    <LevelUp
      celebration={false}
      heading={heading}
      newLevel={newLevel}
      previousLevel={previousLevel}
      primaryAction={primaryAction}
      size="compact"
    />
  ),
};

export const ReducedMotion: Story = {
  decorators: [
    (StoryComponent) => (
      <div className="ns-level-up-story-reduced-motion">
        <StoryComponent />
      </div>
    ),
  ],
};
