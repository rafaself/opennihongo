import {
  Button,
  Celebration,
  DailyGoalCompleted,
  LessonCompleted,
} from "@opennihongo/ui";

export function GamificationCelebrationExamples() {
  return (
    <div className="gallery-gamification-cards">
      <article className="gallery-doc-example-card">
        <h3>Celebration</h3>
        <p>Compare a brief emphasis with its reduced-motion presentation.</p>
        <div className="gallery-gamification-celebration-pair">
          <div className="gallery-gamification-stage">
            <Celebration active>
              <span className="gallery-gamification-milestone">
                <span aria-hidden="true">✓</span>
                <span>Lesson complete</span>
              </span>
            </Celebration>
          </div>
          <section
            aria-label="Reduced-motion preview"
            className="gallery-gamification-stage gallery-gamification-reduced-motion"
          >
            <Celebration active>
              <span className="gallery-gamification-milestone">
                <span aria-hidden="true">✓</span>
                <span>Lesson complete</span>
              </span>
            </Celebration>
          </section>
        </div>
      </article>
      <article className="gallery-doc-example-card gallery-gamification-card--wide">
        <h3>Lesson completed</h3>
        <p>
          Completion content, progress, reward, and actions are caller supplied.
        </p>
        <div className="gallery-gamification-stage">
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
      <article className="gallery-doc-example-card gallery-gamification-card--wide">
        <h3>Daily goal completed</h3>
        <p>
          Render a caller-confirmed goal state and supplied semantic rewards.
        </p>
        <div className="gallery-gamification-stage">
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
  );
}
