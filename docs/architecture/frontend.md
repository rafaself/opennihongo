# Frontend architecture

The frontend is a pnpm workspace with Nx providing project graph, task
orchestration, local caching, affected execution, and module-boundary
enforcement. pnpm remains responsible for package installation, dependency
resolution, and workspace linking. Nx reads the package locations from
`pnpm-workspace.yaml`; each package declares its architectural `type:*` tag in
its `package.json`.

The workspace has four explicit project boundaries:

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

Nx enforces the dependency direction in ESLint: domain projects may depend only
on domain projects; data-access projects may depend on domain and data-access
projects; UI projects may depend only on UI projects; and app projects may
compose domain, data-access, and UI projects. For packages with an `exports`
map, it and TypeScript module resolution enforce the supported public import
paths. Do not add package entry points until a real public API has been
established.

The root TypeScript dependency stays on the 6.0 line (currently 6.0.3) because
the Nx ESLint boundary plugin's TypeScript utilities do not yet support
TypeScript 7's compiler API. Revisit this constraint when the lint toolchain
supports TypeScript 7.

The shared TypeScript configuration enables `strict` mode, exact optional
properties, checked indexed access, explicit returns and overrides, and
unreachable-code and side-effect-import checks. It also rejects unused locals
and parameters and switch fallthroughs. ESLint applies strict type-aware
TypeScript rules to `web` and `ui`, rejects explicit `any` and TypeScript
suppression comments, and enforces package boundaries. `core` and `persistence`
do not yet contain TypeScript code or have typecheck targets. Dependency
declaration files are checked for `web`. `ui` skips dependency declaration
checks because its current Storybook declarations fail when checked alongside
exact optional property types.

Prettier is the formatting authority for supported source, configuration, and
Markdown files. Its options and ignore list are defined at the workspace root.

The `core` and `persistence` packages currently contain only workspace metadata:
there is no domain or persisted behavior to implement yet. Add code when a real
feature establishes a contract, rather than creating placeholder APIs.

## Web application ownership

Place application code under `apps/web/src` according to its responsibility:

| Area          | Owns                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------- |
| `app/`        | Browser entry point, providers, router, and application configuration.                    |
| `layouts/`    | Persistent page composition such as shared headers and navigation.                        |
| `pages/`      | Route-level components selected by the router.                                            |
| `views/`      | Substantial composed interface regions used by pages.                                     |
| `features/`   | Feature-owned UI and application behavior; keep internals local to the feature.           |
| `components/` | Reusable product-aware components that are not owned by one feature.                      |
| `hooks/`      | Hooks with a real cross-feature use case. Feature-specific hooks stay with their feature. |
| `lib/`        | Reusable technical helpers, not domain rules or generic buckets.                          |
| `styles/`     | Application-level Tailwind entry points and token mappings.                               |

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

Run `pnpm dev` for the app, `pnpm lint` for ESLint and dependency-boundary
checks, `pnpm format:check` to verify formatting, `pnpm typecheck` for
TypeScript checks, and `pnpm build` for the web and Storybook production builds.
Use `pnpm format` to apply formatting. These root commands delegate to Nx where
applicable while each project target continues to call its package's existing
tooling. Run an individual target with `pnpm nx <target> <project>` (for
example, `pnpm nx typecheck @nihon-shiga/web`) or run validation only for
changed projects and their dependents with `pnpm nx affected -t lint typecheck
test build build-storybook --uncommitted`. Use `--base=origin/main --head=HEAD`
to compare committed changes against the remote main branch. Targets such as
`test` are picked up when a project adds the corresponding package script.

Add future apps and packages under the existing `apps/*` or `packages/*`
workspace globs, give each package a unique name, set `nx.projectType` to
`application` or `library`, and add one responsibility tag. Declare workspace
package dependencies with `workspace:*`, expose stable public imports through
its `exports` map, and add package scripts for the targets it supports. Nx will
discover the project and its package-script targets without a separate project
file.

Run `pnpm storybook` to work on UI components in isolation.
