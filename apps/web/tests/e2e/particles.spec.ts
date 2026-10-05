import { expect, test } from "@playwright/test";

test("explores particles, reloads a direct lesson, and continues without mandatory checks", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore Japanese particles" }).click();
  await expect(
    page.getByRole("heading", { name: "Japanese particles", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Particle lessons" }).getByRole("link"),
  ).toHaveCount(10);
  await page.getByRole("link", { name: "Start with は" }).click();
  await expect(page).toHaveURL(/\/particles\/wa$/);
  await page.getByRole("button", { name: "Explore を" }).focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("group", { name: "Particle explanation" }),
  ).toContainText("Marks コーヒー as what is being drunk");
  await page.getByRole("radio", { name: "Talking about tea" }).click();
  await expect(page.getByLabel("Japanese sentence")).toHaveText(
    "お茶はおいしいです。",
  );
  await page.getByRole("button", { name: "Show reading" }).click();
  await expect(page.getByText("Ocha wa oishii desu.")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "は: set the topic", level: 1 }),
  ).toBeVisible();
  const check = page.getByRole("region", { name: "Try the idea" });
  await check.getByRole("button", { name: "を (o)" }).click();
  await expect(check.getByRole("status")).toContainText("Try another particle");
  await check.getByRole("button", { name: "は (wa)" }).click();
  await expect(check.getByRole("status")).toContainText("That fits");

  for (const glyph of ["が", "を", "に", "で", "へ", "の", "と", "も", "か"]) {
    await page.getByRole("link", { name: `Next: ${glyph}` }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      `${glyph}:`,
    );
    await expect(
      page.getByRole("button", { name: `Explore ${glyph}` }),
    ).toBeVisible();
  }
  await page.getByRole("link", { name: "Explore character practice" }).click();
  await expect(page).toHaveURL(/\/practice$/);
  await page.goto("/particles/not-a-particle");
  await expect(
    page.getByRole("heading", { name: "This page doesn't exist." }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Page not found · OpenNihongo");
});
