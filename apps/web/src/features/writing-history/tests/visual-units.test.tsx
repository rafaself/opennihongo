import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  getWritingHistoryChapter,
  type HistoryUnit,
} from "@opennihongo/content";
import { HistoryUnitView } from "../components/HistoryUnitView";

afterEach(cleanup);
function unit(chapter: string, kind: HistoryUnit["kind"]) {
  const result = getWritingHistoryChapter(chapter)?.units.find(
    (entry) => entry.kind === kind,
  );
  if (!result) throw new Error(`Missing ${kind} in ${chapter}`);
  return result;
}
describe("history visual explanations", () => {
  it("explores all eight hiragana origins while keeping focus on the choices", async () => {
    const user = userEvent.setup();
    render(<HistoryUnitView unit={unit("hiragana", "character-comparison")} />);
    expect(screen.getAllByRole("radio")).toHaveLength(8);
    const examples = [
      ["あ", "a", "安"],
      ["い", "i", "以"],
      ["う", "u", "宇"],
      ["え", "e", "衣"],
      ["お", "o", "於"],
      ["か", "ka", "加"],
      ["さ", "sa", "左"],
      ["と", "to", "止"],
    ] as const;
    for (const [glyph, reading, source] of examples) {
      const choice = screen.getByRole("radio", {
        name: `${glyph} /${reading}/`,
      });
      await user.click(choice);
      const comparison = within(
        screen.getByRole("group", { name: "Character comparison" }),
      );
      expect(comparison.getByText(source, { exact: true })).toBeTruthy();
      expect(comparison.getByText(glyph, { exact: true })).toBeTruthy();
      expect(document.activeElement).toBe(choice);
    }
    await user.keyboard("{ArrowLeft>}");
    await waitFor(() => {
      expect(
        screen
          .getByRole("radio", { name: "さ /sa/" })
          .getAttribute("aria-checked"),
      ).toBe("true");
    });
    await user.keyboard("{/ArrowLeft}");
    expect(screen.getByText("左", { exact: true })).toBeTruthy();
  });
  it("compares kana source characters and component explanations", async () => {
    const user = userEvent.setup();
    render(<HistoryUnitView unit={unit("katakana", "character-comparison")} />);
    expect(screen.getByText("阿", { exact: true })).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: "カ /ka/" }));
    expect(screen.getByText("加", { exact: true })).toBeTruthy();
    expect(screen.getByText(/left-hand portion/)).toBeTruthy();
    expect(screen.getByText(/not a reconstruction/)).toBeTruthy();
  });
  it("switches between meaning and phonetic use without treating it as an answer", async () => {
    const user = userEvent.setup();
    render(
      <HistoryUnitView unit={unit("manyogana", "character-comparison")} />,
    );
    expect(screen.getByText("peace or ease")).toBeTruthy();
    await user.click(screen.getByRole("radio", { name: "Sound" }));
    expect(screen.getByText("/a/", { exact: true })).toBeTruthy();
    expect(
      screen.getByText(/not its usual modern dictionary reading/),
    ).toBeTruthy();
  });
  it("highlights script roles and explains long-vowel marks independently", async () => {
    const user = userEvent.setup();
    render(
      <HistoryUnitView unit={unit("multiple-scripts", "script-example")} />,
    );
    await user.click(screen.getByRole("radio", { name: "Katakana" }));
    expect(screen.getByLabelText("Japanese example").textContent).toBe(
      "私はコーヒーを飲みます。",
    );
    expect(screen.getByText(/not a separate katakana syllable/)).toBeTruthy();
    expect(screen.getAllByText(/katakana spelling/).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("radio", { name: "Hiragana" }));
    expect(screen.getByText("Hiragana completing the verb form.")).toBeTruthy();
  });
  it("renders source provenance and accessible diagram relationships", async () => {
    const user = userEvent.setup();
    render(<HistoryUnitView unit={unit("modern-writing", "diagram")} />);
    expect(
      screen.getByRole("img", {
        name: "A branching history, a shared present",
      }),
    ).toBeTruthy();
    await user.click(screen.getByText("Explore the diagram connections"));
    expect(
      screen.getByRole("list", { name: "Historical connections" }),
    ).toBeTruthy();
    expect(
      screen.getByText("Continuing kanji use", { selector: "h3" }),
    ).toBeTruthy();
    await user.click(screen.getByText("Sources and notes"));
    expect(
      screen
        .getByRole("link", { name: /Braille textbook/ })
        .getAttribute("href"),
    ).toContain("mext.go.jp");
  });
});
