import "./practiceTestHelpers";
import { render, screen } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "../../../app/router";
import { createKanaPracticeSession } from "../session/createKanaPracticeSession";

export const quizOptions = {
  mode: "quiz",
  script: "katakana",
  category: "small-tsu",
  direction: "character",
  revision: 0,
} as const;
export async function openQuiz(search = {}) {
  render(<RouterProvider router={router} />);
  await router.navigate({
    to: "/practice/kana/quiz",
    search: {
      script: quizOptions.script,
      category: quizOptions.category,
      ...search,
    },
  });
  await screen.findByRole("heading", { name: "Set up your Kana quiz" });
}
export function questions(
  direction: "character" | "romaji" | "random" = "character",
  revision = 0,
) {
  return createKanaPracticeSession({
    ...quizOptions,
    direction,
    revision,
  }).exercises.map((exercise) => {
    if (exercise.type !== "multiple-choice")
      throw new Error("Expected quiz question");
    return exercise;
  });
}

export function requireValue<T>(value: T | undefined): T {
  if (value === undefined)
    throw new Error("Expected an available quiz fixture");
  return value;
}
export function question(
  index: number,
  direction: "character" | "romaji" | "random" = "character",
  revision = 0,
) {
  return requireValue(questions(direction, revision)[index]);
}
