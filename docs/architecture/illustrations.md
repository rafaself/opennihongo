# Illustration assets

Illustrations communicate a scene, character, place, or narrative state. They
give context or atmosphere beyond a compact functional symbol. This guide
defines how approved illustration artwork is owned and used. It does not create
an illustration library or authorize unreviewed artwork.

## Illustrations and icons

Use an illustration for storytelling or visual context, such as onboarding,
empty states, achievements, and rewards. Use a functional icon for a concise
action, status, or control affordance. An illustration must not replace a
functional icon, a control's accessible name, or text that explains a state.
Follow the [Functional Icons guide](icons.md) for the icon registry and its
visual and accessibility rules.
Mascot artwork follows the semantic state and asset contract in the
[Mascot guide](mascots.md).

## Ownership and source files

Design System maintainers own the shared art direction and approve assets for
the catalog. A feature owner may request or contribute artwork, but should not
copy, redraw, or embed an unreviewed illustration in feature code. Record the
source and license for any externally created or sourced artwork with the
asset.

Keep approved first-party illustration source files together under
`packages/ui/src/illustrations/`, grouped by stable semantic purpose when the
catalog grows (for example, `onboarding/`, `empty-states/`, `achievements/`,
and `rewards/`). Use lowercase kebab-case names that identify meaning, such as
`empty-lessons.svg` or `achievement-unlocked.svg`. Add a variant suffix only
when the variant changes the composition or meaning, such as
`achievement-unlocked-dark.svg`; avoid filenames based on a route, temporary
copy, dimensions, or revision (`image-final-2.svg`).

Do not put illustration source files in individual feature folders, paste SVG
markup or data URLs into feature components, or fetch artwork from arbitrary
remote URLs. Add an asset to the shared package only after it has an approved
owner, a defined purpose, and a real consumer. Expose artwork through a
purposeful public API when a consumer needs it; do not import package internals
or add a speculative asset registry. The UI Gallery may document and preview
approved public assets, but must not import web-feature internals.

## Art direction and themes

Keep a coherent visual language across the catalog: palette, line weight,
shape language, perspective, and level of detail should feel related. Prefer
clear silhouettes and limited detail that remain legible at the intended
display size. Avoid using arbitrary emoji, stock art, or decorative flourishes
as substitutes for approved illustrations.

Illustrations are artwork, not `currentColor` icons. Use the approved palette
and do not recolor a multicolor image with CSS filters. A single asset should
work in every supported theme when practical. Create an explicit light or dark
variant only when contrast or composition requires it, and preserve the same
meaning in each variant. Theme selection belongs to the consuming component or
asset API, not to an implicit CSS filter.

## Naming, sizing, and responsive use

Name artwork for the concept it represents, independent of where it appears.
Keep important details inside the artboard with enough whitespace that the
image remains balanced beside content. Preserve the source aspect ratio and
avoid cropping unless the crop is intentional and documented.

Set display width relative to the available layout, with a sensible maximum
width for the artwork's intended role. Allow the container to shrink on narrow
screens without distorting the image. Use a separate composition only when a
small-screen layout cannot preserve the artwork's legibility; do not create
variants solely to match incidental component dimensions. Keep intrinsic
dimensions or an aspect ratio in markup or styles so loading artwork does not
cause layout shift.

## Accessibility

Treat artwork as decorative when nearby content already conveys its meaning.
For an HTML image, use `alt=""`; for an inline SVG used only as decoration,
hide it from assistive technology. Do not add an accessible name to decorative
artwork.

When an illustration conveys information that is not available in adjacent
text, provide concise alternative text describing that information or purpose,
not every visual detail. Avoid repeating nearby headings or captions. Do not
put essential instructions, labels, or state text only inside the artwork. If
an image contains essential text, provide the same text in the interface.

## Optimization and loading

Prefer optimized SVG for clean vector artwork and modern compressed raster
formats for textured or painterly images. Keep raster dimensions close to the
largest rendered size and provide responsive sources when materially smaller
downloads are possible. Remove unused metadata and hidden layers from exported
files; avoid oversized assets, embedded bitmap payloads in SVG, and base64 data
URLs.

Load an illustration eagerly only when it is needed for the initial visible
content; defer below-the-fold artwork. Provide intrinsic dimensions or an
aspect ratio and use responsive image sources for large raster assets where
useful. Verify that compression preserves the silhouette, contrast, and
meaning at the actual display size.
