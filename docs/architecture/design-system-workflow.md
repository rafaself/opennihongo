# Design System developer workflow

Use this guide to work on the shared Design System in `packages/ui`, explore
components and tokens, and validate its consumers in Storybook, the UI Gallery,
and the web app. The [frontend architecture guide](frontend.md) defines package
boundaries; the [Design System contribution guide](design-system.md) defines
ownership and promotion rules.

GitHub Actions are currently disabled under repository policy. Run the relevant
checks locally; this guide does not require enabling Actions or adding workflow
status checks. Follow the repository's
[contribution rules](../../CONTRIBUTING.md) and
[testing strategy](../engineering/testing.md) for general development and test
policy.

## Where work belongs

| Area              | Responsibility                                                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui`     | Owns domain-agnostic components, shared styles, tokens, and the package's public API.                                                                                                                                   |
| Storybook         | A component workshop for isolated states, variants, interactions, and accessibility review. Stories live with components under `packages/ui/src`; configuration and global decorators live in `packages/ui/.storybook`. |
| `apps/ui-gallery` | A standalone catalog and usage guide for public components, patterns, tokens, and visual assets. It demonstrates the public API and does not import web-app runtime code.                                               |
| `apps/web`        | The representative product consumer. It composes public UI exports with application features and maps shared semantic tokens into Tailwind utilities.                                                                   |

Use Storybook to develop and review a component in isolation. Use the Gallery to
explain how the shared system is used across foundations, components, patterns,
and assets. The web app then verifies that the package can be consumed by the
product application. Keep feature-aware UI with its owning feature; consult
[Choose an owner](design-system.md#choose-an-owner) and
[Promote recurring UI](design-system.md#promote-recurring-ui) before moving a
component into `packages/ui`.

## Consume the public package

The `exports` map in `packages/ui/package.json` is the source of truth for
supported imports. Use the package entry points:

```tsx
import { Button } from "@opennihongo/ui";
import "@opennihongo/ui/styles.css";
```

The component entry is `@opennihongo/ui`; first-party functional icons use
`@opennihongo/ui/icons`; and the shared stylesheet is
`@opennihongo/ui/styles.css`. Import the stylesheet once from the host's app
entry point. Do not import files from `packages/ui/src` or token partials
directly. Storybook's preview, the Gallery entry point, and the web app entry
point use these public exports. Hosts that use `Tooltip` should wrap their root
once in the exported `TooltipProvider`.

The shared stylesheet includes the token and base-style contract. Components and
application styles should consume semantic tokens for interface roles; primitive
values belong in token definitions. The host owns theme activation by setting
`data-theme="light"` or `data-theme="dark"` on its root or a scoped element. The
web app maps the semantic aliases it uses in `apps/web/src/styles/app.css`. See
the [Design Tokens guide](design-tokens.md) for token names, theme scoping, and
Tailwind mapping.

## Run and validate locally

Run only the checks relevant to the change, then expand to affected projects and
their dependents when an API or shared token change impacts multiple consumers.
Nx discovers these targets from each package's scripts.

### UI package and Storybook

```sh
pnpm storybook
pnpm nx lint @opennihongo/ui
pnpm nx typecheck @opennihongo/ui
pnpm nx test @opennihongo/ui
pnpm nx build-storybook @opennihongo/ui
```

`pnpm storybook` starts the isolated component workshop at
`http://127.0.0.1:6006`. UI tests run with Vitest and enforce the package's
configured coverage thresholds. Review component stories with the Storybook
Accessibility panel and keyboard interactions; detailed instructions are in
[Review accessibility in Storybook](design-system.md#review-accessibility-in-storybook).
Visual baseline updates are covered by the
[visual regression guide](../engineering/visual-regression.md).

### UI Gallery

```sh
pnpm ui-gallery
pnpm nx lint @opennihongo/ui-gallery
pnpm nx typecheck @opennihongo/ui-gallery
pnpm nx test @opennihongo/ui-gallery
pnpm nx build @opennihongo/ui-gallery
```

The Gallery is a separate Vite app for browsing the live catalog and playground.
Its tests cover Gallery behavior; the `@opennihongo/ui` tests cover shared
component behavior. For route registration, page structure, and catalog
navigation, follow [Adding catalog pages](ui-gallery.md#adding-catalog-pages).

### Web consumer

```sh
pnpm dev
pnpm nx lint @opennihongo/web
pnpm nx typecheck @opennihongo/web
pnpm nx build @opennihongo/web
```

The web app has lint, typecheck, and build targets; its build runs typechecking
before Vite. Use it to validate integration of the public package, shared
stylesheet, and semantic-token mappings in the product shell.

### Workspace and affected checks

The root `pnpm lint`, `pnpm typecheck`, and `pnpm build` scripts run the
workspace targets; `pnpm build` includes app builds and the Storybook build.
There is no root `test` script, so use Nx for project tests. To validate the
changed projects and their dependents against remote `main`, run:

```sh
pnpm nx affected -t lint typecheck test build build-storybook --base=origin/main --head=HEAD
```

Nx skips targets a project does not define. The command does not change the
repository's Actions policy or introduce required workflow checks.

## Add or promote shared UI

Before implementation, use the
[Design System contribution guide](design-system.md#promote-recurring-ui) to
confirm ownership and API scope. For a user-facing shared component, add a
Storybook story for normal use and meaningful variants, and add component tests
for behavior that merits automated coverage. Follow the
[testing strategy](../engineering/testing.md) for test selection and assertions.
Export the component through the package's public entry point and validate the
public import in its consumers.

Add or update the corresponding Gallery documentation for public component
usage, patterns, or token foundations. Follow the
[Gallery catalog guide](ui-gallery.md#adding-catalog-pages) for pages and
navigation; token source, names, and theme semantics belong in the
[Design Tokens guide](design-tokens.md). These links are the focused contributor
steps; the guides remain the source of truth for their detailed requirements.
