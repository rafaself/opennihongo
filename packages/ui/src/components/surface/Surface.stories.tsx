import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Button, Surface } from "@opennihongo/ui";
import "./surface.stories.css";

const meta = {
  title: "Components/Surface",
  component: Surface,
  args: {
    children: (
      <div className="ns-surface-story-content">
        <h2>Vocabulary practice</h2>
        <p>Review words from your latest lesson.</p>
      </div>
    ),
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Flat: Story = {};

export const Raised: Story = {
  args: {
    variant: "raised",
    elevation: "card",
  },
};

export const InteractiveContent: Story = {
  args: {
    elevation: "interactive",
    children: (
      <div className="ns-surface-story-content">
        <h2>Continue studying</h2>
        <p>Open your review session and practice at your own pace.</p>
        <Button>Start review</Button>
      </div>
    ),
  },
};

export const ThemeMappings: Story = {
  render: () => (
    <div className="ns-surface-story-themes">
      <div className="ns-surface-story-theme" data-theme="light">
        <Surface elevation="card" variant="raised">
          <div className="ns-surface-story-content">
            <h2>Light theme</h2>
            <p>Surface and elevation roles resolve from shared theme tokens.</p>
          </div>
        </Surface>
      </div>
      <div className="ns-surface-story-theme" data-theme="dark">
        <Surface elevation="card" variant="raised">
          <div className="ns-surface-story-content">
            <h2>Dark theme</h2>
            <p>Surface and elevation roles resolve from shared theme tokens.</p>
          </div>
        </Surface>
      </div>
    </div>
  ),
};
