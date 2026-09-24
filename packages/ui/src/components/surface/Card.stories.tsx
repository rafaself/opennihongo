import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Button, Card, Stack, Text } from "@opennihongo/ui";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "Card is a static content container. Use an article for self-contained content, or a labelled section for a named region. Compose explicit Buttons or links inside it for actions; the card root itself is not clickable.",
      },
    },
  },
  args: {
    children: (
      <Stack gap="3">
        <Text as="h2" variant="heading">
          Vocabulary practice
        </Text>
        <Text>
          Review words from your latest lesson and strengthen what you have
          learned.
        </Text>
        <Button>Start review</Button>
      </Stack>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Subtle: Story = {
  args: { variant: "subtle" },
};

export const Raised: Story = {
  args: { variant: "raised" },
};

export const Article: Story = {
  args: {
    as: "article",
    "aria-labelledby": "card-story-heading",
    children: (
      <Stack gap="3">
        <Text as="h2" id="card-story-heading" variant="heading">
          A self-contained lesson
        </Text>
        <Text>
          Use the article element when this content can stand on its own.
        </Text>
        <Button>Open lesson</Button>
      </Stack>
    ),
  },
};

export const LabelledSection: Story = {
  args: {
    as: "section",
    "aria-labelledby": "review-story-heading",
    children: (
      <Stack gap="3">
        <Text as="h2" id="review-story-heading" variant="heading">
          Review due today
        </Text>
        <Text>Group related content in a labelled section.</Text>
      </Stack>
    ),
  },
};
