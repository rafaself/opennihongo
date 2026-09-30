import { Button, Radio, RadioGroup, Switch, Text } from "@opennihongo/ui";
import { Icon } from "@opennihongo/ui/icons";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PracticeView } from "../../views/practice/PracticeView";
import { getKanaPracticeItemCount } from "../../views/practice/session/kanaPracticeContent";
import { kanaCharacterCharts } from "@opennihongo/content";
import "./kanaQuizSetup.css";

export function KanaQuizPage() {
  const search = useSearch({ from: "/practice/kana/quiz" });
  const navigate = useNavigate({ from: "/practice/kana/quiz" });
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!started) document.getElementById("kana-quiz-setup-title")?.focus();
  }, [started]);
  if (started)
    return (
      <PracticeView
        {...search}
        mode="quiz"
        key={`${search.script}:${search.category}:${search.direction}:${String(search.fast)}`}
        onChangeOptions={() => {
          setStarted(false);
        }}
      />
    );
  return (
    <section
      className="practice-session"
      aria-labelledby="kana-quiz-setup-title"
    >
      <header className="practice-session__header">
        <Link
          aria-label="Leave practice"
          className="practice-session__exit"
          to="/practice"
          search={{ script: search.script, category: search.category }}
        >
          <Icon name="close" />
        </Link>
      </header>
      <div className="practice-session__body">
        <div className="kana-quiz-setup">
          <Text
            as="h1"
            id="kana-quiz-setup-title"
            tabIndex={-1}
            variant="display"
          >
            Set up your Kana quiz
          </Text>
          <p>
            {search.script === "hiragana" ? "Hiragana" : "Katakana"} ·{" "}
            {
              kanaCharacterCharts[search.script].sections.find(
                ({ id }) => id === search.category,
              )?.title
            }{" "}
            · {getKanaPracticeItemCount("quiz", search.script, search.category)}{" "}
            questions
          </p>
          <div>
            <h2 id="quiz-direction-label">Question direction</h2>
            <RadioGroup
              aria-labelledby="quiz-direction-label"
              value={search.direction}
              onValueChange={(direction) => {
                void navigate({
                  search: (previous) => ({ ...previous, direction }),
                  replace: true,
                });
              }}
            >
              <Radio value="random" variant="card">
                Random
              </Radio>
              <Radio value="character" variant="card">
                Character → Romaji
              </Radio>
              <Radio value="romaji" variant="card">
                Romaji → Character
              </Radio>
            </RadioGroup>
          </div>
          <div className="kana-quiz-setup__fast">
            <div>
              <label htmlFor="quiz-fast">Fast mode</label>
              <p>Check each choice immediately and move on after one second.</p>
            </div>
            <Switch
              id="quiz-fast"
              checked={search.fast}
              onCheckedChange={(fast) => {
                void navigate({
                  search: (previous) => ({ ...previous, fast }),
                  replace: true,
                });
              }}
            />
          </div>
        </div>
      </div>
      <div className="practice-session__action-slot">
        <footer className="practice-session__actions">
          <div className="practice-session__actions-inner">
            <span>Four choices. One correct answer.</span>
            <Button
              onClick={() => {
                setStarted(true);
              }}
            >
              Start quiz
            </Button>
          </div>
        </footer>
      </div>
    </section>
  );
}
