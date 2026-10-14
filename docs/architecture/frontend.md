# Frontend architecture

The frontend is a pnpm workspace with Nx providing project graph, task
orchestration, local caching, affected execution, and module-boundary
enforcement. pnpm remains responsible for package installation, dependency
resolution, and workspace linking. Nx reads the package locations from
`pnpm-workspace.yaml`; each package declares its architectural `type:*` tag in
its `package.json`.

The workspace has seven explicit project boundaries:

- `apps/web` owns the browser application and composes workspace packages.
- `apps/ui-gallery` owns the standalone visual catalog for public Design System
  components and tokens. Its section taxonomy is documented in the [UI Gallery
  catalog guide](ui-gallery.md). It consumes `packages/ui` directly and does not
  depend on `apps/web` runtime code.
- `packages/core` owns framework-independent domain rules and types. It must
  remain independent from React, browser APIs, routing, styling, and concrete
  persistence implementations.
- `packages/content` owns statically authored learning material and pedagogical
  configuration. It may use public domain contracts from `core`; `core` must
  not depend on authored content. It owns the canonical Kana syllabaries,
  vowel lesson set, character chart, and beginner word content.
- `packages/persistence` owns persistence adapters, repositories, IndexedDB,
  backup, and migration behavior. Add contracts to `core` only when domain
  behavior needs to remain independent from those implementations.
- `packages/audio-assets` owns generated pronunciation files and the public
  manifest that resolves stable content IDs to asset URLs. Audio-generation
  tooling stays under `tools/`.
- `packages/ui` owns domain-agnostic design-system components and styles. It may
  depend on its UI framework, but it must not depend on product features,
  `core`, or `persistence`.

Nx enforces the dependency direction in ESLint: domain projects may depend
only on domain projects; content projects may depend on domain projects;
data-access projects may depend on domain, content, and data-access projects;
UI projects may depend only on UI projects; and app projects may compose
domain, content, data-access, and UI projects. In particular, `core` cannot
depend on `content`.
For packages with an `exports` map, it and TypeScript
module resolution enforce the supported public import paths. Keep package
entry points minimal and add concrete exports only when a public API has been
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
have their own typecheck targets for their domain and storage implementations.
Dependency declaration files are checked for `web`. `ui` skips dependency declaration
checks because its current Storybook declarations fail when checked alongside
exact optional property types.

Prettier is the formatting authority for supported source, configuration, and
Markdown files. Its options and ignore list are defined at the workspace root.

`core` owns exercise evaluation, result scoring, session transitions, immutable
learning records, and deterministic item-progress derivation. `content` owns the
authored Kana syllabaries, first lesson selection, chart content, and beginner
words; audio assets resolve their stable semantic identifiers.
`persistence` stores completed learning results and imported progress baselines
in a versioned IndexedDB database. Its append API validates records and atomically
deduplicates retries; it does not evaluate answers or calculate learning progress.
The [learning progress guide](learning-progress.md) describes the schema, legacy
Kana migration, and derived read model. The web
app consumes the public exports of the packages needed by current features; it
does not own storage schema or domain rules.

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

`AppLayout` uses `app/useFocusNavigation` to distinguish Tab and arrow-key
navigation from action shortcuts and pointer input. `styles/app.css` retains
navigation focus outlines without highlighting controls after Enter or number
shortcuts. Logical focus and editable-field focus remain available.

The sidebar's solid surfaces, borders, text, hover and selected states use shared
semantic theme colors in `layouts/AppLayout.css`. Its original layout, typography
and decorative navigation artwork are retained.

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

- `web` composes the public exports of `core`, `persistence`, `audio-assets`,
  and `ui`.
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

## Kanji practice

Practice includes Reading, Matching, Quiz, and Cards for 30 authored beginner
Kanji. `content/kanji` owns three themes, stable character IDs, English meanings,
common on/kun readings, one contextual example per character, and session profiles.
The examples have explicit Kana readings and authored romaji variants. Core's
`normalizeJapaneseReading` compares width, case, whitespace, and equivalent
Hiragana/Katakana without discarding long vowels, small Kana, or voiced sounds.

The web app composes Kanji-specific setup and session adapters under
`features/kanji` and route pages under `pages/practice/kanji`. Every game has a
setup route at `/practice/kanji/$game/setup`; active games use fullscreen routes
at `/practice/kanji/reading`, `/matching`, `/quiz`, and `/cards` under that prefix.
The existing practice URL search adds a namespaced `kanji` object with themes,
optional selected IDs, difficulty, optional length, quiz focus, and Fast mode.
Defaults select all 30 characters, Standard difficulty, five graded items or ten
cards, Mixed quiz focus, and Fast mode off. Options remain URL-local and survive
exit, refresh, replay, and Change options alongside the existing Kana choices.

Reading asks for the complete example-word reading in Kana or authored romaji.
Matching pairs characters with their meanings. Quizzes offer meanings, word
readings, or a balanced mix; each target appears once and choices have distinct
answers. Cards show the character and example, then reveal meaning, common
readings, and the example pronunciation, respecting the romaji preference.
Small pools clamp session sizes and choice counts. Reading/cards need one item;
matching/quizzes need two distinct answers. The existing difficulty presets,
feedback, keyboard interactions, card animation, and local learning history are
shared. `interaction/ExercisePracticeView` owns the graded session runner;
subject-specific composition supplies generation, normalization, and presentation.
Setup styles live under `views/practice/layout` and are shared with Kana.

All 30 examples have static VOICEVOX Nemo recordings in the canonical catalog.
No live synthesis service, storage migration, handwriting, stroke-order practice,
or SRS is introduced. The content notes are in [Kanji authoring](../content/kanji.md).

## Current composition

The web app registers its routes in `app/router.tsx`. `app/sections.ts` is the
shared source for sidebar labels, paths, and availability; route-level content
stays in `pages/`. The shared layout renders the active route through its
outlet:

```text
app/main.tsx -> app/router.tsx -> layouts/AppLayout.tsx
                                  -> pages/HomePage.tsx -> views/home/WelcomeView.tsx
                                  -> pages/KanaChartPage.tsx
                                  -> pages/practice/PracticePage.tsx
                                  -> pages/practice/KanaVowelsPage.tsx
                                  -> pages/practice/CardStackPage.tsx -> views/practice/cards/CardStackView.tsx
                                  -> pages/practice/words/VocabularyPage.tsx
                                  -> pages/UpcomingSectionPage.tsx
                                  -> pages/NotFoundPage.tsx
```

The Home route is `/`. Its Japanese greeting, kitsune illustration and stationery
motifs use existing assets and semantic theme tokens. An optional three-card
path suggests Writing history first, then offers direct access to the Kana chart
and Practice. On small screens the illustration becomes a compact greeting
and the cards stack. Presentation stays in `views/home/WelcomeView`.
The primary
navigation contains Home, Writing history, Kana, Particles, Practice, Progress, and
Settings. The optional overview at `/writing-history` and chapters at
`/writing-history/$chapterId` retain normal navigation and device-local reading
progress. Authored chapters, origins and source provenance belong to `content`;
the reader and its declarative unit renderers belong to the web feature. See the
[Writing history guide](writing-history.md) for authoring and storage.

Home also offers a link to the beginner Particles section at `/particles`.
Lessons at `/particles/$particleId` keep normal navigation, provide interactive
sentence examples and optional explained checks, and use reusable typed content.
These checks keep transient state and do not write exercise results or reading
progress. See the [Particles guide](particles.md) for content authoring and scope.
Kana at `/kana` is the
character and pronunciation reference; its section shortcuts open Practice
with the selected script and category. Practice at `/practice` is the single
home for exercises, grouped into Kana, Kanji, and Words. The first five-vowel lesson
is at `/practice/kana/vowels`, retaining device-local Kana progress. Vocabulary
browsing lives at `/practice/words/vocabulary`, accessible from the Words
group with hub selections preserved. Its route and word review components
are owned by `pages/practice/words` and `views/practice/words`. Each Kana game opens a shared setup page at
`/practice/kana/$game/setup`, where `$game` is reading, matching, quiz, or cards.
Setup keeps normal application navigation; active games use the fullscreen layout.
URL search stores `scripts` and `categories` arrays, optional `characterIds`,
`difficulty`, optional `length`, quiz `direction`, and `fast`. The defaults are
Hiragana, basic characters, Standard, five items (ten for cards), random quiz
direction, and Fast mode off. Setup choices are URL-local, with no saved device
defaults. Adding groups or scripts selects their new characters while preserving
individual selections; removing groups prunes their characters. Row checkboxes
show mixed selection, and an explicitly empty selection stays empty.

Reading, matching, and quiz run at `/practice/kana/reading`,
`/practice/kana/matching`, and `/practice/kana/quiz`. Session URLs start directly;
unusable selections return to setup. Reading and matching session code delegates
selection and generation to the core session builder, with smaller categories
using their available items. Matching selects distinct normalized readings so
each board remains unambiguous. Quiz keeps feature-local selection because its
distractors and balanced directions depend on the full category pool. Authored
base profiles remain in `content`. Sessions and nested exercise data remain
immutable. Reading and cards retain
characters with equivalent readings. Quiz and matching select one representative
per normalized reading, so mixed scripts and duplicate readings remain
unambiguous. Sessions offer 5, 10, or 20 items, clamped to available content.
Matching divides its batch into boards of up to 3/4/5 pairs for Easy/Standard/Hard,
rebalancing a trailing single pair; progress and results count all pairs.

Quiz Easy/Standard/Hard uses up to 2/4/6 distinct choices from the selected pool;
short pools reduce the choice count visibly. The core multiple-choice generator
supports two to six choices and scores only the prompt source. Random questions
balance directions. Normal mode uses Check answer and Continue; Fast mode checks
immediately and advances after one second. Replay retains configuration with a
new revision seed, and Change options returns to setup. Timers and pronunciation
playback are cleaned up on navigation. Reading and cards offer optional first-letter
and answer-length hints on Easy and report their use alongside existing results.
Hard reading/quiz allows audio only after checking, and Hard cards only after
revealing. Standard retains audio assistance. The renderers report framework-independent
results and reuse chart audio with authored pronunciation text as speech fallback.
Matching and quiz tiles share the circular `KeyboardShortcut` display from
`components/keyboard`; quizzes support keys 1 through 6. Each game owns its
interaction and layout.
Word matching runs at `/practice/words/matching`, retaining its regular and
rolling review rounds. `/words/practice` redirects to that game. Games use the
fullscreen session layout and return to the hub. Kana games, the saved vowel
lesson, and word matching share `views/practice/layout/PracticeHeader`,
`feedback/PracticeFeedback`, and `results/PracticeResults`. Word matching
retains attempt-based accuracy, and replay resets session state. The chart
and vocabulary browser remain references. Progress, Quests, and Library have
dedicated URLs and show an explicit coming-soon state until their features are
implemented; Quests and Library are not shown in primary navigation. The Gallery owns its own router and navigation independently.

The saved vowel lesson uses the authored `content/kanaVowelLessonProfile` and
`hiraganaVowels` through `buildExerciseSession`, the ordered selection strategy,
and the generic typed-answer generator. Its sequence remains あ, い, う, え, お.
`KanaVowelsPage` presents generated prompts and captures interaction;
`useKanaVowelLesson` connects React state, focus, and asynchronous storage to the
domain APIs. Core's `ExerciseSessionState` records each `ExerciseResult` once and
advances only after a result exists. Reading, matching, and quiz also use those
transitions, while result construction and scoring are shared core functions.
Typed-answer evaluation receives Kana normalization explicitly. Completed
results feed one generic immutable learning history, with idempotent IndexedDB
writes and core-derived item progress. The v1 vowel totals are imported as a
baseline in an atomic schema upgrade. Storage failures still allow completion
and scoring, with an explicit retry action; replay resets transient results
while keeping saved progress and assigning a fresh session ID. The vowel lesson retains its existing
form, Enter submission, feedback focus, and results focus. Existing game audio
and device preferences remain owned by their current UI adapters.

Card stacks run at `/practice/kana/cards` and `/practice/words/cards`, preserving
hub script/category selections on exit and results. `core/exercises/flashcards`
owns the content-neutral `flashcard` contract and generator: one stable source
identity, a front face, and a back face. Core session profiles, adapters, validation,
and immutable session construction support this exercise type. The authored
`content/cardStackProfile` defaults to ten cards; Kana setup can request 5, 10, or 20. `views/practice/cards`
adapts Kana chart tiles and beginner words, selects one seeded batch without
replacement, and owns the shared renderer and keyboard controls. Smaller
collections use all available items; equivalent Kana readings remain separate
cards because recall has no ambiguous answer options. Additional subjects need
a source adapter and route composition, rather than another game renderer.

Cards reveal before the learner can self-rate with Need practice (1) or Got it
(2). Enter or Space reveals; focused controls retain native keyboard activation.
Skip advances without a rating. Results label these self-reports Remembered and
Recall and report practice/skip counts. Replay reshuffles a fresh session. The
word adapter respects the romaji display preference. Shared pronunciation UI
belongs to `views/practice/audio`, alongside the recording cache and preload
hook. Card pronunciations reuse chart/word assets and authored speech fallback;
changing cards, restarting, completing, and leaving dispose playback resources.
Stacks use the fullscreen header and existing results component, with circular
shortcut badges and responsive controls. Card ratings and skips are saved through the generic learning recorder; the current session state resets on replay.
Rating or skipping retains an inert, unannounced snapshot of the departing card
for a 320 ms discard animation while the next card settles into the stack.
The departing content fades from right to left with a soft gradient mask before
the card itself fades away.
Results appear after the final discard. The feature-owned discard hook cancels
its timer when replaced, restarted, or unmounted and respects both the app and
system reduced-motion preferences without delaying results. Audio cleanup and
scoring continue as soon as the learner advances.

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
