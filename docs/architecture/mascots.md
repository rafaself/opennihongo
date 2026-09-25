# Mascot state and asset contract

This guide defines a semantic contract for optional mascot artwork. It does not
select a character, create final artwork, or require a mascot to ship. A product
may omit mascot content entirely.

## Initial state vocabulary

The initial state vocabulary is finite:

| State          | Intended cue                                                              |
| -------------- | ------------------------------------------------------------------------- |
| `idle`         | Neutral presence when no specific emotional cue is needed.                |
| `happy`        | A positive, low-intensity moment.                                         |
| `excited`      | A high-energy positive milestone; use more sparingly than `happy`.        |
| `encouraging`  | Support before or during a challenge, or empathy after a setback.         |
| `thinking`     | Reflection, consideration, or a pause.                                    |
| `celebrating`  | A confirmed milestone or reward moment.                                   |
| `warning`      | A caution cue whose meaning is already stated by the product interface.   |
| `disappointed` | Empathy for an outcome explained by the product; never blame the learner. |

These are presentation cues, not learning, validation, reward, or workflow
states. Product logic decides what happened; the feature supplies the matching
visible message. Add a state only for a real consumer and a distinct reusable
cue. Do not grow the vocabulary with synonyms, character-specific poses, or
localized labels.

## Asset naming and consumer contract

Design System maintainers own the shared mascot art direction and approve
artwork. Keep approved first-party sources under
`packages/ui/src/illustrations/mascot/`, with stable names such as
`mascot-idle.svg` and `mascot-celebrating.svg`. Record source and license
information for externally created artwork. Feature code must not copy artwork,
embed SVG markup or data URLs, load arbitrary remote assets, or import
package-internal files.

When an approved asset and real consumer exist, expose one shared semantic
component with a required `state` drawn from the vocabulary above. Consumers
request a cue through that state, for example `<Mascot state="celebrating" />`;
they do not import individual poses or use pose-specific components such as
`<CelebratingMascot />`. The component owns the mapping from state to asset.
State keys stay language-independent; localized copy belongs to the consuming
feature. This document defines the future contract only and does not add a
component or artwork.

Use one suitable asset across supported themes when practical. Add a theme
variant only when contrast or composition requires it, while preserving the
same state meaning. Keep the mascot optional at every size and breakpoint; its
absence must not hide content or block an interaction.

## Missing artwork and fallback

If a requested state has no approved asset, use the approved `idle` asset. An
unsupported runtime state follows the same fallback, while the typed public API
should reject unsupported state names during development. Keep this mapping
inside the shared asset/component layer so features do not need fallback logic.
If a non-idle image fails to load, try the `idle` asset once. If the `idle`
artwork is missing or fails to load, omit the mascot without showing a
broken-image placeholder or substituting artwork with a different meaning.
Product content and behavior continue normally in every case.

## Accessibility and status text

Mascot artwork is decorative by default and must not add a redundant accessible
name. If a future use conveys information that is not available elsewhere, its
consumer may provide a concise accessible description, but that description
does not replace the feature's visible status text.

Always express success, progress, errors, warnings, and required actions in
visible text with the appropriate semantics. The `warning` cue alone is not an
alert, and an emotional pose is not a status announcement. Keep status roles,
live-region behavior, and localized messages with the feature that owns the
underlying state. A user who cannot see the mascot must receive the same
essential information and be able to complete the same task.

Mascot artwork does not need animation to express a state. If motion is later
added, follow the shared [motion token guide](motion-tokens.md) and provide a
static presentation when reduced motion is requested.
