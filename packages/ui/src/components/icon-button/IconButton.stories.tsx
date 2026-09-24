import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { IconButton } from "@opennihongo/ui";
import type { IconName } from "@opennihongo/ui/icons";

const icons: IconName[] = ["check", "close"];

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  args: {
    "aria-label": "Close dialog",
    icon: "close",
  },
  argTypes: {
    icon: { control: "select", options: icons },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Compact: Story = {
  args: {
    size: "compact",
  },
};

export const Comfortable: Story = {
  args: {
    size: "comfortable",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
