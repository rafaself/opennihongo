import {
  AchievementUnlocked,
  Button,
  DailyGoalCompleted,
  LessonCompleted,
  LevelUp,
  ProgressSummary,
  RewardReceived,
} from "@opennihongo/ui";

export function PatternsExamples() {
  return (
    <>
      <nav aria-label="Patterns catalog index">
        <ul>
          <li>
            <a href="#lesson-completed">Lesson Completed</a>
          </li>
          <li>
            <a href="#achievement-unlocked">Achievement Unlocked</a>
          </li>
          <li>
            <a href="#level-up">Level Up</a>
          </li>
          <li>
            <a href="#reward-received">Reward Received</a>
          </li>
          <li>
            <a href="#progress-summary">Progress Summary</a>
          </li>
          <li>
            <a href="#daily-goal-completed">Daily Goal Completed</a>
          </li>
        </ul>
      </nav>
      <div className="gallery-doc-example-grid">
        <article
          aria-labelledby="lesson-completed"
          className="gallery-doc-example-card"
        >
          <h3 id="lesson-completed">Lesson Completed</h3>
          <p>Supply the finished lesson summary, rewards, and next action.</p>
          <div className="gallery-doc-example-stage">
            <LessonCompleted
              celebration
              description="You finished this course. Keep your momentum going."
              primaryAction={<Button>Continue learning</Button>}
              progress={<span>12 of 12 sections completed</span>}
              rewards={<span>+125 XP earned</span>}
              title="Lesson complete"
            />
          </div>
        </article>

        <article
          aria-labelledby="achievement-unlocked"
          className="gallery-doc-example-card"
        >
          <h3 id="achievement-unlocked">Achievement Unlocked</h3>
          <p>Pass the selected achievement state and caller-owned actions.</p>
          <div className="gallery-doc-example-stage">
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

        <article
          aria-labelledby="level-up"
          className="gallery-doc-example-card"
        >
          <h3 id="level-up">Level Up</h3>
          <p>
            Provide both level values, optional rewards, and the next action.
          </p>
          <div className="gallery-doc-example-stage">
            <LevelUp
              celebration
              description="Your dedication is paying off."
              heading="Level up!"
              newLevel={{ label: "Level", value: 6 }}
              previousLevel={{ label: "Level", value: 5 }}
              primaryAction={<Button>Continue learning</Button>}
              rewardsHeading="Rewards"
              size="compact"
            />
          </div>
        </article>

        <article
          aria-labelledby="reward-received"
          className="gallery-doc-example-card"
        >
          <h3 id="reward-received">Reward Received</h3>
          <p>
            Display supplied reward details and an explicit follow-up action.
          </p>
          <div className="gallery-doc-example-stage">
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

        <article
          aria-labelledby="progress-summary"
          className="gallery-doc-example-card"
        >
          <h3 id="progress-summary">Progress Summary</h3>
          <p>Compose a study overview from caller-supplied metric values.</p>
          <div className="gallery-doc-example-stage">
            <ProgressSummary
              display="ring"
              metrics={[
                {
                  id: "lessons",
                  label: "Lessons completed",
                  max: 16,
                  value: 11,
                  valueLabel: "11 of 16",
                },
                {
                  id: "vocabulary",
                  label: "Vocabulary reviewed",
                  max: 100,
                  value: 72,
                  valueLabel: "72%",
                },
                {
                  id: "practice",
                  label: "Practice sessions",
                  max: 20,
                  value: 14,
                  valueLabel: "14 of 20",
                },
              ]}
              title="Study progress"
            />
          </div>
        </article>

        <article
          aria-labelledby="daily-goal-completed"
          className="gallery-doc-example-card"
        >
          <h3 id="daily-goal-completed">Daily Goal Completed</h3>
          <p>
            Render caller-confirmed completion and supplied semantic rewards.
          </p>
          <div className="gallery-doc-example-stage">
            <DailyGoalCompleted
              completionLabel="Goal completed"
              description="Your steady practice is building a strong habit."
              goal={{
                description: "Words practiced in today's study session.",
                label: "Practice 20 words",
                max: 20,
                value: 20,
                valueLabel: "20 of 20",
              }}
              heading="Daily goal complete"
              primaryAction={<Button>Continue learning</Button>}
              rewards={[
                {
                  category: "xp",
                  label: "Experience points",
                  state: "earned",
                  value: "+50 XP",
                },
                {
                  category: "streak",
                  label: "Learning streak",
                  state: "earned",
                  value: "7 days",
                },
              ]}
            />
          </div>
        </article>
      </div>
    </>
  );
}
