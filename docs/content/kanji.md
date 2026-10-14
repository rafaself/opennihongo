# Beginner Kanji authoring

The starter collection has 30 independently authored entries in three themes:
Numbers, Nature, and People and basics. It is a beginner selection, not a
complete curriculum or an official JLPT list.

Each character has a stable `kanji.character.u<hex-codepoint>` identity, a
distinct English meaning label, common on/kun readings, and one example word.
The example supplies display text, its complete Hiragana pronunciation,
romanization, explicit accepted romaji variants, and a contextual English gloss.
Its pronunciation reference contains the stable audio ID and explicit spoken Kana.
Readings are common examples rather than an exhaustive dictionary of every use.
The supplied example gloss distinguishes readings of standalone words such as
月 (moon). Other valid character readings are reference information and are not
automatically accepted for a different example word.

Common on/kun readings and the traditional number forms were checked against
the Agency for Cultural Affairs' [Joyo Kanji reading table](https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/joyokanjisakuin/).
English labels and exercise selection are authored for OpenNihongo. The collection
does not import a third-party dictionary dataset or its definitions.

Reading practice accepts Hiragana, equivalent Katakana (including normalized
half-width input), and each example's explicitly authored romaji forms. Unicode
width and case normalization preserve long vowels and small Kana. For example,
十日 accepts とおか, トオカ, `tooka`, and `tōka`; `toka` and the isolated reading
じゅう are not the reading of that contextual word.

The examples' audio is synthesized from the explicit Kana reading with VOICEVOX
Nemo 女声1 / ノーマル, style 10005, Engine 0.24.0. Inputs are in
`tools/audio-generator/inputs/kanji-beginner.json`; Opus clips and metadata live
in the canonical `packages/audio-assets/generated` inventory. The audio manifest
resolves them by the character's stable ID. Maintain the existing **VOICEVOX Nemo**
credit in Acknowledgements and each generated sidecar.

For content changes, update the example, accepted variants, synthesis input,
recording, and reference tests together. Use the existing generator's validation
and intentional replacement workflow when an audio fingerprint changes.

## Theory references and checks

`kanji/theory.ts` composes a reference for each starter character from the same
canonical collection used by Practice. Its two optional checks connect the glyph
with its meaning and the contextual word with its complete Kana reading. Each
check has one correct choice and two distinct distractors from the same theme,
with an explanation for every choice. Keep this content aligned when changing
character meanings or word readings.

The introduction follows the Japan Foundation's
[Marugoto vocabulary approach](https://marugoto.jpf.go.jp/en/teacher/resource/pre_intermediate/):
learn Kanji through complete words. The common on/kun lists are reference
examples, not exhaustive lists or universal pronunciation rules. The original
English explanations and prompts are authored for OpenNihongo; external
reference material is linked, not bundled.
