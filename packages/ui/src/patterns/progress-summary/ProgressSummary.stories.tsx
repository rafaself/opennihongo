import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Button, ProgressSummary } from "@opennihongo/ui";
import "./progress-summary.stories.css";

const metrics = [
  {
    badge: { label: "In progress", variant: "info" as const },
    description: "Lessons completed in the selected course.",
    id: "lessons",
    label: "Lessons completed",
    max: 16,
    value: 11,
    valueLabel: "11 of 16",
  },
  {
    badge: { label: "On track", variant: "success" as const },
    description: "Words reviewed in the current study plan.",
    id: "vocabulary",
    label: "Vocabulary reviewed",
    max: 100,
    value: 72,
    valueLabel: "72%",
  },
  {
    description: "Caller-provided practice completion.",
    id: "practice",
    label: "Practice sessions",
    max: 20,
    value: 14,
    valueLabel: "14 of 20",
  },
];

const meta = {
  title: "Patterns/Progress Summary",
  component: ProgressSummary,
  args: {
    actions: <Button variant="secondary">View details</Button>,
    description: "A concise snapshot of caller-supplied progress metrics.",
    metrics,
    title: "Study progress",
  },
  parameters: {
    docs: {
      description: {
        component:
          "A responsive summary for caller-supplied metrics. Values, labels, badge states, and actions come from the caller; the pattern does not calculate domain progress or historical analytics.",
      },
    },
  },
} satisfies Meta<typeof ProgressSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ResponsiveLayouts: Story = {
  render: (args) => (
    <div className="ns-progress-summary-story-responsive">
      <div className="ns-progress-summary-story-responsive__narrow">
        <h3>Narrow layout</h3>
        <ProgressSummary {...args} />
      </div>
      <div className="ns-progress-summary-story-responsive__wide">
        <h3>Wide layout</h3>
        <ProgressSummary {...args} />
      </div>
    </div>
  ),
};

export const RingMetrics: Story = {
  args: {
    display: "ring",
  },
};
