import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { FormField, Textarea } from "@opennihongo/ui";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  args: {
    rows: 4,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Text wraps to the available width and overflowing content scrolls vertically. The default height is four rows; set `rows` for another initial height. Resize is vertical by default, or set `resize="none"` to lock the size.',
      },
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    placeholder: "Write a few notes...",
  },
  render: (args) => (
    <FormField
      description="Content wraps within the field and scrolls when it exceeds four rows."
      id="notes"
      label="Notes"
    >
      <Textarea {...args} />
    </FormField>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: "This field cannot be edited.",
    disabled: true,
  },
  render: (args) => (
    <FormField id="disabled-notes" label="Notes">
      <Textarea {...args} />
    </FormField>
  ),
};

export const Invalid: Story = {
  args: {
    defaultValue: "A response that needs more detail.",
  },
  render: (args) => (
    <FormField
      error="Add at least 20 characters."
      id="invalid-notes"
      label="Notes"
    >
      <Textarea {...args} />
    </FormField>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <FormField id="compact-notes" label="Compact">
        <Textarea rows={3} size="compact" />
      </FormField>
      <FormField id="standard-notes" label="Standard">
        <Textarea rows={3} />
      </FormField>
      <FormField id="comfortable-notes" label="Comfortable">
        <Textarea rows={3} size="comfortable" />
      </FormField>
    </div>
  ),
};

export const FixedSize: Story = {
  args: {
    placeholder: "This field keeps its four-row height.",
    resize: "none",
  },
  render: (args) => (
    <FormField
      description="Longer content remains available through vertical scrolling."
      id="fixed-notes"
      label="Fixed-size notes"
    >
      <Textarea {...args} />
    </FormField>
  ),
};
