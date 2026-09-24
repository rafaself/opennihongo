import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

describe("Tabs", () => {
  it("moves selection with arrow keys and exposes the matching panel", async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="kana">
        <TabsList aria-label="Study content">
          <TabsTrigger value="kana">Kana</TabsTrigger>
          <TabsTrigger value="kanji">Kanji</TabsTrigger>
          <TabsTrigger value="grammar">Grammar</TabsTrigger>
        </TabsList>
        <TabsContent value="kana">Kana lessons</TabsContent>
        <TabsContent value="kanji">Kanji lessons</TabsContent>
        <TabsContent value="grammar">Grammar lessons</TabsContent>
      </Tabs>,
    );

    const kanaTab = screen.getByRole("tab", { name: "Kana" });
    const kanjiTab = screen.getByRole("tab", { name: "Kanji" });

    expect(
      screen.getByRole("tablist", { name: "Study content" }),
    ).toBeVisible();
    expect(kanaTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Kana" })).toHaveTextContent(
      "Kana lessons",
    );

    await user.tab();
    expect(kanaTab).toHaveFocus();
    await user.keyboard("{ArrowRight}");

    await waitFor(() =>
      expect(kanjiTab).toHaveAttribute("aria-selected", "true"),
    );

    const kanjiPanel = screen.getByRole("tabpanel", { name: "Kanji" });
    expect(kanjiPanel).toHaveTextContent("Kanji lessons");
    expect(kanjiPanel).toHaveAttribute("aria-labelledby", kanjiTab.id);
    expect(kanjiTab).toHaveAttribute("aria-controls", kanjiPanel.id);
  });
});
