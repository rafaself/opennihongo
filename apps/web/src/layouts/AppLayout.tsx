import { Outlet } from "@tanstack/react-router";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
      <header className="border-b border-border px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-foreground"
          >
            日
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Nihon Shiga
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
        <Outlet />
      </main>

      <footer className="border-t border-border px-6 py-5 text-center text-sm text-muted">
        A local-first Japanese learning space
      </footer>
    </div>
  );
}
