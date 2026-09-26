# Functional icons

`packages/ui` owns first-party SVG React components for domain-agnostic
functional icons. Keep functional icons separate from illustrations and other
visual assets; those belong in the UI Gallery's Assets catalog and should not
be added to the functional icon registry. See the
[Illustration Assets guide](illustrations.md) for artwork ownership and usage.

## Source and names

Store each icon in `packages/ui/src/icons/` as a PascalCase React component
named for its semantic meaning with an `Icon` suffix, such as
`CheckIcon.tsx` or `CloseIcon.tsx`. Export each component by name from the
folder's `index.ts`. Consumers can import a specific component from the public
`@opennihongo/ui/icons` entry point:

```tsx
import { CheckIcon } from "@opennihongo/ui/icons";
```

The same entry point exports the name-based `Icon` primitive and its stable
`IconName` union for shared consumers:

```tsx
import { Icon } from "@opennihongo/ui/icons";

<Icon name="check" />;
```

Keep each icon in its own module and use named ES module exports. Consumers that
know the selected icon at build time can import that component directly so
bundlers can omit unrelated artwork. The name-based primitive uses a private,
statically declared registry, so it includes the artwork for its supported
names. Do not export an all-icons object or add a production icon dependency
for these assets.

## Drawing and sizing

Use a `24 × 24` viewBox for consistent geometry. The shared SVG wrapper
provides a `currentColor` outline with a `2` unit stroke, round caps and joins,
and `fill="none"`. Draw the path with visual whitespace inside the viewBox so
the icon remains balanced beside text and controls. The wrapper applies a
`-0.125em` vertical alignment adjustment and a non-shrinking inline box.

Use the `size` prop with `small`, `medium`, or `large`, which maps to the
semantic `--ns-size-icon-box-small` (`16px`),
`--ns-size-icon-box-medium` (`20px`), or `--ns-size-icon-box-large` (`24px`)
token. Medium is the default inline size. Prefer those sizes; use a custom
style only when a concrete interface need requires another dimension.

Icons inherit `currentColor` by default. The `color` prop can select the shared
text roles `primary`, `secondary`, `tertiary`, or `inverse`, which resolve to
the corresponding `--ns-color-text-*` token for the active theme.

## Accessibility

Icons are decorative by default: the SVG is hidden from assistive technology
and is not focusable. Keep that default when nearby text already conveys the
same meaning. For a meaningful standalone icon, provide `aria-label` or
`aria-labelledby`; the wrapper exposes it as an image role. Icon-only controls
must receive their accessible name on the control itself, such as the button,
so their action is announced independently of the icon artwork.

## Initial catalog

Keep this registry small and add icons only when a shared component needs one.
The current set contains `CheckIcon`, `CloseIcon`, `MoonIcon`, `StarIcon`, and
`SunIcon`, available as `check`, `close`, `moon`, `star`, and `sun` through
`Icon`. These cover status, dismissal, theme selection, and progression
markers. Do not add feature-specific marks, decorative illustrations, or a
speculative general-purpose catalog here.
