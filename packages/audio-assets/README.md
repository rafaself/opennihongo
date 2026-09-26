# Audio assets

`@opennihongo/audio-assets` owns generated pronunciation files and the public
manifest that resolves content identifiers to asset URLs. It contains no audio
generation engine or playback UI.

## Identifiers and files

Audio identifiers reuse the stable Kana content IDs exported by
`@opennihongo/core`, such as `kana.hiragana.a` and `kana.word.soto`. Do not
derive identifiers from glyphs or display text. Generated Opus files use the
identifier as their filename under `generated/`, for example
`generated/kana.hiragana.a.opus`.

`audioManifest` maps each supported identifier to its package-relative file,
and `resolveAudioAsset(id)` returns the corresponding URL for frontend use.
When new core content is added, add its generated file and manifest entry in the
same change. The audio generator also writes a `.manifest.json` inventory and a
metadata sidecar for each generated file. They record the source and reading,
VOICEVOX speaker and style, engine and generator versions, generation
timestamp, input fingerprint, encoder settings, source and optimized byte
counts, size reduction percentage, and audio checksum.
