# Interactive states

This contract defines the shared visual and behavioral expectations for
interactive Design System components. A component supports only the states that
make sense for its role. Its native HTML semantics and behavior remain the
source of truth; a visual treatment never creates or removes an interaction by
itself.

Use the semantic color, elevation, motion, and sizing tokens described in the
[Design Tokens guide](design-tokens.md) and [Motion Tokens guide](motion-tokens.md).
Keep state selectors and behavior attached to the component that owns them.
Shared tokens are the reusable layer; add a styling helper when multiple
components have a real repeated rule and the helper still makes each
component's semantics clear.

## State contract

| State         | Visual treatment                                                                                                                                                                   | Interaction and accessibility behavior                                                                                                                                                                                                                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default       | Establish the component's normal enabled appearance using its semantic role.                                                                                                       | Use the native element that matches the action. The component is available for its normal pointer and keyboard operation.                                                                                                                                                                                                             |
| Hover         | An optional, restrained pointer cue may change semantic color or elevation.                                                                                                        | Hover is supplementary feedback. It must not reveal essential content or be the only way to discover an action; omit it where hover does not apply.                                                                                                                                                                                   |
| Pressed       | Give a brief, tactile response with the pressed elevation and, where appropriate, the shared press offset. Preserve another visible cue if elevation is not part of the component. | This is the momentary act of pressing an action. Use native activation behavior; do not use this transient state to represent a persistent toggle or selection.                                                                                                                                                                       |
| Focus-visible | Show a clear, non-color-only focus indicator that remains visible over the component's adjacent surface.                                                                           | Keyboard users can locate focus. Focus alone must not activate the action. Do not clip, cover, or remove the indicator.                                                                                                                                                                                                               |
| Disabled      | Make unavailability perceivable and remove hover or pressed affordances. Keep any visible label readable.                                                                          | The component must not perform its action. Prefer the native `disabled` attribute when the element supports it. `aria-disabled="true"` communicates a state but does not block events or keyboard activation; code using it must enforce the disabled behavior and choose the appropriate focus order.                                |
| Loading       | Show progress without replacing the action's accessible name with an unlabeled spinner. Keep focus indication visible if the user is focused on the component.                     | Loading does not, by itself, disable a control. Prevent duplicate or conflicting actions in the behavior layer. Use native `disabled` only when removing activation and focus is appropriate; if using `aria-disabled`, also suppress activation in all relevant paths. Expose busy content and meaningful status updates accessibly. |

Not every component has hover, pressed, disabled, or loading states. For
example, a text input may have a focus state but no pressed state, and a static
surface has no interaction states of its own. Do not add unsupported states
just to complete a visual set.

## Focus-visible treatment

Use `:focus-visible` for the visible focus treatment and retain a visible
indicator for keyboard navigation. The shared Button is the reference pattern:

```css
.component:focus-visible {
  outline: var(--ns-border-width-focus) var(--ns-border-style-solid)
    var(--ns-color-focus);
  outline-offset: 2px;
}
```

The focus color is semantic and theme-aware: light and dark themes map
`--ns-color-focus` independently. Check the indicator against the actual
adjacent colors for each supported theme and component surface. When the
indicator provides the visual information that identifies focus, target at
least a 3:1 contrast ratio against adjacent colors, consistent with [WCAG 2.2
Success Criterion 1.4.11, Non-text
Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
Using the semantic token alone does not establish that a new combination has
been contrast-checked. Keep a shape or boundary change in addition to color,
and avoid placing the indicator where overflow, neighboring content, or an
overlay obscures it.

## Press feedback and motion

When elevation suits the component, use the shared interactive, hover, and
pressed elevation roles in that order. A press should feel like the control
moves into its surface: reduce the shadow and use
`--ns-motion-press-offset` where appropriate. The Button uses its own
variant-specific hard lower edge and press travel to match its primary or
secondary action role. Transition related color, elevation, and transform
changes with the fast duration and standard easing. Do not rely on shadow or
movement as the only pressed-state cue.

The shared motion tokens honor `prefers-reduced-motion`: the press offset
resolves to zero and routine transition durations become instant. The pressed
appearance must still be clear when movement is removed. Components without
raised styling can use an appropriate color, border, or other visible response
without adopting an elevation effect.

## Disabled and loading behavior

Disabled and loading are different states. Disabled means the action is
unavailable. Loading means work is in progress and requires a deliberate
decision about whether another activation is allowed. In both cases, the
component's behavior must match its accessible state: a subdued appearance by
itself does not prevent activation, while `aria-disabled` by itself does not
block pointer, keyboard, or form behavior.

Use the native disabled behavior where it matches the component's intended
focus and activation model. A custom widget using `aria-disabled` must guard its
activation paths itself; keep or remove it from the tab order intentionally.
For loading content, expose `aria-busy` on the region being updated when
appropriate and provide a concise accessible status for meaningful progress or
completion. Keep stable names and instructions available while progress is
shown. Avoid using opacity alone to communicate either state.

## Persistent state and overlapping states

Momentary pressed feedback is not a persistent selected, expanded, checked, or
pressed toggle state. Represent persistent state with the role's appropriate
native or ARIA state, such as `aria-pressed`, `aria-expanded`, `aria-selected`,
or `checked`, and provide a visible cue that is not color alone.

Focus-visible can coexist with hover or pressed feedback; the focus indicator
must remain discernible. Disabled components suppress actionable hover and
pressed treatments. A loading component may retain focus while its action is
guarded against repeat activation. Apply only the combinations supported by
the component's role and behavior.
