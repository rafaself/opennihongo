import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@opennihongo/ui";
import "./dialog.stories.css";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component:
          "Dialog presents modal content with an accessible name, contained focus, Escape dismissal, scroll locking, and focus restoration. Include a visible close or recovery action, especially when dismissal is controlled.",
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

type DialogExampleProps = {
  defaultOpen?: boolean;
  reducedMotion?: boolean;
};

function DialogExample({
  defaultOpen,
  reducedMotion = false,
}: DialogExampleProps) {
  return (
    <Dialog {...(defaultOpen !== undefined ? { defaultOpen } : {})}>
      <DialogTrigger asChild>
        <Button variant="secondary">Study settings</Button>
      </DialogTrigger>
      <DialogContent
        className={reducedMotion ? "ns-dialog-story-reduced-motion" : undefined}
      >
        <DialogTitle>Study settings</DialogTitle>
        <DialogDescription>
          Choose how you would like to review this lesson.
        </DialogDescription>
        <div className="ns-dialog-story__actions">
          <DialogClose asChild>
            <Button>Save preferences</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const Closed: Story = {
  render: () => <DialogExample />,
};

export const Open: Story = {
  render: () => <DialogExample defaultOpen />,
};

export const ReducedMotion: Story = {
  render: () => <DialogExample defaultOpen reducedMotion />,
};
