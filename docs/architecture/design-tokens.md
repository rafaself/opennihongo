# Design tokens

`packages/ui` owns the shared token contract. It keeps raw primitive scales
separate from semantic aliases so components can follow interface roles while
the selected theme supplies their values.

## Source and public import

Keep primitive values and semantic aliases together in
`packages/ui/src/tokens.css`. That file is package-internal and is included by
`packages/ui/src/styles.css`, the public stylesheet exported as
`@opennihongo/ui/styles.css`. Consumers import that package path; they do not
import token source files or add a token-specific package export. The stylesheet
is the source; CSS is processed by the existing app toolchains without a
separate token build pipeline.

`packages/ui/src/styles.css` owns shared resets and base element styles.
`packages/ui/src/tokens.css` owns primitive values, spacing, sizing, radius, and
border aliases, semantic aliases, and theme scoping. Components in
`packages/ui/src` consume semantic aliases or the shared role-neutral spacing,
sizing, radius, and border aliases. Application CSS may also consume those
aliases for app-level composition, but no consumer should depend on other
primitive scales directly.

## Layers and names

Primitive tokens are context-free values. Name them with a stable family and
scale step, using the `--ns-primitive-` prefix. Examples for future scales:

| Primitive category | Naming pattern                          | Example                                 |
| ------------------ | --------------------------------------- | --------------------------------------- |
| Color              | `--ns-primitive-color-{family}-{step}`  | `--ns-primitive-color-red-600`          |
| Spacing            | `--ns-primitive-space-{step}`           | `--ns-primitive-space-4`                |
| Type size          | `--ns-primitive-font-size-{step}`       | `--ns-primitive-font-size-3`            |
| Font family        | `--ns-primitive-font-family-{role}`     | `--ns-primitive-font-family-sans`       |
| Font weight        | `--ns-primitive-font-weight-{role}`     | `--ns-primitive-font-weight-semibold`   |
| Line height        | `--ns-primitive-line-height-{role}`     | `--ns-primitive-line-height-normal`     |
| Letter spacing     | `--ns-primitive-letter-spacing-{role}`  | `--ns-primitive-letter-spacing-tight`   |
| Size               | `--ns-primitive-size-{pixels}`          | `--ns-primitive-size-24`                |
| Radius             | `--ns-primitive-radius-{step}`          | `--ns-primitive-radius-3`               |
| Border width       | `--ns-primitive-border-width-{pixels}`  | `--ns-primitive-border-width-1`         |
| Border style       | `--ns-primitive-border-style-{name}`    | `--ns-primitive-border-style-solid`     |
| Motion duration    | `--ns-primitive-motion-duration-{step}` | `--ns-primitive-motion-duration-2`      |
| Motion easing      | `--ns-primitive-motion-easing-{name}`   | `--ns-primitive-motion-easing-standard` |

## Spacing scale

Spacing primitives use the existing Tailwind spacing progression, where one
step is `0.25rem`. The public role-neutral `--ns-space-*` aliases expose a
compact subset for shared component CSS and direct layout composition. The
`2.5` Tailwind step uses the CSS-safe suffix `2-5` in token names. Values stay
on that progression; add a step only when shared styling needs it.

| Tailwind step | Primitive token            | Shared alias     | Value      |
| ------------- | -------------------------- | ---------------- | ---------- |
| 1             | `--ns-primitive-space-1`   | `--ns-space-1`   | `0.25rem`  |
| 2             | `--ns-primitive-space-2`   | `--ns-space-2`   | `0.5rem`   |
| 2.5           | `--ns-primitive-space-2-5` | `--ns-space-2-5` | `0.625rem` |
| 3             | `--ns-primitive-space-3`   | `--ns-space-3`   | `0.75rem`  |
| 4             | `--ns-primitive-space-4`   | `--ns-space-4`   | `1rem`     |
| 5             | `--ns-primitive-space-5`   | `--ns-space-5`   | `1.25rem`  |
| 6             | `--ns-primitive-space-6`   | `--ns-space-6`   | `1.5rem`   |
| 8             | `--ns-primitive-space-8`   | `--ns-space-8`   | `2rem`     |
| 12            | `--ns-primitive-space-12`  | `--ns-space-12`  | `3rem`     |
| 16            | `--ns-primitive-space-16`  | `--ns-space-16`  | `4rem`     |

The web app maps Tailwind's `--spacing` base to `--ns-space-1` in its
`@theme inline` block. Standard utilities such as `gap-3`, `p-4`, `px-6`, and
`py-12` therefore use the same `0.25rem` progression as the shared aliases;
the package and product do not declare separate spacing bases. For example,
shared component CSS can use `padding: var(--ns-space-2-5) var(--ns-space-4)`.
These scale aliases do not assign a component role. Add role-specific spacing
semantics only when a stable shared interface meaning emerges.

## Sizing scale

Sizing primitives describe intrinsic dimensions for icon boxes, common control
heights, and pointer targets. Some values match the spacing progression, but
their role is distinct: spacing controls the gap around content, while sizing
sets a control's height, an icon's box, or an interactive target's dimensions.
Use the semantic sizing aliases in components instead of consuming these
primitive values directly.

| Primitive token          | Value     |
| ------------------------ | --------- |
| `--ns-primitive-size-16` | `1rem`    |
| `--ns-primitive-size-20` | `1.25rem` |
| `--ns-primitive-size-24` | `1.5rem`  |
| `--ns-primitive-size-40` | `2.5rem`  |
| `--ns-primitive-size-44` | `2.75rem` |
| `--ns-primitive-size-48` | `3rem`    |

Semantic aliases provide reusable dimensions for the common cases below.
Control tokens describe height; icon-box tokens describe both width and
height. Pointer-target tokens describe a square dimension and should be
applied to both minimum width and minimum height.

| Purpose                 | Semantic token                         | Value  | Guidance                                 |
| ----------------------- | -------------------------------------- | ------ | ---------------------------------------- |
| Compact control height  | `--ns-size-control-height-compact`     | `40px` | Use for dense, secondary controls        |
| Standard control height | `--ns-size-control-height-standard`    | `44px` | Default shared control height            |
| Comfortable control     | `--ns-size-control-height-comfortable` | `48px` | Use when a larger control is appropriate |
| Small icon box          | `--ns-size-icon-box-small`             | `16px` | Small supporting icon                    |
| Medium icon box         | `--ns-size-icon-box-medium`            | `20px` | Default inline icon                      |
| Large icon box          | `--ns-size-icon-box-large`             | `24px` | Prominent visual icon                    |
| Pointer target minimum  | `--ns-size-pointer-target-minimum`     | `24px` | WCAG 2.2 SC 2.5.8 AA size baseline       |
| Comfortable target      | `--ns-size-pointer-target-comfortable` | `44px` | Larger design preference                 |

WCAG 2.2 SC 2.5.8 (Level AA) requires pointer targets to be at least 24 by 24
CSS pixels unless an exception applies. For example, an undersized target may
use the spacing exception when a 24 CSS pixel diameter circle centered on its
bounding box does not intersect another target or the circle for another
undersized target. The equivalent exception also applies when the same page
provides another control that meets the criterion. Inline targets, unmodified
user-agent controls, and essential presentations have separate exceptions;
verify the criterion before relying on one. The 44 by 44 comfortable target is
a design preference, not the AA minimum. A control-height token alone does not
ensure conformance: its target width and any applicable spacing must also be
considered. See the [WCAG 2.2 Target Size (Minimum) understanding
document](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Radius scale

Rounded geometry uses a small scale from square corners through pill shapes.
Primitive values describe geometry only. Shared aliases expose the scale, and
the control and card aliases give common shared surfaces stable defaults. Use
these aliases instead of introducing one-off corner radii in shared UI.

| Primitive token              | Shared alias       | Value     | Guidance                        |
| ---------------------------- | ------------------ | --------- | ------------------------------- |
| `--ns-primitive-radius-0`    | `--ns-radius-none` | `0`       | Square corners                  |
| `--ns-primitive-radius-1`    | `--ns-radius-sm`   | `0.25rem` | Small details                   |
| `--ns-primitive-radius-2`    | `--ns-radius-md`   | `0.5rem`  | Compact surfaces                |
| `--ns-primitive-radius-3`    | `--ns-radius-lg`   | `0.75rem` | `--ns-radius-control` default   |
| `--ns-primitive-radius-4`    | `--ns-radius-xl`   | `1rem`    | `--ns-radius-card` default      |
| `--ns-primitive-radius-full` | `--ns-radius-pill` | `9999px`  | Fully rounded pills and circles |

The scale is intentionally compact: use the control alias for controls and the
card alias for card-like surfaces, then use the shared scale aliases where a
different shape is needed. The pill value is large enough to remain fully
rounded for elements of different heights.

## Border width and style

Border width and style are role-neutral geometric tokens. Border colors remain
semantic color tokens and are defined by the light and dark theme maps above;
these tokens do not assign a component-specific color.

| Primitive token                     | Shared alias                 | Value   | Guidance                                |
| ----------------------------------- | ---------------------------- | ------- | --------------------------------------- |
| `--ns-primitive-border-width-1`     | `--ns-border-width-subtle`   | `1px`   | Fine separators and subtle outlines     |
| `--ns-primitive-border-width-1`     | `--ns-border-width-standard` | `1px`   | Control and card borders                |
| `--ns-primitive-border-width-2`     | `--ns-border-width-emphasis` | `2px`   | Emphasized borders                      |
| `--ns-primitive-border-width-3`     | `--ns-border-width-focus`    | `3px`   | Visible keyboard focus outlines         |
| `--ns-primitive-border-style-solid` | `--ns-border-style-solid`    | `solid` | Shared solid borders and focus outlines |

Use `border-style` or the shorthand with the shared style token. Shared
components should use the semantic width and radius aliases; theme-specific
border colors continue to use `--ns-color-border*` or another appropriate
semantic color. The package stylesheet exposes the tokens through the same
`@opennihongo/ui/styles.css` import as the rest of the design-system tokens.

The source includes the complete initial Hinomaru-inspired brand scale and
Sumi-inspired neutral scale as primitive values. These palette steps are raw
primitives for later semantic theme mappings; components and application
styles must consume semantic tokens instead. The Hinomaru palette does not
claim that any value is the legally canonical Japanese flag color. Sumi uses
slightly warm, ink-like neutrals rather than pure black throughout the
interface:

| Primitive token                 | Value     |
| ------------------------------- | --------- |
| `--ns-primitive-color-sumi-50`  | `#FAFAF9` |
| `--ns-primitive-color-sumi-100` | `#F2F2F0` |
| `--ns-primitive-color-sumi-300` | `#C9C9C5` |
| `--ns-primitive-color-sumi-500` | `#777772` |
| `--ns-primitive-color-sumi-600` | `#595956` |
| `--ns-primitive-color-sumi-700` | `#3C3C39` |
| `--ns-primitive-color-sumi-900` | `#181817` |

The Sumi values do not assign text, border, or surface roles. The supporting
color scales below are raw accent values, not additional brand colors or
semantic aliases. Semantic themes map interface meanings to these palettes;
components and application styles must continue to consume those semantic
tokens instead of selecting a palette directly.

Green supplies success accents, amber is shared by warning and XP/reward
accents, blue supplies information accents, orange supplies streak accents,
and indigo supplies achievement accents. Sharing amber avoids introducing a
second gold-like family. These are restrained feedback and gamification
accents, not decorative rainbow colors.

| Primitive family | 50        | 100       | 300       | 500       | 600       | 700       | 900       |
| ---------------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| green            | `#EDF9F1` | `#D7F1DF` | `#7BCF96` | `#32965A` | `#277A49` | `#1D6039` | `#123C26` |
| amber            | `#FFF8E9` | `#FFEDC7` | `#F2C46F` | `#D58E3F` | `#BB702B` | `#925522` | `#57330F` |
| blue             | `#EFF7FF` | `#D8EBFF` | `#8CBEF2` | `#478AD4` | `#3472B7` | `#2B5B93` | `#1C365E` |
| orange           | `#FFF3EB` | `#FFE3D1` | `#F5AA78` | `#E4753E` | `#C85A2C` | `#9F4425` | `#5D2719` |
| indigo           | `#F3F1FF` | `#E5E0FF` | `#B2A7F5` | `#7766D4` | `#6251B5` | `#4D4091` | `#30285D` |

All values remain available only through the public stylesheet's shared token
path. Later semantic theme mappings may select the steps appropriate to each
role and theme without exposing raw palette names as component APIs.

Semantic tokens name the interface role, use the `--ns-` prefix, and omit
palette families and scale steps. For example, use `--ns-color-canvas` or
`--ns-color-brand` for color roles, `--ns-space-control-gap` for a spacing
role, `--ns-text-body-size` for a text role, and `--ns-motion-control` for an
interaction role. A semantic alias may refer to one primitive or derive from
several primitives when a theme needs a role-specific value.

## Light theme color map

The default and explicit light themes map the shared color roles as follows.
These names are the component and app contract; consumers do not need to know
which primitive family supplies a value.

| Role                      | Semantic tokens                                                                                                                                       | Light mapping                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Brand and primary actions | `--ns-color-brand`, `--ns-color-action-primary`; their `-hover` and `-foreground` variants                                                            | Hinomaru 600 for the action, 700 on hover, and white foreground                              |
| Text                      | `--ns-color-text-primary` (`--ns-color-ink`), `--ns-color-text-secondary` (`--ns-color-muted`), `--ns-color-text-tertiary`, `--ns-color-text-inverse` | Sumi 900, 700, and 600, with white inverse text                                              |
| Surfaces                  | `--ns-color-canvas`, `--ns-color-surface`, `--ns-color-surface-subtle`, `--ns-color-surface-raised`                                                   | Sumi 50, white, Sumi 100, and white                                                          |
| Borders                   | `--ns-color-border-subtle`, `--ns-color-border`, `--ns-color-border-strong`                                                                           | Sumi 100, 300, and 500                                                                       |
| Focus and selection       | `--ns-color-focus`, `--ns-color-selection`, `--ns-color-selection-foreground`                                                                         | Amber 600 focus, Hinomaru 50 selection, and primary text                                     |
| Feedback                  | `--ns-color-feedback-{success,warning,info,danger}` and matching `-surface` tokens                                                                    | Green, amber, blue, and Hinomaru foreground accents with their 50-step surfaces              |
| Rewards                   | `--ns-color-reward-{xp,streak,achievement}` and matching `-surface` tokens                                                                            | Amber for XP, orange for streaks, and indigo for achievements, each with its 50-step surface |

The primary action uses Hinomaru red. Feedback keeps distinct green, amber,
and blue meanings; red is reserved for the brand action and danger feedback.
Reward accents reuse the established amber, orange, and indigo families. The
variables are included by `@opennihongo/ui/styles.css`, so hosts consume them
through the supported stylesheet entry and can scope them with `data-theme`.

## Dark theme color map

The dark theme maps the same semantic roles under `[data-theme="dark"]`. It
uses the darkest Sumi value for the canvas, progressively lighter neutral
surfaces, and light Sumi values for text and borders. Primary actions stay
Hinomaru red, with the 500 and 600 steps providing white-foreground control
states. Focus uses amber 300; feedback and reward foregrounds use their 300
steps over matching 900-step surfaces.

| Role                      | Dark mapping                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Brand and primary actions | Hinomaru 500, Hinomaru 600 on hover, and white foreground                                |
| Text                      | Sumi 50 primary, 100 secondary, 300 tertiary, and Sumi 900 inverse                       |
| Surfaces                  | Sumi 900 canvas, dark Sumi 900/700 mixes for surface layers, and Sumi 700 raised surface |
| Borders                   | Sumi 700 subtle, 500 standard, and 300 strong                                            |
| Focus and selection       | Amber 300 focus, Hinomaru 900 selection, and primary text                                |
| Feedback                  | Green, amber, blue, and Hinomaru 300 foregrounds with matching 900-step surfaces         |
| Rewards                   | Amber, orange, and indigo 300 foregrounds with matching 900-step surfaces                |

Representative dark text/surface pairs use light Sumi values against the
darkest and raised surfaces, and the primary control keeps white text over
Hinomaru 500 in its default state and Hinomaru 600 on hover. Feedback and
reward accents use lighter foreground steps over their deep family surfaces.
These pairings are ready for the formal contrast audit in issue #93; that audit
remains the source of verified conformance results.

`packages/ui` owns both layers and chooses their names. Only the semantic layer
is a component and app consumption contract. Primitive scales can be extended
by their implementation issues; they do not make component APIs or package
exports.

## Typography scale

Typography uses the local/system sans stack already declared by the package;
the initial scale does not fetch a font or add a dependency. Primitive values
provide a compact size, weight, line-height, and letter-spacing scale. The
semantic `--ns-text-{role}-*` tokens compose those values for shared display,
heading, body, label, and caption roles. These roles do not vary by color theme.

| Role    | Size | Weight | Line height | Letter spacing | Intended use                            |
| ------- | ---- | ------ | ----------- | -------------- | --------------------------------------- |
| Display | 40px | 400    | 1.1         | -0.025em       | Page titles and prominent introductions |
| Heading | 24px | 600    | 1.25        | -0.0125em      | Section headings and card titles        |
| Body    | 16px | 400    | 1.5         | 0              | Paragraphs and default interface copy   |
| Label   | 14px | 600    | 1.25        | 0              | Controls and short interface labels     |
| Caption | 12px | 400    | 1.5         | 0              | Supporting metadata and helper copy     |

The package stylesheet exposes `.ns-text-display`, `.ns-text-heading`,
`.ns-text-body`, `.ns-text-label`, and `.ns-text-caption` classes for applying
each complete role. Component CSS can consume the same semantic tokens directly
when it needs to compose styles, as the shared Button does for its label type:

```css
.ns-button {
  font-size: var(--ns-text-label-size);
  font-weight: var(--ns-text-label-weight);
  line-height: var(--ns-text-label-line-height);
  letter-spacing: var(--ns-text-label-letter-spacing);
}
```

Use body for sustained reading, reserve display for the strongest page-level
hierarchy, and use label or caption only for short UI text. Prefer these shared
roles over new feature-local size and weight values. Extend the primitive scale
only when a real hierarchy requires a value between its existing steps.

## Theme activation

The root has a light semantic theme by default. A host may set
`data-theme="light"` or `data-theme="dark"` on its own root element, commonly
`html`, to select the tokens for the whole application. The same attribute on
any consumer-owned element scopes that theme to the element and its descendants;
CSS custom properties inherit, and the theme element itself gets the matching
base foreground, canvas, and native `color-scheme`.

```html
<html data-theme="dark">
  <!-- The whole app resolves dark semantic tokens. -->
</html>

<main data-theme="light">
  <!-- This subtree resolves light tokens even inside a dark app. -->
</main>
```

The host application owns activation and may change the attribute without
changing components. There is no system-preference override or React theme
provider in this contract. Components use semantic variables, so theme changes
are defined in the token source rather than in each component.

## Tailwind consumption

The web app imports `@opennihongo/ui/styles.css` from its entry point. Its
`apps/web/src/styles/app.css` maps the semantic names it needs into Tailwind's
theme namespace with `@theme inline`, for example `--color-canvas` to
`--ns-color-canvas` and `--font-sans` to `--ns-font-sans`. Tailwind utilities
then read the same runtime custom properties as component CSS, so a theme
change updates both without regenerating a palette or rewriting utilities.

Map only semantic names needed by app utilities. Keep the package CSS import
and Tailwind mapping in their existing public paths; do not add primitive
palette classes or a generated token pipeline.
