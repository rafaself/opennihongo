import {
  kanjiPracticeGames,
  type KanjiPracticeGame,
} from "@opennihongo/content";
import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { NotFoundPage } from "../../NotFoundPage";
import { normalizeKanjiSearch } from "../../../features/kanji/session/options";
import {
  KanjiSetupOptions,
  type KanjiSetupChange,
} from "../../../features/kanji/setup/KanjiSetupOptions";
import { KanjiSelection } from "../../../features/kanji/setup/KanjiSelection";
import { KanjiSetupSummary } from "../../../features/kanji/setup/KanjiSetupSummary";
import "../../../views/practice/layout/practiceSetup.css";
import "../../../features/kanji/kanji.css";

function isGame(value: string): value is KanjiPracticeGame {
  return (
    value === "reading" ||
    value === "matching" ||
    value === "quiz" ||
    value === "cards"
  );
}
export function KanjiSetupPage() {
  const { game } = useParams({ from: "/practice/kanji/$game/setup" });
  return isGame(game) ? <KanjiSetup game={game} /> : <NotFoundPage />;
}
function KanjiSetup({ game }: { game: KanjiPracticeGame }) {
  const search = useSearch({ from: "/practice/kanji/$game/setup" });
  const options = normalizeKanjiSearch(search.kanji);
  const navigate = useNavigate({ from: "/practice/kanji/$game/setup" });
  const onChange: KanjiSetupChange = (change) => {
    void navigate({
      search: (previous) => ({
        ...previous,
        kanji: change(normalizeKanjiSearch(previous.kanji)),
      }),
      replace: true,
      resetScroll: false,
    });
  };
  return (
    <section
      className="practice-setup kanji-setup"
      aria-labelledby="kanji-setup-title"
    >
      <header className="practice-setup__header">
        <Link to="/practice" search={search} className="practice-setup__back">
          ← Back to Practice
        </Link>
        <p className="practice-hub__eyebrow">Your practice, your pace</p>
        <h1 id="kanji-setup-title">Set up {kanjiPracticeGames[game].title}</h1>
        <p>
          {kanjiPracticeGames[game].description} Choose what you want to work on
          today.
        </p>
      </header>
      <div className="practice-setup__layout">
        <div className="practice-setup__form">
          <KanjiSetupOptions game={game} search={options} onChange={onChange} />
          <KanjiSelection search={options} onChange={onChange} />
        </div>
        <KanjiSetupSummary
          game={game}
          search={options}
          onStart={() => {
            void navigate({
              to:
                game === "reading"
                  ? "/practice/kanji/reading"
                  : game === "matching"
                    ? "/practice/kanji/matching"
                    : game === "quiz"
                      ? "/practice/kanji/quiz"
                      : "/practice/kanji/cards",
              search: { ...search, kanji: options },
            });
          }}
        />
      </div>
    </section>
  );
}
