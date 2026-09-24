import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import {
  FormField,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@opennihongo/ui";

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          "Compose Select with its exported parts. FormField can wrap SelectTrigger inside Select to provide the accessible name, description, and invalid state. Use Arrow keys to move through options, Enter or Space to select, and Escape to dismiss.",
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

type SelectExampleProps = {
  defaultOpen?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  error?: string;
  id: string;
};

function SelectExample({
  defaultOpen,
  defaultValue,
  disabled,
  error,
  id,
}: SelectExampleProps) {
  return (
    <Select
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      {...(disabled !== undefined ? { disabled } : {})}
    >
      <FormField
        {...(error !== undefined ? { error } : {})}
        id={id}
        label="Writing system"
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose a writing system" />
        </SelectTrigger>
      </FormField>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Japanese scripts</SelectLabel>
          <SelectItem value="hiragana">Hiragana</SelectItem>
          <SelectItem value="katakana">Katakana</SelectItem>
          <SelectItem value="kanji">Kanji</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export const Open: Story = {
  render: () => <SelectExample defaultOpen id="writing-system-open" />,
};

export const Selected: Story = {
  render: () => (
    <SelectExample defaultValue="hiragana" id="writing-system-selected" />
  ),
};

export const Disabled: Story = {
  render: () => <SelectExample disabled id="writing-system-disabled" />,
};

export const Invalid: Story = {
  render: () => (
    <SelectExample
      error="Choose a writing system."
      id="writing-system-invalid"
    />
  ),
};
