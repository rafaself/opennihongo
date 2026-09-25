# Visual regression baselines

The UI package keeps a small Playwright screenshot baseline for representative
Storybook states. The suite covers the light and dark red-and-neutral theme,
the pressed Button state, an open Popover, and the Achievement Unlocked pattern.
It is intentionally limited to these high-value examples rather than every
component state.

## Run the comparison

Install the pinned Playwright Chromium browser once after installing workspace
dependencies:

```sh
pnpm --filter @opennihongo/ui exec playwright install chromium
```

Run the Nx target from the workspace root:

```sh
pnpm nx test:visual @opennihongo/ui
```

The test starts a local Storybook server on `127.0.0.1:6007` and uses a fixed
1280 × 800 viewport, 1× device scale, `en-US` locale, UTC timezone, and reduced
motion. Playwright and Chromium versions are pinned by the UI package and
workspace lockfile. Browser rendering can still vary between operating systems;
review or refresh baselines in the same environment used to compare them.

## Review and update baselines

When a design change intentionally alters one of these examples, run the
explicit update target:

```sh
pnpm nx test:visual:update @opennihongo/ui
```

Inspect each changed PNG in
`packages/ui/tests/visual/design-system.visual.spec.ts-snapshots/` alongside
the corresponding Storybook story. Include only intentional visual changes,
then rerun `pnpm nx test:visual @opennihongo/ui` without update mode to confirm
the committed baselines pass. Do not accept generated images without reviewing
the visual differences.
