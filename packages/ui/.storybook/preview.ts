import type { Preview } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the exported stylesheet path.
import "@opennihongo/ui/styles.css";

const preview: Preview = {
  parameters: {
    a11y: {
      test: "error",
    },
  },
};

export default preview;
