# Design System contributions

`packages/ui` is the shared, domain-agnostic Design System. It owns reusable
visual foundations and interface components; product features own UI that
explains or carries out a learning task. A component that looks reusable is not
automatically a Design System component.

## Choose an owner

Keep UI beside its feature when its content, behavior, or API depends on that
feature's concepts, rules, or workflow. Examples include a kana question card,
grammar exercise instructions, and the gamification feature's streak flame,
XP rules, or achievement presentation. Product-aware UI may be reused by
multiple parts of the same feature without moving to `packages/ui`.

Use `packages/ui` for domain-independent foundations and components with a
small, stable interface. Examples include color and spacing tokens, buttons,
form controls, and generic progress or status indicators. A generic progress
indicator can be shared; the meaning of a learner's level, streak, or XP stays
with the feature that defines it.

`Progress` and `ProgressRing` require an accessible name and expose the same
clamped `value`/`max` range. Ring center content remains separate from its
progressbar semantics so assistive technology can still reach it; avoid using
that slot to repeat the value already announced by the range.

`XPBar` is a narrow reward-colored composition over `Progress`. The caller
supplies either a current/target range or a value/optional maximum, plus the
accessible name and any supporting text. Keep XP award, threshold, and level
rules in the feature that owns them; `XPBar` only presents the supplied range.

`Streak` presents a caller-supplied count, unit, and state. Its state label is
visible alongside the semantic color treatment, and its visible label names
the status region. The caller determines the count and state; `Streak` does not
decide whether a streak increments, expires, is protected, or can be recovered.

`Spinner` is an indeterminate status for short operations and requires an
`aria-label` or `aria-labelledby`. Pair it with visible status text; color or
animation must not be the only indication of ongoing work. It stops rotating
when reduced motion is requested. Use `Progress` or `ProgressRing` when a
determinate value is available, and `Skeleton` when preserving a known content
layout is more useful.

Feature code belongs under that feature's directory. Product-aware components
used across features, such as a shared learning-session header, may live in the
web app's `components/` area. They should not enter `packages/ui` just because
they have multiple consumers: domain independence is still required there.

Shared patterns follow the same rule. An accessible field composition used by
independent features may become a common pattern; a multi-step lesson setup or
exercise flow stays with the feature that defines its behavior.

Use `Switch` for an on/off setting that takes effect immediately. Use
`Checkbox` for selecting items and `Button` for actions that require explicit
submission or confirmation.

Use `Tabs` to switch between related panels in the current view. Keep
route-backed navigation in the router and use links for it. Give each tab list
an accessible name; horizontal lists scroll inline on narrow containers so
their triggers remain unwrapped and reachable.

## Structural surfaces and cards

`Surface` is a low-level visual container. It applies a semantic surface
background, border, radius, and elevation while leaving content, spacing,
layout, and behavior to its caller. Its interactive elevation provides hover,
pressed, and focus-within shadow feedback for compositions that contain real
interactive elements; `Surface` itself remains a structural `div` and does not
provide click or keyboard behavior.

`Card` is a static content container that composes `Surface` for its visual
foundation and applies consistent content padding. Use its `article` element
for self-contained content or a labelled `section` for a named region; its
default `div` is for generic grouping. Compose explicit Buttons or links inside
the Card for actions. The Card root does not behave as a link or button, and
interactive styling or behavior belongs to the actual interactive elements.
Do not add those content or action conventions to `Surface`.

## Overlay contract

Portaled UI uses the shared layer tokens from the [Design Tokens
guide](design-tokens.md#overlay-layers). The order is content, sticky app
chrome, dialog backdrop, dialog surface, popover content (including Select),
tooltip, then toast. Overlay styles set `z-index` only from their assigned
`--ns-layer-*` token. Do not use literal z-index values or expose a `zIndex`,
layer-selection, or portal-style escape hatch on an overlay API. The portal
container can be selected by a consumer; its layer cannot.

An overlay's portal defaults to `document.body` in the document that owns the
component. This is also the default for the web app, Storybook stories, and UI
Gallery examples; a Storybook preview in an iframe therefore uses that preview
document's body. Overlay implementations must not read `document` or
`document.body` during server rendering. They should defer portal mounting
until the client has mounted, unless the host has supplied an available mount.
When the host needs a different root for SSR hydration, a test, or integration
inside an isolated host, expose the same optional prop,
`portalContainer?: HTMLElement`, and pass it to the underlying portal
primitive. Omit it for the normal body destination. Do not add alternate
container names or silently infer a mount from a trigger. A supplied mount
should be a stable host-owned element whose stacking context is not clipped or
isolated from the host content.

Modal backdrops use `--ns-color-overlay-backdrop`; their dialog content uses
`--ns-color-surface-raised`, `--ns-color-border`, and
`--ns-elevation-dialog`. Non-modal floating content such as Select and Popover
uses the raised surface and `--ns-elevation-overlay`, without a backdrop.
Tooltips and toasts use those same semantic surface roles as needed. The
surface is owned by the overlay content, and only a modal dialog owns a
backdrop. Do not create component-specific overlay colors when these roles
suffice.

Only an open modal dialog locks document scrolling. The dialog's accessible
primitive owns that lock, including nested-modal counting and restoring the
previous body state when the last modal closes. Popovers, Select, tooltips, and
toasts never lock scrolling or compete to restore global styles.

Modal dialogs have an accessible name, move focus into the dialog on open, keep
Tab navigation within it, and return focus to the trigger (or a logical fallback
if the trigger no longer exists) on close. Escape and outside interaction
dismiss by default; a flow that must prevent dismissal must keep the dialog
controlled and provide a visible close or recovery action. Opening a modal
closes unrelated transient overlays. Popover and Select interactions follow
their underlying primitive's keyboard model, dismiss on Escape and appropriate
outside interaction, and return focus to the trigger when they close. Tooltips
do not take focus or contain interactive controls; they appear for pointer
hover and keyboard focus and hide on blur, Escape, or when the pointer exits the
hoverable trigger-and-content region. The primitive allows pointer travel from
the trigger to the tooltip content. Tooltip text is supplemental and must not
be required information; the trigger keeps its own accessible name. Wrap the
application in `TooltipProvider` once to share the pointer delay between
triggers. Toasts
announce updates without taking focus or trapping it and provide an explicit
dismiss action when users need to control their lifetime. Use the chosen
accessible primitive for focus and dismissal mechanics rather than
reimplementing them in each component.

`Badge` presents a concise, non-interactive status or category label. Use it to
communicate information such as availability or a content category; do not use
it for an action, navigation, or a selectable filter. Use a link for navigation,
a `Button` for an action, and an appropriate selection control when the user
needs to change a choice.

`LevelBadge` presents a caller-supplied label and value, with an optional
caller-supplied tier label and semantic Badge treatment. It does not own level,
tier, threshold, or progression rules; those remain with the feature that
supplies the data.

`RewardCard` presents a caller-supplied reward category, label, value, and
state. Its supported categories map to shared semantic reward colors, while
visible category and state labels can be localized by the caller. It does not
award, calculate, claim, or persist rewards; those rules remain with the
feature that supplies the data.

`Avatar` displays a person image or a visual fallback at a shared semantic size.
Set `alt` to a meaningful identity label when the avatar conveys who the person
is; use `alt=""` when nearby text already identifies them. The fallback is
decorative because the `alt` label remains the accessible name after an image
fails to load. Supply initials or other non-interactive fallback content when
the default silhouette is not appropriate.

## Promote recurring UI

Start new UI in the narrowest area that owns its behavior. Promote an existing
component to `packages/ui` when both conditions hold:

1. It has no product-domain assumptions or dependency on a feature, `core`, or
   `persistence`.
2. Its reuse is demonstrated by independent consumers, or it provides clear
   platform-level value such as a foundational accessible control or shared
   visual token.

Reuse within one feature is not, by itself, evidence for promotion. Do not
build speculative abstractions for possible future consumers. When a small
internal change stays with its owner, ordinary code review is enough; no
separate proposal or approval process is needed.

Before promoting, confirm that the shared component has a clear owner, a
purposeful name, and a focused API that works for its known consumers without
feature-specific flags or terminology. Use semantic names that describe the
interface role (`Button`, `ProgressIndicator`) rather than a screen, route, or
feature (`KanaQuizButton`, `StreakPageProgress`). Add exports only through the
public paths declared in `packages/ui/package.json`; do not expose package
internals.

## Quality and documentation

Follow the shared [interactive state contract](interactive-states.md) when
defining focus, hover, press, disabled, or loading behavior for a component.
Components should implement only states that apply to their semantics and must
keep visual state aligned with actual interaction behavior.

Use `Grid` for equal-width, responsive columns with shared spacing gaps. Use
CSS Grid directly when a layout needs named areas, explicit item placement, or
custom track sizing.

Shared components must support their intended keyboard and assistive
technology interactions. Prefer native HTML semantics, label controls, expose
state and errors accessibly, preserve visible focus, and verify color contrast
for the states they introduce. Document any intentional accessibility limits
and do not make accessibility optional through a feature-specific escape hatch.

Add a Storybook story for each user-facing shared component. Show its normal
use and meaningful variants or states, including disabled, error, loading, or
empty states where applicable. Stories should demonstrate the public API and
include interaction or accessibility checks when behavior warrants them.
Tokens and other non-component foundations should be documented in the gallery
or alongside their definitions so contributors can find their intended use.
The source, naming rules, semantic roles, and theme contract for shared tokens
are defined in the [Design Tokens guide](design-tokens.md).

The first-party functional icon source, naming rules, size and stroke
conventions, and accessibility requirements are defined in the
[Functional Icons guide](icons.md).

Keep the public API small and typed. Treat imports and props as supported
contracts: favor compatible additions and avoid changing existing behavior.
Prefer composition and accessible defaults over many boolean switches. Add an
export when a real consumer needs it, and review changes against every current
consumer and its Storybook examples. Use the deprecation path below when an
incompatible change is necessary.

## Review accessibility in Storybook

Run `pnpm storybook`, open a component story, and review its **Accessibility**
panel. The Storybook a11y addon runs axe checks for the rendered story and shows
violations, passes, and checks that need manual review. Violations are errors in
the configured Storybook accessibility test integration because
`a11y.test` is set to `"error"`. In local review, fix the component or correct
the story setup, then review the story again. Do not turn off checks or suppress
a violation to make the panel pass. The Button `Primary` story is the current
passing example.

Automated checks cover only part of accessibility. Manually use the component
with the keyboard, checking focus order and visibility and the relevant keys
(such as Tab, Enter, Space, and Escape). Check semantics and announced state
with assistive technology when the component's behavior calls for it. Treat
axe's incomplete results as prompts for this review; a passing panel does not
replace keyboard or screen-reader testing.

## Deprecation

When a public component or prop needs replacement, mark the old API as
deprecated in its type or documentation, name the supported replacement, and
give in-repository consumers a migration path. Migrate consumers and examples
before removal. For this private workspace, a focused change note and a
compatible migration in the same work are sufficient; a formal release process
is not required. Remove the deprecated API once no supported consumer depends
on it.
