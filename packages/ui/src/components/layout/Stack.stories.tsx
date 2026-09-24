import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Button, Stack } from "@opennihongo/ui";
import "./stack.stories.css";

const meta = {
  title: "Components/Stack",
  component: Stack,
  args: {
    children: (
      <>
        <strong>Review today’s lesson</strong>
        <span>Practice vocabulary and grammar at your own pace.</span>
        <Button>Start review</Button>
      </>
    ),
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Centered: Story = {
  args: {
    align: "center",
  },
};

export const ResponsiveComposition: Story = {
  render: () => (
    <div className="ns-stack-story-grid">
      <section className="ns-stack-story-panel">
        <Stack gap="2">
          <strong>Vocabulary</strong>
          <span>Review the words from your latest lesson.</span>
          <Button variant="secondary">Open vocabulary</Button>
        </Stack>
      </section>
      <section className="ns-stack-story-panel">
        <Stack gap="2">
          <strong>Grammar</strong>
          <span>Revisit the patterns you studied this week.</span>
          <Button variant="secondary">Open grammar</Button>
        </Stack>
      </section>
    </div>
  ),
};
