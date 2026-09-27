# Hiragana chart audio: VOICEVOX Nemo 10000

This collection contains static audio for all 115 tiles in the Hiragana chart:
basic characters, dakuten, combinations, small っ examples, and long vowels.
The matching Katakana chart tiles reuse the corresponding files, including the
five matching long-vowel samples. Each asset has a style-qualified ID, a
metadata sidecar, and an entry in this directory's `.manifest.json` inventory.

The files use VOICEVOX Nemo 男声2 / ノーマル (style ID `10000`) and require the
credit `VOICEVOX Nemo`. The canonical 女声1 catalog remains in the parent
directory and is used by practice and lesson audio. The generator input is
`tools/audio-generator/inputs/kana-chart-hiragana-voice10000.json`.
