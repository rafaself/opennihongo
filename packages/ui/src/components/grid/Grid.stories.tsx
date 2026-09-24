import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Grid } from "@opennihongo/ui";
import "./grid.stories.css";

const meta = {
  title: "Components/Grid",
  component: Grid,
  args: {
    children: (
      <>
        <article className="ns-grid-story-card">
          <h2>Vocabulary</h2>
          <p>Review the words from your latest lesson.</p>
        </article>
        <article className="ns-grid-story-card">
          <h2>Grammar</h2>
          <p>Revisit the patterns you studied this week.</p>
        </article>
        <article className="ns-grid-story-card">
          <h2>Listening</h2>
          <p>Practice recognizing familiar phrases.</p>
        </article>
      </>
    ),
    columns: 3,
    gap: "4",
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResponsiveCards: Story = {};

export const TwoColumns: Story = {
  args: {
    columns: 2,
    gap: "6",
  },
};
