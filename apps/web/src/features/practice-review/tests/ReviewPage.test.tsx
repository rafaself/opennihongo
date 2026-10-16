import "../../../views/practice/tests/practiceTestHelpers";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { expect, it, vi } from "vitest";
import type { LearningHistory } from "@opennihongo/persistence";
import { router } from "../../../app/router";
const load = vi.hoisted(() => vi.fn<() => Promise<LearningHistory>>());
vi.mock("@opennihongo/persistence", () => ({
  loadLearningHistory: load,
  appendLearningRecord: vi.fn().mockResolvedValue(undefined),
}));
const history: LearningHistory = {
  baselines: [],
  records: ["hiragana.basic.あ", "hiragana.basic.い"].map((id, index) => ({
    id: `r${String(index)}`,
    sessionId: "s",
    profileId: "kana.practice.reading",
    occurredAt: "2026-10-03T12:00:00Z",
    result: {
      exerciseId: `e${String(index)}`,
      attempts: 1,
      outcome: "incorrect",
      sourceItemResults: [{ sourceItemId: id, outcome: "incorrect" }],
    },
    evidence: {
      exerciseType: "typed-answer",
      items: [
        {
          sourceItemId: id,
          response: index === 0 ? "answered" : "skipped",
          assistance: "none",
        },
      ],
    },
  })),
};
it("loads saved evidence and preserves selected review items when the page remounts", async () => {
  load.mockResolvedValue(history);
  const user = userEvent.setup();
  const view = render(<RouterProvider router={router} />);
  await router.navigate({ to: "/practice/review" });
  expect(await screen.findByText("Latest reading was incorrect")).toBeTruthy();
  expect(document.title).toBe("Review saved readings · OpenNihongo");
  expect(screen.getByText("Skipped on the latest reading")).toBeTruthy();
  const second = screen.getAllByRole("checkbox")[1];
  if (!second) throw new Error("Expected second reading");
  await user.click(second);
  const first = screen.getAllByRole("checkbox")[0];
  if (!first) throw new Error("Expected first reading");
  await user.click(first);
  expect(
    screen.getByRole("button", { name: "Practise selected Kana (0)" }),
  ).toHaveProperty("disabled", true);
  await user.click(first);
  const savedSearch = router.state.location.search;
  view.unmount();
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/practice/review", search: savedSearch });
  await screen.findByText("Latest reading was incorrect");
  expect(
    screen.getAllByRole<HTMLInputElement>("checkbox").map((box) => box.checked),
  ).toEqual([true, false]);
  await user.click(
    screen.getByRole("button", { name: "Practise selected Kana (1)" }),
  );
  expect((await screen.findByRole("textbox")).getAttribute("aria-label")).toBe(
    "Type the romaji reading for あ",
  );
});
it("offers a retry after a history read failure", async () => {
  load
    .mockRejectedValueOnce(new Error("Storage unavailable"))
    .mockResolvedValueOnce({ records: [], baselines: [] });
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/practice/review" });
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Saved readings could not be loaded",
  );
  await user.click(screen.getByRole("button", { name: "Retry loading" }));
  expect(await screen.findByText("No readings to review yet")).toBeTruthy();
});

it("shows historical Kanji evidence and starts only the selected reading", async () => {
  const id = "kanji.character.u4e00";
  load.mockResolvedValue({
    baselines: [],
    records: [
      {
        id: "kanji-old",
        sessionId: "s",
        profileId: "kanji.practice.reading",
        occurredAt: "2026-10-03T12:00:00Z",
        result: {
          exerciseId: "e",
          attempts: 0,
          outcome: "incorrect",
          sourceItemResults: [{ sourceItemId: id, outcome: "incorrect" }],
        },
      },
    ],
  });
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/practice/review" });
  expect(
    await screen.findByText(
      "Historical incorrect result · skip and help details unavailable",
    ),
  ).toBeTruthy();
  await user.click(
    screen.getByRole("button", { name: "Practise selected Kanji (1)" }),
  );
  const input = await screen.findByRole("textbox");
  expect(input.getAttribute("aria-label")).toBe(
    "Type the Kana or romaji reading for 一つ",
  );
  await user.type(input, "hitotsu");
  await user.keyboard("{Enter}");
  expect(
    screen.getByText(
      "一つ is read ひとつ and means one item. Keep this whole-word reading together with its meaning.",
    ),
  ).toBeTruthy();
});

it("starts a five-vowel beginner session directly from Practice", async () => {
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/practice" });
  await user.click(
    await screen.findByRole("link", { name: "Start vowel reading" }),
  );
  await screen.findByRole("textbox");
  expect(screen.getByText("1/5")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Show hint" })).toBeTruthy();
  expect(router.state.location.search.characterIds).toEqual([
    "hiragana.basic.あ",
    "hiragana.basic.い",
    "hiragana.basic.う",
    "hiragana.basic.え",
    "hiragana.basic.お",
  ]);
});
