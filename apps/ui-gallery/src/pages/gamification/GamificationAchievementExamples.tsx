import {
  Achievement,
  AchievementUnlocked,
  Button,
  LeaderboardItem,
  QuestCard,
  RewardCard,
  RewardReceived,
} from "@opennihongo/ui";

export function GamificationAchievementExamples() {
  return (
    <div className="gallery-gamification-cards">
      <article className="gallery-doc-example-card">
        <h3>Achievement</h3>
        <p>Present caller-selected state and progress.</p>
        <div className="gallery-gamification-stage">
          <Achievement
            description="Explore Japanese one small step at a time."
            progress={{
              current: 3,
              label: "3 of 5 kana challenges",
              target: 5,
            }}
            state="in-progress"
            title="Kana explorer"
          />
        </div>
      </article>
      <article className="gallery-doc-example-card gallery-gamification-card--wide">
        <h3>Achievement unlocked</h3>
        <p>Provide the achievement details and next actions explicitly.</p>
        <div className="gallery-gamification-stage">
          <AchievementUnlocked
            achievement={{
              description: "Explore Japanese one small step at a time.",
              state: "new",
              title: "Kana explorer",
            }}
            celebration
            heading="Achievement unlocked"
            primaryAction={<Button>Continue learning</Button>}
            secondaryAction={
              <Button variant="secondary">View achievements</Button>
            }
          />
        </div>
      </article>
      <article className="gallery-doc-example-card gallery-gamification-card--wide">
        <h3>Semantic reward categories</h3>
        <p>
          Category controls the reward accent; labels and values come from the
          caller.
        </p>
        <div className="gallery-gamification-stage gallery-gamification-stage--stack">
          <RewardCard
            category="xp"
            label="Lesson bonus"
            state="earned"
            value="+50 XP"
          />
          <RewardCard
            category="streak"
            label="Seven-day milestone"
            state="earned"
            value="7 days"
          />
          <RewardCard
            category="achievement"
            label="Kana explorer"
            state="earned"
            value="Achievement badge"
          />
        </div>
      </article>
      <article className="gallery-doc-example-card gallery-gamification-card--wide">
        <h3>Reward received</h3>
        <p>Show an already supplied reward and caller-owned actions.</p>
        <div className="gallery-gamification-stage">
          <RewardReceived
            celebration
            description="Your effort is adding up."
            heading="Reward received"
            primaryAction={<Button>Continue learning</Button>}
            reward={{
              category: "xp",
              label: "Experience points",
              state: "earned",
              value: "+125 XP",
            }}
          />
        </div>
      </article>
      <article className="gallery-doc-example-card gallery-gamification-card--wide">
        <h3>Quest</h3>
        <p>
          Pass progress and status separately; the component does not infer
          completion.
        </p>
        <div className="gallery-gamification-stage">
          <QuestCard
            action={<Button variant="secondary">Continue quest</Button>}
            description="Practice a few words each day to build your vocabulary."
            goal={5}
            progress={2}
            reward={{
              category: "xp",
              label: "Quest reward",
              state: "preview",
              value: "+30 XP",
            }}
            status="incomplete"
            title="Daily word practice"
          />
        </div>
      </article>
      <article className="gallery-doc-example-card gallery-gamification-card--wide">
        <h3>Leaderboard</h3>
        <p>Supply ordered rows and rank changes from the owning feature.</p>
        <div className="gallery-gamification-stage">
          <ol className="gallery-gamification-leaderboard">
            <LeaderboardItem
              change={{ direction: "up", label: "Up 2 places" }}
              participantName="Emi Tanaka"
              rank={1}
              score="1,520 XP"
            />
            <LeaderboardItem
              avatarFallback="ET"
              change={{ direction: "unchanged", label: "No change" }}
              isCurrentUser
              participantName="You"
              rank={2}
              score="1,240 XP"
            />
          </ol>
        </div>
      </article>
    </div>
  );
}
