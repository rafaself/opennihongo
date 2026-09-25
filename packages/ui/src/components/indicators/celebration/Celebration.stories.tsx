import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Celebration, LevelBadge } from "@opennihongo/ui";
import "./celebration.stories.css";

const meta = {
  title: "Gamification/Celebration",
  component: Celebration,
  args: {
    active: true,
    children: <LevelBadge label="Level" value={12} />,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Celebration applies a finite scale-and-glow emphasis when caller state becomes active. It has no domain rules and honors the operating system reduced-motion preference.",
      },
    },
  },
} satisfies Meta<typeof Celebration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Inactive: Story = {
  args: { active: false },
};

export const ReducedMotion: Story = {
  decorators: [
    (Story) => (
      <div className="ns-celebration-story-reduced-motion">
        <Story />
      </div>
    ),
  ],
};
