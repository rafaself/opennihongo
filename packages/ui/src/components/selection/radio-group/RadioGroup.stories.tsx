import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Radio, RadioGroup } from "@opennihongo/ui";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Compose a named RadioGroup with Radio options. Use Tab to enter the group and arrow keys to move and select options; the visible option text supplies each radio's accessible name.",
      },
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StudyMode: Story = {
  render: () => (
    <div>
      <h2 id="study-mode-label">Study mode</h2>
      <RadioGroup
        aria-labelledby="study-mode-label"
        defaultValue="hiragana"
        name="study-mode"
      >
        <Radio value="hiragana">Hiragana</Radio>
        <Radio value="katakana">Katakana</Radio>
        <Radio value="kanji">Kanji</Radio>
      </RadioGroup>
    </div>
  ),
};

export const DisabledOption: Story = {
  render: () => (
    <div>
      <h2 id="level-label">Study level</h2>
      <RadioGroup
        aria-labelledby="level-label"
        defaultValue="beginner"
        name="study-level"
      >
        <Radio value="beginner">Beginner</Radio>
        <Radio disabled value="intermediate">
          Intermediate (unavailable)
        </Radio>
        <Radio value="advanced">Advanced</Radio>
      </RadioGroup>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div>
      <h2 id="script-label">Writing system</h2>
      <RadioGroup
        aria-labelledby="script-label"
        defaultValue="hiragana"
        name="writing-system"
        orientation="horizontal"
      >
        <Radio value="hiragana">Hiragana</Radio>
        <Radio value="katakana">Katakana</Radio>
      </RadioGroup>
    </div>
  ),
};
