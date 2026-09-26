# VOICEVOX Japanese Speech Skill

This file documents the skill's expected Docker setup and its licensing references. The workflow in `SKILL.md` assumes the container is already running and does not perform setup.

## Expected local engine

The helper calls the VOICEVOX HTTP API at `http://127.0.0.1:50021` by default. The host port must be published to the engine's actual listening port and bound to loopback. This repository's reference configuration is [`tools/audio-generator/compose.yaml`](../../../tools/audio-generator/compose.yaml); it pins the image to `0.24.0` and maps host port `50021` to container port `50121`:

```yaml
services:
  voicevox:
    image: voicevox/voicevox_engine:cpu-ubuntu22.04-0.24.0
    ports:
      - "127.0.0.1:50021:50121"
```

The container needs local TCP access for `/speakers`, `/audio_query`, and `/synthesis`. It does not need outbound internet access for synthesis once the image and voice models are available. Keep normal Docker network isolation and loopback port publishing. Docker host networking shares the host network namespace and ignores published-port mappings; it is not part of this workflow. See the official [Docker host network documentation](https://docs.docker.com/engine/network/drivers/host/) and [Compose service reference](https://docs.docker.com/reference/compose-file/services/).

Check the running endpoint with:

```sh
curl -fsS http://127.0.0.1:50021/version
curl -fsS http://127.0.0.1:50021/speakers
```

The helper can use another local loopback port via `VOICEVOX_URL` or `--engine-url`. It intentionally rejects non-loopback URLs. A different Docker image may listen on a different container port; check that image's current documentation rather than assuming the host and container ports match. For a different runtime or connection method, update `SKILL.md`, this README, and the helper as one deliberate change.

## Style IDs and reproducibility

Use `--list-speakers` to discover names and style IDs from the running engine. IDs are engine-specific. This repository's pronunciation pipeline uses VOICEVOX Nemo 女声1 / ノーマル, style ID `10005`, on Engine `0.24.0`; that is an example, not a default for every VOICEVOX engine. For reproducible batches, pin the image release and confirm `/version` matches it before generation. Refer to the [official VOICEVOX Engine repository](https://github.com/VOICEVOX/voicevox_engine) for current engine details.

## Attribution and voice terms

VOICEVOX software terms require a credit that identifies VOICEVOX and require following the selected voice library's terms. The correct voice credit depends on the model; check current official sources before distribution:

- [VOICEVOX software terms](https://voicevox.hiroshiba.jp/term/)
- [VOICEVOX credit guidance](https://voicevox.hiroshiba.jp/qa/)
- The selected voice or model's own terms, linked from its official profile

For example, VOICEVOX Nemo's terms require the exact credit `VOICEVOX Nemo`. Do not use that credit for another voice. The official Q&A describes placing credit at the beginning or end for standalone audio; follow any stricter voice-specific rule. The workflow does not insert credits into the spoken script automatically.
