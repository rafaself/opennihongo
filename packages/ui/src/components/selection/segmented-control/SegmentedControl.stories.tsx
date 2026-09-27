import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { SegmentedControl } from "@opennihongo/ui";

const options = [
  { value: "hiragana", label: "Hiragana" },
  { value: "katakana", label: "Katakana" },
] as const;

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  parameters: {
    docs: {
      description: {
        component:
          "A compact, controlled radio group for choosing one of a few peer options. Its selected surface glides between options. Tab into the group and use the arrow keys to move and select.",
      },
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

function KanaScriptExample() {
  const [script, setScript] =
    useState<(typeof options)[number]["value"]>("hiragana");

  return (
    <div>
      <SegmentedControl
        aria-label="Kana scripts"
        onValueChange={setScript}
        options={options}
        value={script}
      />
      <p>Showing {script === "hiragana" ? "Hiragana" : "Katakana"}.</p>
    </div>
  );
}

export const KanaScripts: Story = {
  args: {
    "aria-label": "Kana scripts",
    onValueChange: () => undefined,
    options,
    value: "hiragana",
  },
  render: () => <KanaScriptExample />,
};
