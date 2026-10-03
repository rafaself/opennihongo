import { cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { useFocusNavigation } from "./useFocusNavigation";

const root = document.documentElement;
const attribute = "data-focus-navigation";

afterEach(() => {
  cleanup();
  root.removeAttribute(attribute);
});

it("shows focus for Tab and arrow navigation, and hides it for action shortcuts", () => {
  renderHook(useFocusNavigation);
  expect(root.getAttribute(attribute)).toBe("false");
  for (const key of [
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
  ]) {
    fireEvent.keyDown(document.body, { key, shiftKey: key === "Tab" });
    expect(root.getAttribute(attribute)).toBe("true");
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(root.getAttribute(attribute)).toBe("false");
  }
  for (const key of ["1", "4", " "]) {
    fireEvent.keyDown(document.body, { key: "Tab" });
    fireEvent.keyDown(document.body, { key });
    expect(root.getAttribute(attribute)).toBe("false");
  }
});

it("ignores modified shortcuts and composition while retaining navigation focus", () => {
  renderHook(useFocusNavigation);
  fireEvent.keyDown(document.body, { key: "Tab" });
  for (const modifier of ["altKey", "ctrlKey", "metaKey", "isComposing"]) {
    fireEvent.keyDown(document.body, { key: "Enter", [modifier]: true });
    expect(root.getAttribute(attribute)).toBe("true");
  }
});

it("hides navigation focus when pointer interaction resumes", () => {
  renderHook(useFocusNavigation);
  fireEvent.keyDown(document.body, { key: "Tab" });
  fireEvent.pointerDown(document.body);
  expect(root.getAttribute(attribute)).toBe("false");
});

it("removes its state and listeners when unmounted", () => {
  const { unmount } = renderHook(useFocusNavigation);
  fireEvent.keyDown(document.body, { key: "Tab" });
  unmount();
  fireEvent.keyDown(document.body, { key: "Enter" });
  fireEvent.pointerDown(document.body);
  expect(root.hasAttribute(attribute)).toBe(false);
});

it("restores pre-existing navigation state when unmounted", () => {
  root.setAttribute(attribute, "true");
  const { unmount } = renderHook(useFocusNavigation);
  expect(root.getAttribute(attribute)).toBe("false");
  unmount();
  expect(root.getAttribute(attribute)).toBe("true");
});
