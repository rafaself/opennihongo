import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { router } from "../../../../app/router";
import { openCards } from "./cardStackTestHelpers";

it("delays pronunciation in Hard cards until revealing and restores the selected options", async () => {
  const user = userEvent.setup();
  await openCards("kana", { difficulty: "hard", length: 20 });
  expect(
    screen.queryByRole("button", { name: /Play pronunciation/ }),
  ).toBeNull();
  expect(screen.queryByRole("button", { name: "Show hint" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Reveal answer" }));
  expect(
    screen.getByRole("button", { name: /Play pronunciation/ }),
  ).toBeTruthy();
  for (let index = 0; index < 4; index++) {
    await user.click(screen.getByRole("button", { name: "Skip" }));
    if (index < 3) await screen.findByRole("button", { name: "Reveal answer" });
  }
  await user.click(
    await screen.findByRole("button", { name: "Change options" }),
  );
  await screen.findByRole("heading", { name: "Set up Kana cards" });
  expect(router.state.location.search).toMatchObject({
    difficulty: "hard",
    length: 20,
    scripts: ["katakana"],
    categories: ["small-tsu"],
  });
});

it("counts optional card hints and resets them on replay", async () => {
  const user = userEvent.setup();
  await openCards("kana", { difficulty: "easy" });
  await user.click(screen.getByRole("button", { name: "Show hint" }));
  expect(screen.getByRole("status").textContent).toContain("Hint:");
  for (let index = 0; index < 4; index++) {
    await user.click(screen.getByRole("button", { name: "Skip" }));
    if (index < 3) await screen.findByRole("button", { name: "Reveal answer" });
  }
  expect(await screen.findByText("Hints used: 1")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Practice again" }));
  for (let index = 0; index < 4; index++) {
    await user.click(await screen.findByRole("button", { name: "Skip" }));
    if (index < 3) await screen.findByRole("button", { name: "Reveal answer" });
  }
  expect(await screen.findByText("Hints used: 0")).toBeTruthy();
});
