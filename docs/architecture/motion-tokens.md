# Motion tokens

`packages/ui/src/tokens.css` defines shared motion primitives and semantic
aliases. The package exposes them through the public
`@opennihongo/ui/styles.css` stylesheet; components consume the semantic CSS
custom properties directly.

## Durations

Durations distinguish routine state changes from longer expressive feedback.
Use semantic aliases in components instead of depending on primitive steps.

| Semantic token                     | Primitive token                    | Value   | Intended use                              |
| ---------------------------------- | ---------------------------------- | ------- | ----------------------------------------- |
| `--ns-motion-duration-instant`     | `--ns-primitive-motion-duration-0` | `0ms`   | Immediate state updates or reduced motion |
| `--ns-motion-duration-fast`        | `--ns-primitive-motion-duration-1` | `120ms` | Small, routine control feedback           |
| `--ns-motion-duration-normal`      | `--ns-primitive-motion-duration-2` | `200ms` | Standard interface transitions            |
| `--ns-motion-duration-slow`        | `--ns-primitive-motion-duration-3` | `320ms` | Larger, deliberate interface transitions  |
| `--ns-motion-duration-celebration` | `--ns-primitive-motion-duration-4` | `600ms` | Optional celebratory feedback timing      |

The celebration duration is intentionally distinct from routine timing. It
provides a duration for future use; it does not define or implement an effect.

## Easing

Use standard timing for ordinary interaction. Enter and exit curves make
directional transitions feel consistent. Spring and bounce curves are reserved
for playful feedback where an overshoot is appropriate.

| Semantic token                | Primitive token                         | Value                              | Guidance                           |
| ----------------------------- | --------------------------------------- | ---------------------------------- | ---------------------------------- |
| `--ns-motion-easing-standard` | `--ns-primitive-motion-easing-standard` | `cubic-bezier(0.2, 0, 0, 1)`       | General-purpose interaction        |
| `--ns-motion-easing-enter`    | `--ns-primitive-motion-easing-enter`    | `cubic-bezier(0, 0, 0.2, 1)`       | Content entering the interface     |
| `--ns-motion-easing-exit`     | `--ns-primitive-motion-easing-exit`     | `cubic-bezier(0.4, 0, 1, 1)`       | Content leaving the interface      |
| `--ns-motion-easing-spring`   | `--ns-primitive-motion-easing-spring`   | `cubic-bezier(0.2, 1.45, 0.4, 1)`  | Restrained spring-like overshoot   |
| `--ns-motion-easing-bounce`   | `--ns-primitive-motion-easing-bounce`   | `cubic-bezier(0.34, 1.7, 0.64, 1)` | More pronounced, playful overshoot |

These CSS-native Bézier curves have broad browser support. The spring and
bounce names describe easing shapes with a controlled overshoot; they are not
physics simulations or repeated bounce keyframes.

```css
.control {
  transition:
    background-color var(--ns-motion-duration-fast)
      var(--ns-motion-easing-standard),
    transform var(--ns-motion-duration-fast) var(--ns-motion-easing-standard);
}
```

The semantic duration aliases resolve to `--ns-motion-duration-instant` when
the user requests reduced motion. Components should use these aliases instead
of hard-coded timings so that preference is honored. Keep component-specific
animations and effects with the feature that owns them; this guide defines only
the shared timing language.
