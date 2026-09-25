import { Link } from "@tanstack/react-router";
import { GamificationExamples } from "./GamificationExamples";
import { GalleryDocumentationPage } from "../../layouts/GalleryDocumentationPage";
import "./GamificationPage.css";

export function GamificationPage() {
  return (
    <GalleryDocumentationPage
      examples={<GamificationExamples />}
      eyebrow="Gamification / Catalog"
      guidance={[
        {
          title: "Keep sample state caller-owned",
          content: (
            <p>
              These static examples demonstrate public component inputs. The
              product feature decides progression, completion, eligibility,
              reward grants, ordering, and persistence.
            </p>
          ),
        },
        {
          title: "Use semantic reward categories",
          content: (
            <p>
              Supply <code>xp</code>, <code>streak</code>, or{" "}
              <code>achievement</code> to select their shared semantic accents.
              Keep the visible category and state labels so meaning does not
              depend on color alone.
            </p>
          ),
        },
        {
          title: "Preserve reduced-motion behavior",
          content: (
            <p>
              Celebration effects are optional and respect the viewer's system
              preference. Their headings, values, rewards, and actions remain
              visible without motion; compare the reduced-motion preview on the{" "}
              <Link to="/foundations/motion">Motion page</Link>.
            </p>
          ),
        },
      ]}
      id="gamification"
      notes={[
        {
          title: "Public imports",
          content: (
            <p>
              All examples consume components from <code>@opennihongo/ui</code>.
              They do not import web features or package internals.
            </p>
          ),
        },
        {
          title: "Component coverage",
          content: (
            <p>
              The examples include XPBar, Progress, ProgressRing, LevelBadge,
              LevelUp, Streak, Achievement, AchievementUnlocked, RewardCard,
              RewardReceived, QuestCard, LeaderboardItem, ProgressSummary,
              Celebration, LessonCompleted, and DailyGoalCompleted.
            </p>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Pass localized labels and caller-confirmed sample values.",
          "Use the component whose visible state matches the supplied data.",
        ],
        dontItems: [
          "Infer game rules from displayed values or progress bars.",
          "Calculate, grant, sort, or persist sample rewards in the gallery.",
        ],
      }}
      summary="Browse the public progression, achievement, reward, quest, leaderboard, and celebration components with static caller-supplied examples. The catalog documents presentation APIs without simulating learner progress or product rules."
      title="Gamification"
    />
  );
}
