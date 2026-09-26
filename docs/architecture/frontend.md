# Frontend architecture

The frontend is a pnpm workspace with Nx providing project graph, task
orchestration, local caching, affected execution, and module-boundary
enforcement. pnpm remains responsible for package installation, dependency
resolution, and workspace linking. Nx reads the package locations from
`pnpm-workspace.yaml`; each package declares its architectural `type:*` tag in
its `package.json`.

The workspace has five explicit project boundaries:

- `apps/web` owns the browser application and composes workspace packages.
- `apps/ui-gallery` owns the standalone visual catalog for public Design System
  components and tokens. Its section taxonomy is documented in the [UI Gallery
  catalog guide](ui-gallery.md). It consumes `packages/ui` directly and does not
  depend on `apps/web` runtime code.
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

## UI package public API

For a focused guide to consuming the package and validating its Storybook, Gallery, and web app integrations, see the [Design System developer workflow](design-system-workflow.md).

Ownership and promotion rules for shared and feature-local UI are documented in
the [Design System contribution guide](design-system.md).

`packages/ui/package.json` is the source of truth for the `@opennihongo/ui`
package's public imports. Its `exports` map currently declares:

| Import path                  | Public entry         | Contents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@opennihongo/ui`            | `src/index.ts`       | `Button`, `ActionCard`, `Badge`, `Achievement`, `RewardCard`, `QuestCard`, `LeaderboardItem`, `LessonCompleted`, `RewardReceived`, `AchievementUnlocked`, `LevelUp`, `ProgressSummary`, `DailyGoalCompleted`, `LevelBadge`, `Streak`, `Progress`, `XPBar`, `ProgressRing`, `Celebration`, `Skeleton`, `Spinner`, `Avatar`, `IconButton`, `Checkbox`, `Switch`, `RadioGroup`, `Radio`, `Select`, `FormField`, `Input`, `Textarea`, `Grid`, `Inline`, `Stack`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Divider`, `Surface`, `Card`, `Text`, `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose`, `Popover`, `PopoverTrigger`, `PopoverContent`, `Tooltip`, `TooltipProvider`, `Toast`, `ToastProvider`, `ToastViewport`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, and their types |
| `@opennihongo/ui/icons`      | `src/icons/index.ts` | `Icon`, the first-party functional icons, and their types                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `@opennihongo/ui/styles.css` | `src/styles.css`     | Shared design tokens and base styles                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

Consumers must import through these package paths. Imports into `src/` or other
package internals are unsupported; TypeScript's `Bundler` module resolution
honors the `exports` map and rejects undeclared package subpaths. The web app
and the Storybook component gallery both use the declared component and
stylesheet entries. Add another export only when a concrete API exists and a
consumer needs it.

The shared primitive and semantic token layers, theme scoping contract, and
Tailwind mapping path are documented in the [Design Tokens
guide](design-tokens.md).

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

## Source directory and file size

Keep hand-written source under `apps/` and `packages/` organized by feature,
component, or other clear responsibility instead of accumulating unrelated
files in one flat folder. The limits below are blocking boundaries, not review
suggestions.

- A source folder may contain no more than 12 direct source files and
  subdirectories. If a change would exceed 12, stop and reorganize related
  modules under meaningful subdirectories before continuing. If a touched
  folder is already over 12 entries, bring it within the limit before adding
  implementation there.
- A hand-written implementation or test file may contain no more than 400
  physical lines. Before creating or extending a file past 400 lines, stop and
  extract distinct responsibilities into cohesive modules. If a touched file
  is already over 400 lines, bring it within the limit before adding
  implementation there.
- If a responsibility-based reorganization cannot meet either limit without
  harming the design, pause and get explicit maintainer approval before
  continuing. Crossing either limit requires explicit prior approval. A
  rationale in a review or final report does not count as approval.
- Split by responsibility, not by arbitrary line ranges. Each folder or module
  should own meaningful code; do not add one-file wrappers or vague buckets
  such as `misc`, `common`, or `utils` just to meet a count.
- Do not count generated or vendored output, lockfiles, static data, fixtures,
  snapshots, or prose documentation toward these limits.

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

The web app registers its routes in `app/router.tsx`. `app/sections.ts` is the
shared source for sidebar labels, paths, and availability; route-level content
stays in `pages/`. The shared layout renders the active route through its
outlet:

```text
app/main.tsx -> app/router.tsx -> layouts/AppLayout.tsx
                                  -> pages/HomePage.tsx -> views/home/WelcomeView.tsx
                                  -> pages/UpcomingSectionPage.tsx
                                  -> pages/NotFoundPage.tsx
```

The Learn route is `/`. Kana, Practice, Progress, Quests, and Library have
dedicated URLs and show an explicit coming-soon state until their features are
implemented. The Gallery owns its own router and navigation independently.

Run `pnpm dev` for the app, `pnpm lint` for ESLint and dependency-boundary
checks, `pnpm format:check` to verify formatting, `pnpm typecheck` for
TypeScript checks, and `pnpm build` for the web and Storybook production builds.
Use `pnpm format` to apply formatting. These root commands delegate to Nx where
applicable while each project target continues to call its package's existing
tooling. Run an individual target with `pnpm nx <target> <project>` (for
example, `pnpm nx typecheck @opennihongo/web`) or run validation only for
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

Run `pnpm storybook` to work on UI components in isolation, or `pnpm ui-gallery`
to browse the standalone component and token catalog.
