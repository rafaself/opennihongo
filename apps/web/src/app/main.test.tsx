import { afterEach, describe, expect, it, vi } from "vitest";

const { createRoot, mountedRoot } = vi.hoisted(() => ({
  createRoot: vi.fn(),
  mountedRoot: { render: vi.fn() },
}));

vi.mock("react-dom/client", () => ({
  createRoot: (...arguments_: unknown[]) => {
    createRoot(...arguments_);
    return mountedRoot;
  },
}));

vi.mock("@tanstack/react-router", () => ({
  RouterProvider: () => null,
}));

vi.mock("@opennihongo/ui", () => ({
  TooltipProvider: ({ children }: { children: unknown }) => children,
}));

vi.mock("./router", () => ({ router: {} }));

afterEach(() => {
  document.body.replaceChildren();
  createRoot.mockReset();
  mountedRoot.render.mockReset();
  vi.resetModules();
});

describe("application entry point", () => {
  it("reports a missing root element before mounting", async () => {
    await expect(import("./main")).rejects.toThrow(
      "The application root element is missing.",
    );
    expect(createRoot).not.toHaveBeenCalled();
  });

  it("mounts the application into the root element", async () => {
    const rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.append(rootElement);

    await import("./main");

    expect(createRoot).toHaveBeenCalledWith(rootElement);
    expect(mountedRoot.render).toHaveBeenCalledTimes(1);
  });
});
