# UI Gallery catalog taxonomy

The standalone UI Gallery groups design-system documentation under six
top-level sections. Their navigation metadata lives in
`apps/ui-gallery/src/catalog/navigation.ts`; the gallery shell renders that
metadata instead of maintaining its own list of sections or destinations.

## Sections

| Section      | Scope                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------ |
| Foundations  | Shared visual primitives and semantic design tokens.                                             |
| Components   | Domain-agnostic interface components exposed by `@opennihongo/ui`.                               |
| Gamification | Reward and progression visuals. Product behavior and feature-owned UI remain with their feature. |
| Patterns     | Reusable interface compositions that do not encode one feature's rules.                          |
| Assets       | Illustrations, iconography, and other visual resources with usage guidance.                      |
| Playground   | Isolated, interactive exploration of public component variants and states.                       |

## Adding catalog pages

Add a navigation link to the owning section's `links` array when a real page
and its route exist. Keep links declarative: section metadata may describe a
destination, but it must not import page components or shared UI
implementations. Register route components in the router and add them to the
section metadata; the shell will render the new navigation entry without a
shell change.

Do not create empty pages for future components just to populate navigation.
Empty sections remain visible as taxonomy and may include concise scope
descriptions until they have real catalog pages.

The gallery consumes `@opennihongo/ui` and stays independent of web-app runtime
code. In particular, a Gamification entry may document feature-owned UI and
its ownership boundaries, but the gallery must not import a web feature's
implementation to display it.
