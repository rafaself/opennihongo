# Generated pronunciation files

Place generated pronunciation audio here using the stable content identifier
as its filename. Experimental voice variants use a distinct variant identifier
that includes the tested style, such as
`kana.chart.hiragana.a.nemo-10000`; they do not replace canonical audio. The
VOICEVOX generator writes `<audio-id>.opus` audio, a
matching `<audio-id>.json` metadata sidecar, and an aggregate `.manifest.json`
inventory. Keep generation tooling and its engine outside this directory. See
`tools/audio-generator/README.md` for the generation workflow.
