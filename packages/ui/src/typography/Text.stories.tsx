import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Text } from "@opennihongo/ui";

const meta = {
  title: "Components/Text",
  component: Text,
  args: {
    children: "The quick brown fox jumps over the lazy dog.",
  },
  argTypes: {
    as: {
      control: "select",
      options: [
        "p",
        "span",
        "div",
        "h1",
        "h2",
        "h3",
        "strong",
        "em",
        "small",
        "label",
      ],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "inverse"],
    },
    variant: {
      control: "select",
      options: ["display", "heading", "body", "label", "caption"],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SemanticStyles: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ns-space-4)" }}>
      <Text variant="display">Display</Text>
      <Text variant="heading">Heading</Text>
      <Text>Body copy supports comfortable reading across multiple lines.</Text>
      <Text as="span" variant="label">
        Label
      </Text>
      <Text as="small" variant="caption">
        Caption
      </Text>
    </div>
  ),
};

export const VisualStyleAndSemantics: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ns-space-4)" }}>
      <Text as="h1" variant="body">
        A body style can still be the page heading
      </Text>
      <Text as="p" variant="heading">
        A paragraph can use the heading style
      </Text>
      <Text color="secondary" variant="caption">
        The selected element controls document meaning; the variant controls
        appearance.
      </Text>
    </div>
  ),
};

export const SemanticColors: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ns-space-3)" }}>
      <Text color="primary">Primary text</Text>
      <Text color="secondary">Secondary text</Text>
      <Text color="tertiary">Tertiary text</Text>
      <div
        style={{
          backgroundColor: "var(--ns-color-text-primary)",
          borderRadius: "var(--ns-radius-md)",
          padding: "var(--ns-space-4)",
        }}
      >
        <Text color="inverse">Inverse text on the primary text color</Text>
      </div>
    </div>
  ),
};
