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

Use <code>GalleryDocumentationPage</code> from
[GalleryDocumentationPage.tsx](../../apps/ui-gallery/src/layouts/GalleryDocumentationPage.tsx)
for component and pattern pages. It owns the shared heading, summary, and
responsive section composition; pages provide their own live examples,
guidance, reference notes, and optional do/don't lists as React content. This
keeps the layout independent of any particular component. Give each page a
unique id for its accessible heading references. Example content can use
<code>gallery-doc-example-grid</code>, <code>gallery-doc-example-card</code>,
and <code>gallery-doc-example-stage</code> for responsive demo styling. See
[ButtonsPage.tsx](../../apps/ui-gallery/src/pages/ButtonsPage.tsx) for a
complete example.

Do not create empty pages for future components just to populate navigation.
Empty sections remain visible as taxonomy and may include concise scope
descriptions until they have real catalog pages.

The gallery consumes `@opennihongo/ui` and stays independent of web-app runtime
code. In particular, a Gamification entry may document feature-owned UI and
its ownership boundaries, but the gallery must not import a web feature's
implementation to display it.

## Playground controls

The Playground route owns temporary example state with React state in the
route. A local control should pass that state through the public props of a
component from `@opennihongo/ui`; the gallery demonstrates the API and must not
copy its styling or behavior. Keep page-specific controls and state with their
example rather than adding a shared state layer for a single use case.

When a later control represents a gallery-wide presentation preference, move
only that shared preference to the gallery shell and expose it to pages through
a small gallery-owned provider or explicit props. Pages should still translate
the preference into public Design System props or semantic tokens. The shell
must not own component behavior, and global theme and reduced-motion controls
belong to issue #91.
