import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Button, Tooltip } from "@opennihongo/ui";
import "./tooltip.stories.css";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  args: {
    children: <Button>Tooltip action</Button>,
    content: "Supplementary description",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Tooltip provides a brief, supplemental plain-text description for a focusable control. It opens on pointer hover or keyboard focus and closes with Escape. Do not put required information or interactive content in a tooltip.",
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PointerHover: Story = {
  args: {
    children: <Button>Save lesson</Button>,
    content: "Saves this lesson for later",
    delayDuration: 0,
  },
};

export const KeyboardFocus: Story = {
  args: {
    children: <Button variant="secondary">Open reference</Button>,
    content: "Opens the supplementary reference",
    delayDuration: 0,
  },
};

export const ReducedMotion: Story = {
  args: {
    children: <Button>Save lesson</Button>,
    content: "Saves this lesson for later",
    delayDuration: 0,
  },
  render: (args) => (
    <div className="ns-tooltip-story-reduced-motion">
      <p>Tooltip animation is disabled for reduced motion.</p>
      <Tooltip {...args} />
    </div>
  ),
};
