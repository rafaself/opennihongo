import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Divider, Stack } from "@opennihongo/ui";

const meta = {
  title: "Components/Divider",
  component: Divider,
  argTypes: {
    decorative: {
      control: "boolean",
      description:
        "Hide the line from assistive technology when it is purely visual. Leave false when the line separates meaningful sections.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Divider draws a horizontal rule using semantic border tokens. It exposes the native separator semantics by default. Set `decorative` when the line is only visual. Divider does not add surrounding spacing; use a layout component to establish hierarchy.",
      },
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SemanticSeparator: Story = {
  render: () => (
    <Stack gap="3">
      <strong>Vocabulary</strong>
      <span>Review words from the current lesson.</span>
      <Divider />
      <strong>Grammar</strong>
      <span>Continue with the next practice section.</span>
    </Stack>
  ),
};

export const Decorative: Story = {
  render: () => (
    <Stack gap="3">
      <strong>Vocabulary</strong>
      <span>Review words from the current lesson.</span>
      <Divider decorative />
      <strong>Grammar</strong>
      <span>Continue with the next practice section.</span>
    </Stack>
  ),
};
