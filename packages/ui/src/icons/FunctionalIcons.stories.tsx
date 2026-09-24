import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckIcon, CloseIcon, type IconSize } from "@opennihongo/ui/icons";

const sizes: IconSize[] = ["small", "medium", "large"];

const meta = {
  title: "Icons/Functional icons",
  component: CheckIcon,
  parameters: { layout: "centered" },
} satisfies Meta<typeof CheckIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Registry: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(3, minmax(7rem, 1fr))",
      }}
    >
      {sizes.map((size) => (
        <div key={size} style={{ display: "grid", gap: "0.5rem" }}>
          <strong>{size}</strong>
          <span>
            <CheckIcon size={size} /> Check
          </span>
          <span>
            <CloseIcon size={size} /> Close
          </span>
        </div>
      ))}
    </div>
  ),
};
