import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@opennihongo/ui";
import "./popover.stories.css";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          "Popover composes a trigger and portaled content for small interactive floating surfaces. It is non-modal by default, returns focus to its trigger after Escape, and dismisses when the user interacts outside it.",
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

type PopoverExampleProps = {
  defaultOpen?: boolean;
  reducedMotion?: boolean;
};

function PopoverExample({
  defaultOpen,
  reducedMotion = false,
}: PopoverExampleProps) {
  return (
    <div
      className={reducedMotion ? "ns-popover-story-reduced-motion" : undefined}
    >
      <Popover {...(defaultOpen !== undefined ? { defaultOpen } : {})}>
        <PopoverTrigger asChild>
          <Button variant="secondary">Reference details</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Reference details">
          <p>Use this reference when reviewing the kana reading.</p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const Closed: Story = {
  render: () => <PopoverExample />,
};

export const Open: Story = {
  render: () => <PopoverExample defaultOpen />,
};

export const ReducedMotion: Story = {
  render: () => <PopoverExample defaultOpen reducedMotion />,
};
