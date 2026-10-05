import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "../../../app/router";
import { particleLessons } from "@opennihongo/content";

afterEach(cleanup);
async function open(id?: string) {
  render(<RouterProvider router={router} />);
  await router.navigate(
    id
      ? { to: "/particles/$particleId", params: { particleId: id } }
      : { to: "/particles" },
  );
}

it("opens from Home and navigation, offers ten lessons, and preserves navigation on detail pages", async () => {
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/" });
  await user.click(
    await screen.findByRole("link", { name: "Explore Japanese particles" }),
  );
  await screen.findByRole("heading", { name: "Japanese particles", level: 1 });
  expect(
    within(screen.getByRole("list", { name: "Particle lessons" })).getAllByRole(
      "link",
    ),
  ).toHaveLength(10);
  await user.click(screen.getByRole("link", { name: "Start with は" }));
  await screen.findByRole("heading", { name: "は: set the topic", level: 1 });
  expect(document.title).toBe("は: set the topic · OpenNihongo");
  expect(
    within(screen.getByRole("navigation", { name: "Primary navigation" }))
      .getByRole("link", { name: "Particles" })
      .getAttribute("aria-current"),
  ).toBe("page");
  await user.click(screen.getByRole("link", { name: /Next: が/ }));
  await screen.findByRole("heading", {
    name: "が: identify who or what",
    level: 1,
  });
  await user.click(screen.getByRole("link", { name: /Previous: は/ }));
  await screen.findByRole("heading", { name: "は: set the topic", level: 1 });
  await user.click(screen.getByRole("link", { name: "All particles" }));
  await screen.findByRole("heading", { name: "Japanese particles", level: 1 });
});

it("explores particle roles in sentences and resets the explanation when changing examples", async () => {
  const user = userEvent.setup();
  await open("wa");
  await screen.findByRole("button", { name: "Explore を" });
  const detail = () =>
    within(screen.getByRole("group", { name: "Particle explanation" }));
  expect(detail().getByText(/Marks 私 as the topic/)).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Explore を" }));
  expect(
    detail().getByText(/Marks コーヒー as what is being drunk/),
  ).toBeTruthy();
  await user.click(screen.getByRole("radio", { name: "Talking about tea" }));
  expect(screen.getByLabelText("Japanese sentence").textContent).toBe(
    "お茶はおいしいです。",
  );
  expect(detail().getByText(/Makes お茶 the topic/)).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Show reading" }));
  expect(screen.getByText("Ocha wa oishii desu.")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Hide reading" }));
  expect(screen.queryByText("Ocha wa oishii desu.")).toBeNull();
});

it("gives explained feedback for optional checks without gating the next lesson", async () => {
  const user = userEvent.setup();
  await open("wo");
  await screen.findByRole("heading", { name: "を: mark the object" });
  const check = within(screen.getByRole("region", { name: "Try the idea" }));
  await user.click(check.getByRole("button", { name: "が (ga)" }));
  expect(check.getByRole("status").textContent).toContain(
    "Try another particle",
  );
  await user.click(check.getByRole("button", { name: "を (o)" }));
  expect(check.getByRole("status").textContent).toContain("That fits");
  await user.click(check.getByRole("button", { name: "Try again" }));
  expect(check.queryByRole("status")).toBeNull();
  await user.click(screen.getByRole("link", { name: /Next: に/ }));
  await screen.findByRole("heading", {
    name: "に: point to a destination or location",
  });
  expect(screen.queryByRole("status")).toBeNull();
});

it("supports keyboard exploration, choice feedback, and related-lesson links", async () => {
  const user = userEvent.setup();
  await open("wa");
  const object = await screen.findByRole("button", { name: "Explore を" });
  object.focus();
  await user.keyboard(" ");
  expect(object.getAttribute("aria-pressed")).toBe("true");
  expect(
    screen.getByRole("group", { name: "Particle explanation" }).textContent,
  ).toContain("Marks コーヒー as what is being drunk");
  await user.click(screen.getByRole("link", { name: "が · Subject" }));
  await screen.findByRole("heading", { name: "が: identify who or what" });
  const choice = within(
    screen.getByRole("region", { name: "Try the idea" }),
  ).getByRole("button", { name: "が (ga)" });
  choice.focus();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("status").textContent).toContain("That fits");
  await user.click(screen.getByText("Learning sources"));
  expect(
    screen
      .getByRole("link", { name: "Irodori: Grammar Notes" })
      .getAttribute("href"),
  ).toBe("https://www.irodori.jpf.go.jp/assets/data/Grammar_all.pdf");
  await user.click(
    within(
      screen.getByRole("navigation", { name: "Primary navigation" }),
    ).getByRole("link", { name: "Particles" }),
  );
  await screen.findByRole("heading", { name: "Japanese particles", level: 1 });
});

it("supports every direct lesson URL, final navigation, and invalid-ID recovery", async () => {
  render(<RouterProvider router={router} />);
  for (const lesson of particleLessons) {
    await router.navigate({
      to: "/particles/$particleId",
      params: { particleId: lesson.id },
    });
    await screen.findByRole("heading", { name: lesson.title, level: 1 });
    expect(
      screen.getByRole("button", { name: `Explore ${lesson.glyph}` }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "All particles" })).toBeTruthy();
  }
  expect(
    screen
      .getByRole("link", { name: "Explore character practice" })
      .getAttribute("href"),
  ).toBe("/practice");
  await router.navigate({
    to: "/particles/$particleId",
    params: { particleId: "not-a-particle" },
  });
  await screen.findByRole("heading", { name: "This page doesn't exist." });
  expect(document.title).toBe("Page not found · OpenNihongo");
});
