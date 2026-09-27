# Local VOICEVOX generation engine

This directory contains development-only tooling for generating the static
pronunciation assets owned by `@opennihongo/audio-assets`. The VOICEVOX engine
runs in Docker and is not part of the frontend build or production runtime.

## Requirements

- Docker Engine
- Docker Compose v2 (`docker compose`)
- Python 3.11 or newer
- FFmpeg with the `libopus` encoder enabled

## Start and stop

Run these commands from the repository root:

```sh
docker compose -f tools/audio-generator/compose.yaml up -d
```

The engine API and interactive documentation are available at
<http://127.0.0.1:50021> and <http://127.0.0.1:50021/docs>. The host port is
bound to loopback and forwards to the engine's default container port 50121,
so other machines cannot reach it through this port mapping.

To follow startup logs:

```sh
docker compose -f tools/audio-generator/compose.yaml logs -f voicevox
```

Stop and remove the container with:

```sh
docker compose -f tools/audio-generator/compose.yaml down
```

The Compose service uses the VOICEVOX CPU image pinned to release 0.24.0. Its
selected Nemo speaker, style, engine version, and attribution are recorded in
[voice.json](voice.json).
See [speaker selection](../../docs/audio/voicevox-speaker-selection.md) for the
selection rationale and licensing requirements.

## Generate pronunciation assets

Create a UTF-8 JSON content file. It can contain one definition or an array for
batch generation:

```json
[
  {
    "id": "nihongo",
    "text": "日本語",
    "reading": "にほんご"
  }
]
```

The generator has two canonical inputs and one separate chart voice collection:

- [`inputs/kana-syllabary.json`](inputs/kana-syllabary.json) contains the 46
  basic Hiragana and 46 basic Katakana characters. Its stable IDs and glyphs
  mirror `packages/core/src/kana/hiragana.ts` and
  `packages/core/src/kana/katakana.ts`.
- [`inputs/kana-practice.json`](inputs/kana-practice.json) contains the seeded
  Hiragana vowels and beginner vocabulary from `packages/core/src/kana/`.
- [`inputs/kana-chart-hiragana-voice10000.json`](inputs/kana-chart-hiragana-voice10000.json)
  contains all 115 tiles from the Hiragana chart: basic characters, dakuten,
  combinations, small っ examples, and long vowels. It uses the chart's speech
  text for each tile and a unique style-qualified asset ID. The Katakana chart
  reuses the corresponding Hiragana clips, so no duplicate Katakana audio set
  is generated.

Keep IDs, display text, and Japanese readings aligned with the core content.
With the VOICEVOX container running, generate both inputs from the repository
root:

```sh
PYTHONPATH=tools/audio-generator/src python3 -m audio_generator \
  --input tools/audio-generator/inputs/kana-syllabary.json
PYTHONPATH=tools/audio-generator/src python3 -m audio_generator \
  --input tools/audio-generator/inputs/kana-practice.json
```

For the Hiragana chart voice set, use its separate 男声2 / ノーマル
configuration, collection directory, and the running container's internal
Engine endpoint:

```sh
PYTHONPATH=tools/audio-generator/src python3 -m audio_generator \
  --config tools/audio-generator/voice-nemo-male2.json \
  --docker-container audio-generator-voicevox-1 \
  --output-dir packages/audio-assets/generated/kana-chart-hiragana-nemo-10000 \
  --input tools/audio-generator/inputs/kana-chart-hiragana-voice10000.json
```

The alternate config pins style ID `10000`, engine `0.24.0`, and
`http://127.0.0.1:50121` as seen from inside the existing VOICEVOX container.
Its request timeout is 180 seconds to tolerate slower CPU synthesis calls.
`--docker-container` runs only `curl` through `docker exec`, so this command
works when the host's published loopback port is unavailable. It does not
start, stop, or reconfigure the engine. The target container must already be
running, trusted, and contain `curl`; Docker CLI access is required. The normal
generator configuration continues to use `http://127.0.0.1:50021` from the
host.

The generator checks that the running engine reports the exact version in the
selected configuration and verifies the configured style. Unversioned
responses such as `latest` are rejected.
Metadata records both the configured engine release and the version response.
The generator sends each explicit `reading` to VOICEVOX, converts the returned
WAV to deterministic mono Opus with FFmpeg, and writes `<id>.opus` plus a
metadata sidecar `<id>.json` under `packages/audio-assets/generated/`. It also
maintains `.manifest.json` as an inventory of every sidecar and its matching
audio checksum. Metadata records the source text and reading, VOICEVOX speaker
UUID and style ID, engine and generator versions, UTC generation time,
attribution, output format, SHA-256 checksum, and a fingerprint of all
generation inputs. Matching assets are reused without synthesis; changed inputs
require `--force` before existing audio is replaced. Outputs are staged as a
batch and are not published unless the complete Opus stream, metadata, checksum,
and updated inventory pass validation. Retained assets are checked before they
are carried into the new inventory, and unpaired audio files are rejected.
Successful generation reports how many requested assets passed validation.
The chart collection's own `.manifest.json` keeps its assets together and apart
from the canonical 女声1 catalog. The generator reuses matching assets already
in the collection and synthesizes missing tiles.

To audit an already generated directory without contacting VOICEVOX, run:

```sh
PYTHONPATH=tools/audio-generator/src python3 -m audio_generator \
  --validate-only
PYTHONPATH=tools/audio-generator/src python3 -m audio_generator \
  --validate-only \
  --output-dir packages/audio-assets/generated/kana-chart-hiragana-nemo-10000
```

The validator checks that every audio file and metadata sidecar exists, parses
as the supported non-empty Ogg Opus format, passes Ogg page CRC checks, and
agrees on the audio SHA-256, synthesis fingerprint, metadata sizes, and
`.manifest.json` inventory. It also rejects orphan audio files. Use
`--output-dir` to validate a different collection directory. Validate each
collection separately because each one has its own inventory.

The speaker, engine URL, timeout, FFmpeg executable, and Opus bitrate can be
changed in an alternate config file passed with `--config`. Use
`--docker-container` only when routing requests through the named running
container; in that mode, `engine_url` must be its loopback URL. Use
`--output-dir` to write somewhere else. Complete assets with matching
fingerprints are reused.
Changed inputs or incomplete existing assets are left untouched unless
`--force` is passed to regenerate them.

The default encoder profile is mono Opus at 48 kHz and 32 kb/s constant bitrate,
with FFmpeg's `voip` application mode, which favors speech intelligibility
([FFmpeg libopus options](https://ffmpeg.org/ffmpeg-codecs.html#libopus)). The
voice-focused profile preserves a consistent bitrate for short pronunciation
clips while keeping files much smaller than their PCM WAV sources. The
generation fingerprint and sidecar record the bitrate, channel count, sample
rate, application mode, VBR mode, source and optimized byte counts, and size
reduction percentage. Each input must be a non-empty, complete PCM WAV, and the
batch is rejected before publication if any encoded asset is not smaller than
its source.

The Python package uses only the standard library. FFmpeg is a development-time
system tool and is not included in the production application.

Run the generator's standard-library test suite from the repository root with:

```sh
PYTHONPATH=tools/audio-generator/src python3 -m unittest discover \
  -s tools/audio-generator/tests -v
```

Use the engine only to create project-owned static audio from curated learning
content. Do not connect its synthesis API to the frontend or a public service,
and do not send arbitrary learner-provided text for synthesis. Generated audio
belongs under `packages/audio-assets/generated/`; the production app consumes
those files without depending on this container.
