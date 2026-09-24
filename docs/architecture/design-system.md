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

Feature code belongs under that feature's directory. Product-aware components
used across features, such as a shared learning-session header, may live in the
web app's `components/` area. They should not enter `packages/ui` just because
they have multiple consumers: domain independence is still required there.

Shared patterns follow the same rule. An accessible field composition used by
independent features may become a common pattern; a multi-step lesson setup or
exercise flow stays with the feature that defines its behavior.

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
