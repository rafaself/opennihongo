import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { ActionCard, Grid, Text } from "@opennihongo/ui";

const meta = {
  title: "Components/ActionCard",
  component: ActionCard,
  parameters: {
    docs: {
      description: {
        component:
          "ActionCard is a full-card native button for choices with an illustration, title, and optional detail. Use a link for navigation and keep the action behavior with the caller.",
      },
    },
  },
  args: {
    media: (
      <Text as="span" variant="display">
        あ
      </Text>
    ),
    title: "Hiragana",
    description: "Build a foundation for reading.",
  },
} satisfies Meta<typeof ActionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const StudyOptions: Story = {
  render: () => (
    <Grid columns={3} gap="3">
      <ActionCard
        description="Build a foundation for reading."
        media={
          <Text as="span" variant="display">
            あ
          </Text>
        }
        title="Hiragana"
      />
      <ActionCard
        description="Practice alternate syllable forms."
        media={
          <Text as="span" variant="display">
            ア
          </Text>
        }
        title="Katakana"
      />
      <ActionCard
        description="Study characters in context."
        media={
          <Text as="span" variant="display">
            字
          </Text>
        }
        title="Kanji"
      />
    </Grid>
  ),
};
