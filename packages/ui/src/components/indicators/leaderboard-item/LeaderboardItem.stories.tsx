import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { LeaderboardItem } from "@opennihongo/ui";
import "./leaderboard-item.stories.css";

const meta = {
  title: "Gamification/LeaderboardItem",
  component: LeaderboardItem,
  args: {
    participantName: "Emi Tanaka",
    rank: 2,
    score: "1,240 XP",
  },
  argTypes: {
    change: { control: "object" },
    isCurrentUser: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "LeaderboardItem presents caller-supplied rank, participant identity, score, optional rank movement, and current-user state. It does not sort participants, calculate ranks, fetch users, or implement leaderboard rules. Place it inside an ordered or unordered list; current-user state has both a visible label and aria-current semantics.",
      },
    },
  },
} satisfies Meta<typeof LeaderboardItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentUserRising: Story = {
  args: {
    avatarFallback: "ET",
    change: { direction: "up", label: "Up 2 places" },
    isCurrentUser: true,
  },
  render: (args) => (
    <ol className="ns-leaderboard-item-story-list">
      <LeaderboardItem {...args} />
    </ol>
  ),
};

export const RankMovementStates: Story = {
  render: () => (
    <ol className="ns-leaderboard-item-story-list">
      <LeaderboardItem
        change={{ direction: "up", label: "Up 2 places" }}
        participantName="Aki Sato"
        rank={1}
        score="1,520 XP"
      />
      <LeaderboardItem
        change={{ direction: "down", label: "Down 1 place" }}
        participantName="Ren Ito"
        rank={2}
        score="1,300 XP"
      />
      <LeaderboardItem
        change={{ direction: "unchanged", label: "No change" }}
        participantName="Yuna Mori"
        rank={3}
        score="1,240 XP"
      />
    </ol>
  ),
};
