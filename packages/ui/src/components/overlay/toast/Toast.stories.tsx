import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import {
  Button,
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@opennihongo/ui";

const meta = {
  title: "Components/Toast",
  component: Toast,
  parameters: {
    docs: {
      description: {
        component:
          "Toast presents brief feedback without taking focus. Place one ToastProvider and ToastViewport around the application, then render Toast with a title, description, and an explicit dismiss control. Toasts pause while the pointer or keyboard focus is in the notification region. Use a persistent channel for critical errors.",
      },
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

type ToastVariant = "success" | "warning" | "danger" | "info";

const feedback: Record<ToastVariant, { title: string; description: string }> = {
  success: {
    title: "Progress saved",
    description: "Your study progress is up to date.",
  },
  warning: {
    title: "Offline mode",
    description: "Changes will sync when you reconnect.",
  },
  danger: {
    title: "Could not save changes",
    description: "Your latest changes may not be available on another device.",
  },
  info: {
    title: "New lesson available",
    description: "Continue when you are ready.",
  },
};

type ToastShowcaseProps = {
  duration?: number;
};

function ToastShowcase({ duration = 5000 }: ToastShowcaseProps) {
  const [variant, setVariant] = useState<ToastVariant>("success");
  const [open, setOpen] = useState(false);
  const message = feedback[variant];

  return (
    <ToastProvider duration={duration}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        {(Object.keys(feedback) as ToastVariant[]).map((option) => (
          <Button
            key={option}
            onClick={() => {
              setVariant(option);
              setOpen(true);
            }}
            variant="secondary"
          >
            Show {option}
          </Button>
        ))}
      </div>
      <Toast
        announcement={variant === "danger" ? "assertive" : "polite"}
        onOpenChange={setOpen}
        open={open}
        variant={variant}
      >
        <div>
          <ToastTitle>{message.title}</ToastTitle>
          <ToastDescription>{message.description}</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}

export const Variants: Story = {
  render: () => <ToastShowcase />,
};

export const PausesWhileInteracting: Story = {
  render: () => <ToastShowcase duration={2500} />,
  parameters: {
    docs: {
      description: {
        story:
          "The timer pauses while the pointer or keyboard focus is inside the toast region, then resumes when it leaves.",
      },
    },
  },
};

export const DismissManually: Story = {
  render: () => <ToastShowcase duration={Infinity} />,
  parameters: {
    docs: {
      description: {
        story:
          "This notification remains until dismissed with its close button, Escape, or a swipe in the configured direction.",
      },
    },
  },
};
