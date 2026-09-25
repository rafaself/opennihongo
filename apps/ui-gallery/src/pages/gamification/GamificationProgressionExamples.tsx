import {
  Button,
  LevelBadge,
  LevelUp,
  Progress,
  ProgressRing,
  ProgressSummary,
  Streak,
  XPBar,
} from "@opennihongo/ui";

export function GamificationProgressionExamples() {
  return (
    <div className="gallery-gamification-cards">
      <article className="gallery-doc-example-card">
        <h3>Experience points</h3>
        <p>Show the XP range supplied by the caller.</p>
        <div className="gallery-gamification-stage">
          <XPBar
            aria-label="XP to next level"
            current={450}
            target={600}
            text="450 of 600 XP"
          />
        </div>
      </article>
      <article className="gallery-doc-example-card">
        <h3>Progress</h3>
        <p>Use a named determinate range for caller-provided progress.</p>
        <div className="gallery-gamification-stage">
          <Progress aria-label="Course sections completed" max={12} value={8} />
        </div>
      </article>
      <article className="gallery-doc-example-card">
        <h3>Circular progress</h3>
        <p>Pair a progress ring with a caller-supplied value label.</p>
        <div className="gallery-gamification-stage">
          <ProgressRing aria-label="Course completion" value={72}>
            72%
          </ProgressRing>
        </div>
      </article>
      <article className="gallery-doc-example-card">
        <h3>Level</h3>
        <p>Present a supplied level and optional caller-chosen tier.</p>
        <div className="gallery-gamification-stage">
          <LevelBadge
            label="Level"
            tier={{ label: "Gold", variant: "warning" }}
            value={12}
          />
        </div>
      </article>
      <article className="gallery-doc-example-card">
        <h3>Streak</h3>
        <p>The visible state label keeps meaning clear without color.</p>
        <div className="gallery-gamification-stage">
          <Streak count={12} label="Current streak" state="active" />
        </div>
      </article>
      <article className="gallery-doc-example-card gallery-gamification-card--wide">
        <h3>Level transition</h3>
        <p>Supply both level values and an optional semantic reward.</p>
        <div className="gallery-gamification-stage">
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
      <article className="gallery-doc-example-card gallery-gamification-card--wide">
        <h3>Progress summary</h3>
        <p>Compose a summary from static example metrics supplied here.</p>
        <div className="gallery-gamification-stage">
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
    </div>
  );
}
