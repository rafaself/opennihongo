# Motion tokens

`packages/ui/src/tokens.css` defines shared motion primitives and semantic
aliases. The package exposes them through the public
`@opennihongo/ui/styles.css` stylesheet; components consume the semantic CSS
custom properties directly.

## Durations

Durations distinguish routine state changes from longer expressive feedback.
Use semantic aliases in components instead of depending on primitive steps.

| Semantic token                       | Primitive token                    | Value    | Intended use                                      |
| ------------------------------------ | ---------------------------------- | -------- | ------------------------------------------------- |
| `--ns-motion-duration-instant`       | `--ns-primitive-motion-duration-0` | `0ms`    | Immediate state updates or reduced motion         |
| `--ns-motion-duration-fast`          | `--ns-primitive-motion-duration-1` | `120ms`  | Small, routine control feedback                   |
| `--ns-motion-duration-normal`        | `--ns-primitive-motion-duration-2` | `200ms`  | Standard interface transitions                    |
| `--ns-motion-duration-slow`          | `--ns-primitive-motion-duration-3` | `320ms`  | Larger, deliberate interface transitions          |
| `--ns-motion-duration-celebration`   | `--ns-primitive-motion-duration-4` | `600ms`  | Optional celebratory feedback timing              |
| `--ns-motion-duration-indeterminate` | `--ns-primitive-motion-duration-5` | `1000ms` | Slow rotation for indeterminate status indicators |

The celebration duration is intentionally distinct from routine timing. It
provides a duration for future use; it does not define or implement an effect.
Indeterminate status indicators use a slower rotation than routine control
feedback; the effect stops when reduced motion is requested.
`--ns-motion-press-offset` is `1px` during ordinary interaction and becomes
`0px` when reduced motion is requested. Shared controls can use it for a small
tactile press cue without moving under the reduced-motion preference.

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

## Reduced-motion contract

The public stylesheet detects `prefers-reduced-motion: reduce` in one shared
media query. When active, semantic transition durations resolve to instant, the
press offset becomes zero, and spring/bounce aliases resolve to the standard
easing. Applications and the UI Gallery can also set `data-motion="reduced"`
on the document root to explicitly simulate reduced motion without changing
the operating-system setting. The shared stylesheet then disables animations,
transitions, and smooth scrolling throughout the document, and motion-aware
components such as `Celebration` observe the same attribute. Removing the
attribute returns CSS motion tokens and JavaScript effects to the system
preference. Components should use semantic aliases instead of hard-coded
timings or primitive values so the preference is honored. Instant updates still
expose the same state; the preference removes movement, not information.

| Behavior             | Reduced-motion treatment                                                             | Preserve the state with                                    |
| -------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Press                | Remove translation and apply the pressed state immediately.                          | Pressed color, border, or shadow.                          |
| Enter and exit       | Show or remove content immediately; avoid sliding, zooming, or large transforms.     | Clear content order, headings, and focus placement.        |
| Progress             | Update the progress value immediately; omit sweeping, pulsing, or moving indicators. | A progress bar value plus a label or numeric status.       |
| Indeterminate status | Stop spinner rotation while retaining its status semantics.                          | A visible loading message beside the static indicator.     |
| Celebration          | Omit decorative particles, loops, shakes, and spring/bounce movement.                | A static reward mark with readable success or reward text. |

Do not make completion, error, or reward meaning depend on motion, color alone,
or a disappearing effect. Keep semantic status text and accessible progress
values in the reduced path; announce important updates through the owning
feature's existing accessibility mechanism.

The shared Button is a representative press example: its normal 1px press
translation is supplied by `--ns-motion-press-offset`; the same rule resolves
to `translateY(0px)` when the system preference is set. Its pressed elevation
still changes immediately, so the state remains visible without movement.
Feature-owned transitions and decorative effects should follow the same
contract using their own selectors and status semantics.
