import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { AchievementUnlocked, Button, Text } from "@opennihongo/ui";
import "./achievement-unlocked.stories.css";

const meta = {
  title: "Patterns/Achievement Unlocked",
  component: AchievementUnlocked,
  args: {
    achievement: {
      description: "Explore Japanese one small step at a time.",
      state: "new",
      title: "Kana explorer",
    },
    celebration: true,
    heading: "Achievement unlocked",
    primaryAction: <Button>Continue learning</Button>,
    secondaryAction: <Button variant="secondary">View achievements</Button>,
  },
  parameters: {
    docs: {
      description: {
        component:
          "A responsive achievement presentation. The caller supplies achievement metadata, its display state, and actions. The pattern does not decide eligibility, persist state, or grant rewards, and its content remains available when celebration motion is reduced.",
      },
    },
  },
} satisfies Meta<typeof AchievementUnlocked>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ResponsiveComposition: Story = {
  render: (args) => (
    <div className="ns-achievement-unlocked-story-responsive">
      <div className="ns-achievement-unlocked-story-responsive__narrow">
        <Text as="h3" color="secondary" variant="label">
          Narrow layout
        </Text>
        <AchievementUnlocked {...args} />
      </div>
      <div className="ns-achievement-unlocked-story-responsive__wide">
        <Text as="h3" color="secondary" variant="label">
          Wide layout
        </Text>
        <AchievementUnlocked {...args} />
      </div>
    </div>
  ),
};

export const ReducedMotion: Story = {
  decorators: [
    (StoryComponent) => (
      <div className="ns-achievement-unlocked-story-reduced-motion">
        <StoryComponent />
      </div>
    ),
  ],
};
