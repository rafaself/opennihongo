import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Radio, RadioGroup, Text } from "@opennihongo/ui";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          "Compose a named RadioGroup with Radio options. Use the card variant for content-rich choices while preserving radio semantics. Use Tab to enter the group and arrow keys to move and select options.",
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

export const SelectableCards: Story = {
  render: () => (
    <div>
      <h2 id="pronunciation-format-label">Pronunciation format</h2>
      <RadioGroup
        aria-labelledby="pronunciation-format-label"
        defaultValue="romanized"
        name="pronunciation-format"
        orientation="horizontal"
      >
        <Radio
          aria-label="Romanized Japanese pronunciation"
          value="romanized"
          variant="card"
        >
          <Text as="span" color="secondary" variant="caption">
            ni hon go
          </Text>
          <Text as="span" lang="ja" variant="display">
            日本語
          </Text>
          <Text as="span" variant="label">
            Romanized
          </Text>
        </Radio>
        <Radio
          aria-label="Japanese pronunciation"
          value="japanese"
          variant="card"
        >
          <Text as="span" color="secondary" variant="caption">
            に ほん ご
          </Text>
          <Text as="span" lang="ja" variant="display">
            日本語
          </Text>
          <Text as="span" variant="label">
            Japanese
          </Text>
        </Radio>
      </RadioGroup>
    </div>
  ),
};
