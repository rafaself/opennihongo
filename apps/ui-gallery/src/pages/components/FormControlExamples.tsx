import { useState } from "react";
import {
  Checkbox,
  FormField,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@opennihongo/ui";

export function FormControlExamples() {
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  return (
    <>
      <article className="gallery-doc-example-card">
        <h3>FormField and Input</h3>
        <p>Labels, helper text, required state, and validation feedback.</p>
        <FormField
          description="Used only as a sample contact address."
          id="email-address"
          label="Email address"
          required
        >
          <Input
            autoComplete="email"
            defaultValue="learner@example.com"
            required
            type="email"
          />
        </FormField>
        <FormField
          error="Enter an address with a valid format."
          id="invalid-email"
          label="Invalid email example"
          required
        >
          <Input defaultValue="not-an-email" required type="email" />
        </FormField>
      </article>

      <article className="gallery-doc-example-card">
        <h3>Textarea</h3>
        <p>Use a multiline control for caller-provided notes or feedback.</p>
        <FormField
          description="This sample text belongs to the page using the control."
          id="session-notes"
          label="Session notes"
        >
          <Textarea defaultValue="Review the long vowel examples." />
        </FormField>
      </article>

      <article className="gallery-doc-example-card">
        <h3>Checkbox selection</h3>
        <p>Checked and disabled states remain available to inspect.</p>
        <FormField
          description="This preference is supplied by the caller."
          id="weekly-progress"
          label="Weekly progress summary"
        >
          <Checkbox defaultChecked />
        </FormField>
        <FormField id="unavailable-summary" label="Unavailable sample option">
          <Checkbox disabled />
        </FormField>
      </article>

      <article className="gallery-doc-example-card">
        <h3 id="study-script-title">RadioGroup selection</h3>
        <p>
          Use Tab to enter the group and arrow keys to change the selection.
        </p>
        <RadioGroup
          aria-labelledby="study-script-title"
          defaultValue="hiragana"
          name="study-script"
        >
          <Radio value="hiragana">Hiragana</Radio>
          <Radio value="katakana">Katakana</Radio>
          <Radio disabled value="romaji">
            Romaji (unavailable)
          </Radio>
        </RadioGroup>
      </article>

      <article className="gallery-doc-example-card">
        <h3>Switch setting</h3>
        <p>Use for a setting that applies immediately when changed.</p>
        <p id="daily-reminders-label">Daily reminders</p>
        <Switch
          aria-labelledby="daily-reminders-label"
          checked={remindersEnabled}
          onCheckedChange={setRemindersEnabled}
        />
        <p aria-label="Reminder setting" aria-live="polite" role="status">
          Daily reminders are {remindersEnabled ? "on" : "off"}.
        </p>
      </article>

      <article className="gallery-doc-example-card">
        <h3>Select menu</h3>
        <p>Open the menu with the keyboard to explore the available options.</p>
        <Select defaultValue="hiragana">
          <FormField
            description="Choose a sample writing system."
            id="writing-system"
            label="Writing system"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          </FormField>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Japanese scripts</SelectLabel>
              <SelectItem value="hiragana">Hiragana</SelectItem>
              <SelectItem value="katakana">Katakana</SelectItem>
              <SelectItem value="kanji">Kanji</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </article>
    </>
  );
}
