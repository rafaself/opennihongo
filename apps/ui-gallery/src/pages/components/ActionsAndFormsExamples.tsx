import { useState } from "react";
import { ActionsExamples } from "./ActionsExamples";
import { FormControlExamples } from "./FormControlExamples";

const themes = [
  { value: "light", label: "Light theme" },
  { value: "dark", label: "Dark theme" },
] as const;

type Theme = (typeof themes)[number]["value"];

export function ActionsAndFormsExamples() {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <>
      <fieldset>
        <legend>Control preview theme</legend>
        {themes.map(({ value, label }) => (
          <label key={value}>
            <input
              checked={theme === value}
              name="actions-and-forms-theme"
              onChange={() => {
                setTheme(value);
              }}
              type="radio"
              value={value}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <div data-theme={theme}>
        <div className="gallery-doc-example-grid">
          <ActionsExamples />
          <FormControlExamples />
        </div>
      </div>
    </>
  );
}
