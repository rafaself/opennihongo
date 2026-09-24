import { Button } from "@opennihongo/ui";

export function WelcomeView() {
  return (
    <section
      aria-labelledby="welcome-title"
      className="my-auto grid gap-8 py-12 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center"
    >
      <div className="max-w-2xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          Your Japanese learning space
        </p>
        <h1
          className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
          id="welcome-title"
        >
          Make steady progress, one step at a time.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
          OpenNihongo is being prepared as a calm, local-first place to learn
          Japanese.
        </p>
      </div>

      <aside
        aria-label="Getting started"
        className="rounded-2xl border border-border bg-surface p-6 shadow-card"
      >
        <p className="text-sm font-medium text-muted">Getting started</p>
        <p className="mt-2 text-xl font-semibold tracking-tight">
          Your study space is on its way.
        </p>
        <Button className="mt-6 w-full" disabled>
          Study content coming soon
        </Button>
      </aside>
    </section>
  );
}
