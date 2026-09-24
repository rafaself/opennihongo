import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { FormField } from "@opennihongo/ui";

const meta = {
  title: "Components/FormField",
  component: FormField,
  args: {
    children: <input />,
    id: "example-field",
    label: "Example field",
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <FormField id="display-name" label="Display name">
      <input autoComplete="name" />
    </FormField>
  ),
};

export const Select: Story = {
  render: () => (
    <FormField id="practice-language" label="Practice language">
      <select defaultValue="ja">
        <option value="ja">Japanese</option>
        <option value="en">English</option>
      </select>
    </FormField>
  ),
};

export const Described: Story = {
  render: () => (
    <FormField
      description="This name appears on your learning profile."
      id="profile-name"
      label="Profile name"
      required
    >
      <input autoComplete="name" />
    </FormField>
  ),
};

export const Invalid: Story = {
  render: () => (
    <FormField
      description="Use the email address associated with your account."
      error="Enter a valid email address."
      id="email"
      label="Email address"
      required
    >
      <input autoComplete="email" type="email" />
    </FormField>
  ),
};
