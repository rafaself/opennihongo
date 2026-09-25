import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@opennihongo/ui";

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
};

function PopoverExample({ defaultOpen }: PopoverExampleProps) {
  return (
    <Popover {...(defaultOpen !== undefined ? { defaultOpen } : {})}>
      <PopoverTrigger asChild>
        <Button variant="secondary">Reference details</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Reference details">
        <p>Use this reference when reviewing the kana reading.</p>
      </PopoverContent>
    </Popover>
  );
}

export const Closed: Story = {
  render: () => <PopoverExample />,
};

export const Open: Story = {
  render: () => <PopoverExample defaultOpen />,
};

export const ReducedMotion: Story = {
  beforeEach: () => {
    const root = document.documentElement;
    const previousMotion = root.getAttribute("data-motion");
    root.setAttribute("data-motion", "reduced");

    return () => {
      if (previousMotion === null) {
        root.removeAttribute("data-motion");
      } else {
        root.setAttribute("data-motion", previousMotion);
      }
    };
  },
  render: () => <PopoverExample defaultOpen />,
};
