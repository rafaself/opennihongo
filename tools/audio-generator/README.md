# Local VOICEVOX generation engine

This directory contains development-only tooling for generating the static
pronunciation assets owned by `@opennihongo/audio-assets`. The VOICEVOX engine
runs in Docker and is not part of the frontend build or production runtime.

## Requirements

- Docker Engine
- Docker Compose v2 (`docker compose`)

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

Use the engine only to create project-owned static audio from curated learning
content. Do not connect its synthesis API to the frontend or a public service,
and do not send arbitrary learner-provided text for synthesis. Generated audio
belongs under `packages/audio-assets/generated/`; the production app consumes
those files without depending on this container.
