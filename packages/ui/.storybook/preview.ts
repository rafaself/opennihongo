import { createElement } from "react";
import type { Preview } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { TooltipProvider } from "@opennihongo/ui";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the exported stylesheet path.
import "@opennihongo/ui/styles.css";

const preview: Preview = {
  decorators: [
    (Story) => createElement(TooltipProvider, null, createElement(Story)),
  ],
  parameters: {
    a11y: {
      test: "error",
    },
  },
};

export default preview;
