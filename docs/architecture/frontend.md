# Frontend architecture

The frontend is a pnpm workspace with four explicit package boundaries:

- `apps/web` owns the browser application and composes workspace packages.
- `packages/core` owns framework-independent domain rules and types. It must
  remain independent from React, browser APIs, routing, styling, and concrete
  persistence implementations.
- `packages/persistence` owns persistence adapters, repositories, IndexedDB,
  backup, and migration behavior. Add contracts to `core` only when domain
  behavior needs to remain independent from those implementations.
- `packages/ui` owns domain-agnostic design-system components and styles. It may
  depend on its UI framework, but it must not depend on product features,
  `core`, or `persistence`.

The `core` and `persistence` packages currently contain only workspace metadata:
there is no domain or persisted behavior to implement yet. Add code when a real
feature establishes a contract, rather than creating placeholder APIs.

## Web application ownership

Place application code under `apps/web/src` according to its responsibility:

| Area | Owns |
| --- | --- |
| `app/` | Browser entry point, providers, router, and application configuration. |
| `layouts/` | Persistent page composition such as shared headers and navigation. |
| `pages/` | Route-level components selected by the router. |
| `views/` | Substantial composed interface regions used by pages. |
| `features/` | Feature-owned UI and application behavior; keep internals local to the feature. |
| `components/` | Reusable product-aware components that are not owned by one feature. |
| `hooks/` | Hooks with a real cross-feature use case. Feature-specific hooks stay with their feature. |
| `lib/` | Reusable technical helpers, not domain rules or generic buckets. |
| `styles/` | Application-level Tailwind entry points and token mappings. |

Only create a directory when it has real code to own. For example, `features/`,
`hooks/`, and `lib/` do not exist in the starter because no current behavior
needs them.

## Dependency and state rules

- `web` composes the public exports of `core`, `persistence`, and `ui`.
- `ui` stays domain-agnostic; product-specific learning UI belongs in `web`.
- Features do not import another feature's internals. Promote a component only
  when it has a genuine reuse case and a clear owner.
- Keep route and search state in TanStack Router when it belongs in the URL.
  Keep transient interaction state local. Route persisted state through the
  persistence package; do not add a global state library without a concrete
  cross-feature need.
- `packages/ui` owns semantic CSS tokens, base styles, and reusable components.
  The web app maps those tokens into Tailwind's theme and uses utilities to
  compose its application layout.

## Current composition

The starter route is intentionally small:

```text
app/main.tsx -> app/router.tsx -> layouts/AppLayout.tsx
                                  -> pages/HomePage.tsx
                                     -> views/home/WelcomeView.tsx
                                        -> @nihon-shiga/ui
```

Run `pnpm dev` for the app, `pnpm typecheck` for TypeScript checks,
`pnpm build` for the web and Storybook production builds, or `pnpm storybook`
to work on UI components in isolation.
