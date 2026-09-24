import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Button, Inline } from "@opennihongo/ui";
import "./inline.stories.css";

const meta = {
  title: "Components/Inline",
  component: Inline,
  args: {
    children: (
      <>
        <Button>Save changes</Button>
        <Button variant="secondary">Cancel</Button>
      </>
    ),
  },
} satisfies Meta<typeof Inline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActionRow: Story = {};

export const CenteredActions: Story = {
  args: {
    justify: "center",
  },
};

export const WrappingActions: Story = {
  render: () => (
    <div className="ns-inline-story-narrow">
      <Inline gap="2">
        <Button>Continue lesson</Button>
        <Button variant="secondary">Review later</Button>
        <Button variant="secondary">Open notes</Button>
      </Inline>
    </div>
  ),
};

export const Metadata: Story = {
  render: () => (
    <Inline className="ns-inline-story-metadata" gap="2-5" wrap>
      <span>Japanese 101</span>
      <span aria-hidden="true">·</span>
      <span>12 lessons</span>
      <span aria-hidden="true">·</span>
      <span>Beginner</span>
    </Inline>
  ),
};
