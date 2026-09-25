import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import {
  Button,
  LessonCompleted,
  Progress,
  RewardCard,
  Text,
} from "@opennihongo/ui";
import "./lesson-completed.stories.css";

const progress = (
  <div className="ns-lesson-completed-story-progress">
    <Text as="p" color="secondary" variant="label">
      Course progress
    </Text>
    <Progress aria-label="Course progress" max={12} value={12} />
    <Text as="p" color="secondary" variant="caption">
      12 of 12 sections
    </Text>
  </div>
);

const rewards = (
  <RewardCard
    category="xp"
    label="Experience earned"
    state="earned"
    value="+125 XP"
  />
);

const meta = {
  title: "Patterns/Lesson Completed",
  component: LessonCompleted,
  args: {
    celebration: true,
    description: "You finished this course. Keep your momentum going.",
    primaryAction: <Button>Continue learning</Button>,
    progress,
    rewards,
    secondaryAction: <Button variant="secondary">Review lesson</Button>,
    title: "Lesson complete",
  },
  parameters: {
    docs: {
      description: {
        component:
          "A responsive completion composition. The caller supplies the heading, supporting text, progress and reward content, actions, and whether to show the optional celebration. It does not determine completion, calculate rewards, or navigate.",
      },
    },
  },
} satisfies Meta<typeof LessonCompleted>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ResponsiveComposition: Story = {
  render: (args) => (
    <div className="ns-lesson-completed-story-responsive">
      <div className="ns-lesson-completed-story-responsive__narrow">
        <Text as="h3" color="secondary" variant="label">
          Narrow layout
        </Text>
        <LessonCompleted {...args} />
      </div>
      <div className="ns-lesson-completed-story-responsive__wide">
        <Text as="h3" color="secondary" variant="label">
          Wide layout
        </Text>
        <LessonCompleted {...args} />
      </div>
    </div>
  ),
};

export const ReducedMotion: Story = {
  decorators: [
    (StoryComponent) => (
      <div className="ns-lesson-completed-story-reduced-motion">
        <StoryComponent />
      </div>
    ),
  ],
};
