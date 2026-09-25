import { Button, DailyGoalCompleted } from "@opennihongo/ui";
import { GalleryDocumentationPage } from "../layouts/GalleryDocumentationPage";

const example = (
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
);

export function DailyGoalCompletedPage() {
  return (
    <GalleryDocumentationPage
      examples={example}
      eyebrow="Patterns / Daily Goal Completed"
      guidance={[
        {
          title: "Render after caller-confirmed completion",
          content: (
            <p>
              Decide in the owning feature when the daily goal is complete. The
              pattern displays the completion label and progress exactly as
              supplied; it does not compare values or update a goal.
            </p>
          ),
        },
        {
          title: "Keep rewards and actions explicit",
          content: (
            <p>
              Supply each reward's category, label, value, and state. Pass
              actions as controls or links so their behavior remains with the
              caller.
            </p>
          ),
        },
      ]}
      id="daily-goal-completed"
      notes={[
        {
          title: "Import",
          content: (
            <p>
              <code>@opennihongo/ui</code>
            </p>
          ),
        },
        {
          title: "Motion",
          content: (
            <p>
              Celebration is optional and automatically suppressed when reduced
              motion is requested.
            </p>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Provide localized completion, goal, and reward labels.",
          "Include a clear next action for the learner.",
        ],
        dontItems: [
          "Use displayed progress to infer completion in this presentation.",
          "Calculate, grant, or persist rewards in the shared UI package.",
        ],
      }}
      summary="A caller-controlled completion presentation for a daily goal, its progress and rewards, and a clear next action."
      title="Daily Goal Completed"
    />
  );
}
