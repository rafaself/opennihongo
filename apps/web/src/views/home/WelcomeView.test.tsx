import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "../../app/router";

afterEach(cleanup);

it("welcomes learners and offers an ordered, optional path into history, characters, and practice", async () => {
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/" });
  await screen.findByRole("heading", {
    name: "A little Japanese. A little every day.",
    level: 1,
  });
  expect(screen.getByText("こんにちは").getAttribute("lang")).toBe("ja");

  const paths = within(
    screen.getByRole("list", { name: "Ways to learn" }),
  ).getAllByRole("listitem");
  expect(paths).toHaveLength(3);
  const expected = [
    ["Discover the story", "Explore writing history", "/writing-history"],
    ["Meet the characters", "Explore the Kana chart", "/kana"],
    ["Make it stick", "Start practicing", "/practice"],
  ] as const;
  for (const [index, [title, action, href]] of expected.entries()) {
    const path = paths[index];
    if (!path) throw new Error(`Missing learning path ${String(index)}`);
    expect(within(path).getByRole("heading", { name: title })).toBeTruthy();
    expect(
      within(path).getByRole("link", { name: action }).getAttribute("href"),
    ).toBe(href);
  }
  expect(screen.getByText("Start wherever you feel comfortable.")).toBeTruthy();
  await user.click(
    screen.getByRole("link", { name: "Explore the Kana chart" }),
  );
  await screen.findByRole("heading", { name: "Kana characters" });
  expect(document.title).toBe("Kana · OpenNihongo");
});
