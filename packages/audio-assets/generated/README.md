# Generated pronunciation files

The root of this directory holds the canonical pronunciation catalog, with
one `<audio-id>.opus` file and matching `<audio-id>.json` sidecar for each
content ID. Keep alternate voice collections in their own named subdirectory,
with a separate `.manifest.json` inventory for each collection. For example,
`kana-chart-hiragana-nemo-10000/` contains the complete Hiragana chart set from
VOICEVOX Nemo 男声2 / ノーマル. Style-qualified IDs preserve the relationship
between each alternate file and its voice. Keep generation tooling and its
engine outside this directory. See `tools/audio-generator/README.md` for the
generation and validation workflow.
