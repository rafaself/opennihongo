import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Inline, Spinner, Stack } from "@opennihongo/ui";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  args: {
    "aria-label": "Loading lesson",
    color: "primary",
    size: "medium",
  },
  argTypes: {
    color: { control: "select", options: ["primary", "secondary", "inverse"] },
    size: { control: "select", options: ["small", "medium", "large"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Spinner is an indeterminate status for short operations. Provide an `aria-label` or `aria-labelledby`, and include visible status text beside it so the icon, color, and animation are never the only status channel. It respects the system reduced-motion preference by stopping rotation; determinate work should use Progress or ProgressRing, and Skeleton is better when the expected content layout is known.",
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Inline align="center" gap="2">
      <Spinner {...args} />
      <span>Loading lesson</span>
    </Inline>
  ),
};

export const SizeScale: Story = {
  render: () => (
    <Inline align="center" gap="4">
      {(["small", "medium", "large"] as const).map((size) => (
        <Stack align="center" gap="2" key={size}>
          <Spinner aria-label={`Loading (${size})`} size={size} />
          <span>{size}</span>
        </Stack>
      ))}
    </Inline>
  ),
};

export const SemanticColors: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      {(["primary", "secondary"] as const).map((color) => (
        <Inline align="center" gap="2" key={color}>
          <Spinner aria-label={`Loading (${color})`} color={color} />
          <span>{color}</span>
        </Inline>
      ))}
      <section
        data-theme="light"
        style={{
          alignItems: "center",
          backgroundColor: "var(--ns-color-action-primary)",
          color: "var(--ns-color-action-primary-foreground)",
          display: "flex",
          gap: "var(--ns-space-2)",
          padding: "var(--ns-space-3)",
        }}
      >
        <Spinner aria-label="Loading (inverse)" color="inverse" />
        <span>inverse on primary surface</span>
      </section>
    </div>
  ),
};

export const ReducedMotion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "When the operating system requests reduced motion, the indicator remains visible without rotating and this visible text continues to identify the loading state.",
      },
    },
  },
  render: () => (
    <Inline align="center" gap="2">
      <Spinner aria-label="Loading lesson" />
      <span>Loading lesson</span>
    </Inline>
  ),
};
