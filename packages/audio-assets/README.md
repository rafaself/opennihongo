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

`audioManifest` maps each supported identifier to its package-relative file.
Frontend code should call `getAudioAsset(id)` from `@opennihongo/audio-assets`
instead of constructing asset paths. It returns the bundled URL when the ID is
in the manifest and its generated file exists, or `undefined` when the ID or
file is missing. The manifest derives supported IDs from the core syllabaries
and beginner words, so generated files must ship with any new core content.
The audio generator also writes a `.manifest.json` inventory and a metadata
sidecar for each generated file. They record the source and reading, VOICEVOX
speaker and style, engine and generator versions, generation timestamp, input
fingerprint, encoder settings, source and optimized byte counts, size reduction
percentage, and audio checksum.

The initial pronunciation catalog covers the 46 basic Hiragana characters, 46
basic Katakana characters, and the five seeded beginner words. Exercise audio
references are checked against the same manifest.

The Hiragana chart uses a separate VOICEVOX Nemo 男声2 / ノーマル voice set
(style ID `10000`) in
`generated/kana-chart-hiragana-nemo-10000/`. It includes all 115 chart tiles:
basic characters, dakuten, combinations, small っ examples, and long vowels.
`kanaChartAudioManifest` maps both Hiragana and corresponding Katakana tile IDs
to these shared assets by chart position. Katakana long-vowel tiles use the
matching Hiragana long-vowel clips. The collection has its own `.manifest.json`;
the canonical `audioManifest` and its 女声1 / ノーマル (10005) assets remain
unchanged.
