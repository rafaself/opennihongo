import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Checkbox, FormField } from "@opennihongo/ui";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          "Use FormField or a native label to provide an accessible name. The indeterminate prop sets the native mixed state; press Tab in the FocusVisible story to inspect the keyboard focus ring.",
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  render: (args) => (
    <FormField id="unchecked" label="Remember this choice">
      <Checkbox {...args} />
    </FormField>
  ),
};

export const Checked: Story = {
  args: { defaultChecked: true },
  render: (args) => (
    <FormField id="checked" label="Remember this choice">
      <Checkbox {...args} />
    </FormField>
  ),
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: (args) => (
    <FormField id="indeterminate" label="Select all items">
      <Checkbox {...args} />
    </FormField>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <FormField id="disabled" label="Unavailable choice">
      <Checkbox {...args} />
    </FormField>
  ),
};

export const FocusVisible: Story = {
  render: (args) => (
    <label>
      <Checkbox {...args} />
      Keyboard focus example (press Tab to focus)
    </label>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Press Tab from the Canvas to focus this native checkbox and review its focus-visible treatment.",
      },
    },
  },
};
