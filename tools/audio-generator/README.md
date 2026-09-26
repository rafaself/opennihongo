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

The Compose service uses VOICEVOX Nemo's CPU image. Its selected speaker,
style, engine version, and attribution are recorded in [voice.json](voice.json).
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

With the VOICEVOX container running, run the generator from the repository
root:

```sh
PYTHONPATH=tools/audio-generator/src python3 -m audio_generator \
  --input /path/to/content.json
```

It checks the running engine's version response against `voice.json` (also
accepting VOICEVOX's Docker `latest` marker) and verifies the configured style.
Metadata records both the configured engine release and the version response.
The generator sends each explicit `reading` to VOICEVOX, converts the returned
WAV to deterministic mono Opus with FFmpeg, and writes `<id>.opus` plus a
metadata sidecar `<id>.json` under `packages/audio-assets/generated/`. Metadata
records the source text and reading, speaker/style, engine version, UTC
generation time, attribution, output format, and audio SHA-256. Outputs are
staged as a batch and are not published if synthesis or encoding fails.

The speaker, engine URL, timeout, FFmpeg executable, and Opus bitrate can be
changed in an alternate config file passed with `--config`. Use `--output-dir`
to write somewhere else. Existing files are preserved by default; pass `--force`
to intentionally replace generated audio and metadata.

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
