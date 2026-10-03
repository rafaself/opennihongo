import { openCards, cardAudio } from "./cardStackTestHelpers";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { router } from "../../../../app/router";

afterEach(() => {
  delete document.documentElement.dataset["motion"];
  vi.unstubAllGlobals();
});

function departingCard() {
  return document.querySelector<HTMLElement>(".card-stack__discard");
}

async function skip() {
  await click(screen.getByRole("button", { name: "Skip" }));
}

async function click(button: HTMLElement) {
  await act(async () => {
    fireEvent.click(button);
    // Let the next card's pronunciation preload resolve before observing it.
    await Promise.resolve();
  });
}

it.each([
  ["Got it", "right"],
  ["Need practice", "left"],
])(
  "discards a card marked %s without duplicating interactive content",
  async (rating, direction) => {
    await openCards();
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Reveal answer" }));
    const answer = screen.getByRole("status").textContent;
    await click(screen.getByRole("button", { name: new RegExp(rating) }));
    const departing = departingCard();
    expect(departing?.textContent).toBe(answer);
    expect(departing?.getAttribute("aria-hidden")).toBe("true");
    expect(departing?.hasAttribute("inert")).toBe(true);
    expect(departing?.dataset["direction"]).toBe(direction);
    expect(
      within(departing as HTMLElement).queryByRole("button", { hidden: true }),
    ).toBeNull();
    expect(
      within(departing as HTMLElement).queryByRole("status", { hidden: true }),
    ).toBeNull();
    expect(screen.getByText("2/4")).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Reveal answer" }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(319);
    });
    expect(departingCard()).toBe(departing);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(departingCard()).toBeNull();
  },
);

it("keeps the newest discard when cards are skipped rapidly and finishes after the last animation", async () => {
  await openCards();
  vi.useFakeTimers();
  await skip();
  const first = departingCard()?.textContent;
  expect(departingCard()?.dataset["direction"]).toBe("down");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(200);
  });
  await skip();
  const second = departingCard()?.textContent;
  expect(second).not.toBe(first);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(120);
  });
  expect(departingCard()?.textContent).toBe(second);
  await skip();
  await skip();
  expect(
    screen.queryByRole("heading", { name: "Practice complete!" }),
  ).toBeNull();
  expect(departingCard()).not.toBeNull();
  expect(screen.queryByRole("button", { name: "Reveal answer" })).toBeNull();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(320);
  });
  expect(screen.getByText("0 / 4")).toBeTruthy();
  expect(screen.getByText(/0 marked for practice.*4 skipped/)).toBeTruthy();
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: "Practice complete!" }),
  );
  expect(departingCard()).toBeNull();
  await click(screen.getByRole("button", { name: "Practice again" }));
  expect(screen.getByText("1/4")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Reveal answer" })).toBeTruthy();
  expect(departingCard()).toBeNull();
});

it("keeps the outgoing card visible while preparing the next pronunciation", async () => {
  await openCards();
  vi.useFakeTimers();
  cardAudio.preload.mockImplementation(() => new Promise(() => undefined));
  await skip();
  expect(departingCard()).not.toBeNull();
  expect(screen.getByRole("status").textContent).toContain(
    "Preparing pronunciation audio",
  );
  expect(
    screen
      .getByRole("button", { name: "Reveal answer" })
      .hasAttribute("disabled"),
  ).toBe(true);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(320);
  });
  expect(departingCard()).toBeNull();
  expect(screen.getByRole("status").textContent).toContain(
    "Preparing pronunciation audio",
  );
});

it("cancels a pending discard on exit and starts a fresh stack on re-entry", async () => {
  await openCards();
  vi.useFakeTimers();
  await skip();
  expect(departingCard()).not.toBeNull();
  await act(async () => {
    await router.navigate({
      to: "/practice",
      search: { scripts: ["katakana"], categories: ["small-tsu"] },
    });
  });
  expect(cardAudio.dispose).toHaveBeenCalled();
  await act(async () => {
    await router.navigate({
      to: "/practice/kana/cards",
      search: { scripts: ["katakana"], categories: ["small-tsu"] },
    });
    await vi.advanceTimersByTimeAsync(320);
  });
  expect(screen.getByText("1/4")).toBeTruthy();
  expect(departingCard()).toBeNull();
  expect(
    screen.queryByRole("heading", { name: "Practice complete!" }),
  ).toBeNull();
});

it.each(["app", "system"])(
  "respects the %s reduced-motion preference without delaying results",
  async (preference) => {
    await openCards();
    if (preference === "app")
      document.documentElement.dataset["motion"] = "reduced";
    else
      vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    vi.useFakeTimers();
    for (let index = 0; index < 4; index += 1) {
      await skip();
      expect(departingCard()).toBeNull();
    }
    expect(screen.getByText("0 / 4")).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Practice complete!" }),
    ).toBeTruthy();
  },
);
