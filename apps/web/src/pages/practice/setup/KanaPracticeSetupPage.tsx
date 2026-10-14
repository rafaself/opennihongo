import { kanaPracticeGames, type KanaPracticeGame } from "@opennihongo/content";
import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { NotFoundPage } from "../../NotFoundPage";
import { KanaCharacterSelection } from "./KanaCharacterSelection";
import { KanaSetupOptions, type KanaSetupChange } from "./KanaSetupOptions";
import { KanaSetupSummary } from "./KanaSetupSummary";
import "../../../views/practice/layout/practiceSetup.css";

function isGame(value: string): value is KanaPracticeGame {
  return (
    value === "reading" ||
    value === "matching" ||
    value === "quiz" ||
    value === "cards"
  );
}

export function KanaPracticeSetupPage() {
  const { game } = useParams({ from: "/practice/kana/$game/setup" });
  return isGame(game) ? <KanaSetup game={game} /> : <NotFoundPage />;
}

function KanaSetup({ game }: { game: KanaPracticeGame }) {
  const search = useSearch({ from: "/practice/kana/$game/setup" });
  const navigate = useNavigate({ from: "/practice/kana/$game/setup" });
  const onChange: KanaSetupChange = (change) => {
    void navigate({ search: change, replace: true, resetScroll: false });
  };
  return (
    <section className="practice-setup" aria-labelledby="practice-setup-title">
      <header className="practice-setup__header">
        <Link to="/practice" search={search} className="practice-setup__back">
          ← Back to Practice
        </Link>
        <p className="practice-hub__eyebrow">Your practice, your pace</p>
        <h1 id="practice-setup-title">
          Set up {kanaPracticeGames[game].title}
        </h1>
        <p>
          {kanaPracticeGames[game].description} Choose what you want to work on
          today.
        </p>
      </header>
      <div className="practice-setup__layout">
        <div className="practice-setup__form">
          <KanaSetupOptions game={game} search={search} onChange={onChange} />
          <KanaCharacterSelection search={search} onChange={onChange} />
        </div>
        <KanaSetupSummary
          game={game}
          search={search}
          onStart={() => {
            void navigate({
              to:
                game === "cards"
                  ? "/practice/kana/cards"
                  : game === "quiz"
                    ? "/practice/kana/quiz"
                    : game === "matching"
                      ? "/practice/kana/matching"
                      : "/practice/kana/reading",
              search,
            });
          }}
        />
      </div>
    </section>
  );
}
