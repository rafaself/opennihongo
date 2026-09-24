import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Skeleton, Stack } from "@opennihongo/ui";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  args: {
    shape: "text",
    size: "medium",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Skeleton is a decorative placeholder for content whose layout is known while it loads. Its markup is always hidden from assistive technology, so put `aria-busy` and a status message on the consuming region. Prefer Skeleton when a placeholder can preserve the expected content shape; use a spinner for a short indeterminate action when there is no content layout to represent.",
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextLines: Story = {
  render: () => (
    <Stack gap="2" style={{ maxInlineSize: "24rem" }}>
      <Skeleton shape="text" size="large" style={{ inlineSize: "62%" }} />
      <Skeleton shape="text" style={{ inlineSize: "100%" }} />
      <Skeleton shape="text" style={{ inlineSize: "88%" }} />
      <Skeleton shape="text" size="small" style={{ inlineSize: "44%" }} />
    </Stack>
  ),
};

export const ProfileComposition: Story = {
  render: () => (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap: "var(--ns-space-4)",
        maxInlineSize: "24rem",
      }}
    >
      <Skeleton shape="circular" size="large" />
      <Stack gap="2" style={{ flex: 1 }}>
        <Skeleton shape="text" size="large" style={{ inlineSize: "58%" }} />
        <Skeleton shape="text" style={{ inlineSize: "82%" }} />
      </Stack>
    </div>
  ),
};

export const ImageAndStatus: Story = {
  render: () => (
    <section
      aria-busy="true"
      aria-label="Loading lesson preview"
      style={{
        display: "grid",
        gap: "var(--ns-space-3)",
        maxInlineSize: "24rem",
      }}
    >
      <p role="status">Loading lesson preview</p>
      <Skeleton shape="rectangular" style={{ blockSize: "9rem" }} />
      <Skeleton shape="text" style={{ inlineSize: "70%" }} />
      <Skeleton shape="text" size="small" style={{ inlineSize: "42%" }} />
    </section>
  ),
};
