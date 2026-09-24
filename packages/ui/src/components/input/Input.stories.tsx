import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { FormField, Input } from "@opennihongo/ui";

const meta = {
  title: "Components/Input",
  component: Input,
  args: {
    type: "text",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    autoComplete: "given-name",
    placeholder: "e.g. Hana",
  },
  render: (args) => (
    <FormField
      description="This is how your name will appear."
      id="name"
      label="Name"
    >
      <Input {...args} />
    </FormField>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: "Hana",
    disabled: true,
  },
  render: (args) => (
    <FormField id="name-disabled" label="Name">
      <Input {...args} />
    </FormField>
  ),
};

export const Invalid: Story = {
  args: {
    defaultValue: "hana@",
    type: "email",
  },
  render: (args) => (
    <FormField
      error="Enter a valid email address."
      id="email"
      label="Email address"
    >
      <Input {...args} />
    </FormField>
  ),
};
