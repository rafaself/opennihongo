import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Radio } from "./Radio";
import { RadioGroup } from "./RadioGroup";

describe("RadioGroup", () => {
  it("names the group and moves selection with arrow keys, skipping disabled options", async () => {
    const user = userEvent.setup();

    render(
      <section>
        <h2 id="study-mode">Study mode</h2>
        <RadioGroup aria-labelledby="study-mode" defaultValue="hiragana">
          <Radio value="hiragana">Hiragana</Radio>
          <Radio disabled value="kanji">
            Kanji
          </Radio>
          <Radio value="katakana">Katakana</Radio>
        </RadioGroup>
      </section>,
    );

    const group = screen.getByRole("radiogroup", { name: "Study mode" });
    const hiragana = screen.getByRole("radio", { name: "Hiragana" });
    const kanji = screen.getByRole("radio", { name: "Kanji" });
    const katakana = screen.getByRole("radio", { name: "Katakana" });

    expect(group).toHaveAccessibleName("Study mode");
    expect(hiragana).toBeChecked();
    expect(kanji).toBeDisabled();
    expect(katakana).not.toBeChecked();

    await user.tab();
    expect(hiragana).toHaveFocus();

    await user.keyboard("{ArrowDown>}");
    await waitFor(() => expect(katakana).toBeChecked());
    await user.keyboard("{/ArrowDown}");

    expect(katakana).toHaveFocus();
    expect(katakana).toBeChecked();
    expect(hiragana).not.toBeChecked();
    expect(kanji).not.toBeChecked();
  });
});
