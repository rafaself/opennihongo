import { useState } from "react";
import {
  ActionCard,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Text,
} from "@opennihongo/ui";

export function ActionsExamples() {
  const [announcement, setAnnouncement] = useState("");
  const [chosenOption, setChosenOption] = useState("");

  return (
    <>
      <article className="gallery-doc-example-card">
        <h3>Button priority and availability</h3>
        <p>
          Use a primary action for the next step, a secondary action for an
          alternative, and disabled when the action is unavailable.
        </p>
        <div className="gallery-doc-example-stage">
          <div className="gallery-doc-action-stack">
            <Button
              onClick={() => {
                setAnnouncement("Continue lesson selected.");
              }}
            >
              Continue lesson
            </Button>
            <Button variant="secondary">Review vocabulary</Button>
            <Button disabled>Complete previous step</Button>
          </div>
        </div>
        {announcement && (
          <p aria-label="Action feedback" role="status">
            {announcement}
          </p>
        )}
      </article>

      <article className="gallery-doc-example-card">
        <h3>Icon-only action</h3>
        <p>The required accessible name describes the action without text.</p>
        <div className="gallery-doc-example-stage">
          <IconButton
            aria-label="Bookmark lesson"
            icon="star"
            onClick={() => {
              setAnnouncement("Lesson bookmarked.");
            }}
          />
        </div>
      </article>

      <article className="gallery-doc-example-card gallery-doc-example-card--wide">
        <h3>Full-card choices</h3>
        <p>
          Give a large action a clear title, a short detail, and optional
          decorative media. Use a link when the card navigates.
        </p>
        <div className="gallery-doc-example-stage">
          <Grid
            aria-label="Study options"
            className="gallery-action-card-grid"
            columns={3}
            gap="3"
            role="group"
          >
            <ActionCard
              description="Build a foundation for reading."
              media={
                <Text aria-hidden="true" as="span" variant="display">
                  あ
                </Text>
              }
              onClick={() => {
                setChosenOption("Hiragana");
              }}
              title="Hiragana"
            />
            <ActionCard
              description="Practice alternate syllable forms."
              media={
                <Text aria-hidden="true" as="span" variant="display">
                  ア
                </Text>
              }
              onClick={() => {
                setChosenOption("Katakana");
              }}
              title="Katakana"
            />
            <ActionCard
              description="Study characters in context."
              media={
                <Text aria-hidden="true" as="span" variant="display">
                  字
                </Text>
              }
              onClick={() => {
                setChosenOption("Kanji");
              }}
              title="Kanji"
            />
          </Grid>
        </div>
        {chosenOption && (
          <p aria-live="polite" role="status">
            {chosenOption} selected.
          </p>
        )}
      </article>

      <PreferencesExample />
    </>
  );
}

function PreferencesExample() {
  return (
    <article className="gallery-doc-example-card gallery-doc-example-card--wide">
      <h3>Preferences panel</h3>
      <p>
        Group related settings, align immediate controls with their labels, and
        use radio cards for persistent single-choice preferences.
      </p>
      <div className="gallery-doc-example-stage">
        <Card
          aria-labelledby="account-preferences-heading"
          as="section"
          className="gallery-preferences-panel"
        >
          <h4 id="account-preferences-heading">Account preferences</h4>
          <section
            aria-labelledby="experience-preferences-heading"
            className="gallery-preference-section"
          >
            <h5 id="experience-preferences-heading">Experience</h5>
            <div className="gallery-preference-row">
              <div className="gallery-preference-copy">
                <Text as="span" id="sound-effects-label" variant="label">
                  Sound effects
                </Text>
                <Text
                  as="span"
                  color="secondary"
                  id="sound-effects-description"
                  variant="caption"
                >
                  Play audio feedback while studying.
                </Text>
              </div>
              <Switch
                aria-describedby="sound-effects-description"
                aria-labelledby="sound-effects-label"
                defaultChecked
              />
            </div>
          </section>

          <Divider decorative />

          <section
            aria-labelledby="appearance-preferences-heading"
            className="gallery-preference-section"
          >
            <h5 id="appearance-preferences-heading">Visual</h5>
            <div className="gallery-preference-row gallery-preference-row--stacked">
              <div className="gallery-preference-copy">
                <Text as="span" id="dark-mode-label" variant="label">
                  Dark mode
                </Text>
                <Text
                  as="span"
                  color="secondary"
                  id="dark-mode-description"
                  variant="caption"
                >
                  Follow your device setting or choose a theme.
                </Text>
              </div>
              <Select defaultValue="system">
                <SelectTrigger
                  aria-describedby="dark-mode-description"
                  aria-labelledby="dark-mode-label"
                  className="gallery-preference-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System default</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <Divider decorative />

          <section
            aria-labelledby="japanese-preferences-heading"
            className="gallery-preference-section"
          >
            <h5 id="japanese-preferences-heading">Japanese</h5>
            <div className="gallery-preference-row">
              <div className="gallery-preference-copy">
                <Text as="span" id="pronunciation-label" variant="label">
                  Show pronunciation
                </Text>
                <Text
                  as="span"
                  color="secondary"
                  id="pronunciation-description"
                  variant="caption"
                >
                  Choose how pronunciation appears with new words.
                </Text>
              </div>
              <Switch
                aria-describedby="pronunciation-description"
                aria-labelledby="pronunciation-label"
                defaultChecked
              />
            </div>
            <div className="gallery-preference-choice">
              <Text as="span" id="pronunciation-format-label" variant="label">
                Pronunciation format
              </Text>
              <RadioGroup
                aria-labelledby="pronunciation-format-label"
                className="gallery-preference-radio-group"
                defaultValue="romanized"
                name="pronunciation-format"
                orientation="horizontal"
              >
                <Radio
                  aria-label="Romanized Japanese pronunciation"
                  value="romanized"
                  variant="card"
                >
                  <Text as="span" color="secondary" variant="caption">
                    ni hon go
                  </Text>
                  <Text as="span" lang="ja" variant="display">
                    日本語
                  </Text>
                  <Text as="span" variant="label">
                    Romanized
                  </Text>
                </Radio>
                <Radio
                  aria-label="Japanese pronunciation"
                  value="japanese"
                  variant="card"
                >
                  <Text as="span" color="secondary" variant="caption">
                    に ほん ご
                  </Text>
                  <Text as="span" lang="ja" variant="display">
                    日本語
                  </Text>
                  <Text as="span" variant="label">
                    Japanese
                  </Text>
                </Radio>
              </RadioGroup>
            </div>
          </section>
        </Card>
      </div>
    </article>
  );
}
