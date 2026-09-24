import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Avatar, type AvatarSize } from "@opennihongo/ui";

const portraitImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23d8ebff'/%3E%3Ccircle cx='32' cy='24' r='13' fill='%233472b7'/%3E%3Cpath d='M8 64a24 24 0 0 1 48 0' fill='%233472b7'/%3E%3C/svg%3E";

const sizes: readonly AvatarSize[] = ["small", "medium", "large"];

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  args: {
    alt: "Yuki Tanaka",
    fallback: "YT",
    size: "medium",
  },
  parameters: {
    docs: {
      description: {
        component:
          'Use a meaningful `alt` label when the avatar identifies someone. Set `alt=""` when nearby text already names the person. The fallback stays decorative and the accessible identity remains available if the image fails to load.',
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Image: Story = {
  args: {
    src: portraitImage,
  },
};

export const InitialsFallback: Story = {};

export const ImageFailure: Story = {
  args: {
    src: "data:image/png;base64,invalid",
  },
};

export const Decorative: Story = {
  args: {
    alt: "",
  },
  render: (args) => (
    <div style={{ alignItems: "center", display: "flex", gap: "0.5rem" }}>
      <Avatar {...args} />
      <span>Yuki Tanaka</span>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ alignItems: "center", display: "flex", gap: "1rem" }}>
      {sizes.map((size) => (
        <Avatar
          alt={`Yuki Tanaka, ${size} size`}
          fallback="YT"
          key={size}
          size={size}
        />
      ))}
    </div>
  ),
};
