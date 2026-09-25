import { GamificationAchievementExamples } from "./GamificationAchievementExamples";
import { GamificationCelebrationExamples } from "./GamificationCelebrationExamples";
import { GamificationProgressionExamples } from "./GamificationProgressionExamples";

export function GamificationExamples() {
  return (
    <div className="gallery-gamification-examples">
      <nav aria-label="Gamification catalog index">
        <ul>
          <li>
            <a href="#gamification-progression">XP, levels, and streaks</a>
          </li>
          <li>
            <a href="#gamification-achievements">
              Achievements, rewards, quests, and leaderboard
            </a>
          </li>
          <li>
            <a href="#gamification-celebration">Celebration patterns</a>
          </li>
        </ul>
      </nav>
      <section aria-labelledby="gamification-progression">
        <h3 id="gamification-progression">XP, levels, and streaks</h3>
        <GamificationProgressionExamples />
      </section>
      <section aria-labelledby="gamification-achievements">
        <h3 id="gamification-achievements">
          Achievements, rewards, quests, and leaderboard
        </h3>
        <GamificationAchievementExamples />
      </section>
      <section aria-labelledby="gamification-celebration">
        <h3 id="gamification-celebration">Celebration patterns</h3>
        <GamificationCelebrationExamples />
      </section>
    </div>
  );
}
