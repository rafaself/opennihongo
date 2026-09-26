import { QuestList } from "@opennihongo/ui";

export function GamificationQuestListExample() {
  return (
    <article className="gallery-doc-example-card gallery-gamification-card--wide">
      <h3>Daily quest list</h3>
      <p>
        Group short quests with supplied progress, artwork, rewards, and time
        remaining.
      </p>
      <div className="gallery-gamification-stage">
        <QuestList
          headingLevel={4}
          items={[
            {
              id: "xp",
              icon: <span>⚡</span>,
              title: "Ganhe 50 XP",
              progress: 0,
              goal: 50,
              reward: { icon: <span>🎁</span>, label: "Recompensa de XP" },
            },
            {
              id: "accuracy",
              icon: <span>🎯</span>,
              title: "Consiga 90% ou mais de acertos em 3 lições",
              progress: 1,
              goal: 3,
              reward: { icon: <span>🎁</span>, label: "Recompensa de acertos" },
            },
            {
              id: "streak",
              icon: <span>✨</span>,
              title: "Acerte 10 exercícios seguidos em 4 lições",
              progress: 4,
              goal: 4,
              reward: {
                icon: <span>🎁</span>,
                label: "Recompensa de sequência",
              },
            },
          ]}
          remainingTime="58 minutos"
          title="Missões do dia"
        />
      </div>
    </article>
  );
}
