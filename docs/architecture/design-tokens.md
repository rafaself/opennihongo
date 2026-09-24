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
`packages/ui/src/tokens.css` owns primitive values, semantic aliases, and theme
scoping. Components in `packages/ui/src` consume semantic aliases. Application
CSS may also consume semantic aliases for app-level composition, but no
consumer should depend on primitive scales directly.

## Layers and names

Primitive tokens are context-free values. Name them with a stable family and
scale step, using the `--ns-primitive-` prefix. Examples for future scales:

| Primitive category | Naming pattern                          | Example                                 |
| ------------------ | --------------------------------------- | --------------------------------------- |
| Color              | `--ns-primitive-color-{family}-{step}`  | `--ns-primitive-color-red-600`          |
| Spacing            | `--ns-primitive-space-{step}`           | `--ns-primitive-space-4`                |
| Type size          | `--ns-primitive-font-size-{step}`       | `--ns-primitive-font-size-3`            |
| Font family        | `--ns-primitive-font-family-{role}`     | `--ns-primitive-font-family-sans`       |
| Motion duration    | `--ns-primitive-motion-duration-{step}` | `--ns-primitive-motion-duration-2`      |
| Motion easing      | `--ns-primitive-motion-easing-{name}`   | `--ns-primitive-motion-easing-standard` |

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
role, `--ns-font-body` for a text role, and `--ns-motion-control` for an
interaction role. A semantic alias may refer to one primitive or derive from
several primitives when a theme needs a role-specific value.

`packages/ui` owns both layers and chooses their names. Only the semantic layer
is a component and app consumption contract. Primitive scales can be extended
by their implementation issues; they do not make component APIs or package
exports.

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
