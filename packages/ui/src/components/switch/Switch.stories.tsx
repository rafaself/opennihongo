import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { FormField, Switch } from "@opennihongo/ui";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          "Use Switch for an on/off setting that applies immediately. Label it with FormField, a native label, or an accessible name. Use Checkbox for selection and Button for actions requiring explicit submission or confirmation.",
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  render: (args) => (
    <FormField id="notifications-off" label="Notifications">
      <Switch {...args} />
    </FormField>
  ),
};

export const On: Story = {
  args: { defaultChecked: true },
  render: (args) => (
    <FormField id="notifications-on" label="Notifications">
      <Switch {...args} />
    </FormField>
  ),
};

export const DisabledOff: Story = {
  args: { disabled: true },
  render: (args) => (
    <FormField id="notifications-disabled-off" label="Notifications">
      <Switch {...args} />
    </FormField>
  ),
};

export const DisabledOn: Story = {
  args: { defaultChecked: true, disabled: true },
  render: (args) => (
    <FormField id="notifications-disabled-on" label="Notifications">
      <Switch {...args} />
    </FormField>
  ),
};
