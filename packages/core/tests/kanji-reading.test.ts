import { describe, expect, it } from "vitest";
import { normalizeJapaneseReading } from "../src/index";

describe("Japanese reading answers", () => {
  it("normalizes whitespace, width, case, and equivalent Kana scripts", () => {
    expect(normalizeJapaneseReading("  ヒトツ　")).toBe("ひとつ");
    expect(normalizeJapaneseReading("ﾐｯﾂ")).toBe("みっつ");
    expect(normalizeJapaneseReading(" ＨＩＴＯＴＳＵ ")).toBe("hitotsu");
    expect(normalizeJapaneseReading("  ")).toBe("");
  });
  it("preserves long vowels, small Kana, and voiced sounds", () => {
    expect(normalizeJapaneseReading("とおか")).not.toBe(
      normalizeJapaneseReading("とか"),
    );
    expect(normalizeJapaneseReading("みっつ")).not.toBe(
      normalizeJapaneseReading("みつ"),
    );
    expect(normalizeJapaneseReading("みず")).not.toBe(
      normalizeJapaneseReading("みす"),
    );
    expect(normalizeJapaneseReading("tōka")).not.toBe(
      normalizeJapaneseReading("toka"),
    );
  });
});
