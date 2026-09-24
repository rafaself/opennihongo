import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Button } from "@opennihongo/ui";

const meta = {
  title: "Components/Button",
  component: Button,
  args: {
    children: "Continue",
  },
} satisfies Meta<typeof Button>;

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
