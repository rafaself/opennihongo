import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon, type IconName, type IconSize } from "@opennihongo/ui/icons";

const sizes: IconSize[] = ["small", "medium", "large"];
const names: IconName[] = ["check", "close"];

const meta = {
  title: "Icons/Functional icons",
  component: Icon,
  args: { name: "check" },
  argTypes: {
    name: { control: "select", options: names },
    size: { control: "select", options: sizes },
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Icon>;

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
          {names.map((name) => (
            <span key={name}>
              <Icon name={name} size={size} /> {name}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const DecorativeAndNamed: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <span>
        <Icon name="check" /> Completed
      </span>
      <Icon aria-label="Dismiss" name="close" />
    </div>
  ),
};
