---
name: voicevox-japanese-speech
description: Generate Japanese speech WAV files with an already-running local VOICEVOX Docker Engine.
---

# VOICEVOX Japanese Speech

Follow this workflow using the already-running local VOICEVOX Engine. Prefer its loopback host endpoint at `http://127.0.0.1:50021` (or the configured `VOICEVOX_URL`). If host-to-container port forwarding is unavailable, the helper also supports an explicit `docker exec` transport; consult the skill's [README](README.md) for the exact command. Do not install, download, start, stop, or reconfigure the engine during ordinary generation.

## Workflow

1. Preserve the user's exact spoken text. If a kanji, name, or number has an important ambiguous reading, use a supplied kana reading or ask.
2. List the styles available from this engine and resolve the requested voice to its live style ID:

   ```sh
   python3 .agents/skills/voicevox-japanese-speech/scripts/synthesize.py --list-speakers
   ```

   If host port forwarding is unavailable, pass the same `--docker-container` and container-local `--engine-url` options described in the [README](README.md) to this command too. If no voice is specified, choose a clear, neutral Japanese style when appropriate. Do not assume style IDs are shared across engines.

3. Generate a WAV at the requested destination. Use `--text-file` for long input and `--reading` when the user supplies a pronunciation that should be spoken instead of the written text:

   ```sh
   python3 .agents/skills/voicevox-japanese-speech/scripts/synthesize.py \
     --style-id 10005 \
     --text 'こんにちは。' \
     --output ./generated_audio/hello.wav
   ```

   For a Docker-internal request, add `--docker-container <running-container>` and set `--engine-url` to the Engine's loopback URL inside that container, for example `http://127.0.0.1:50121` for this repository's pinned image.

   The helper refuses remote engine URLs and existing output files unless `--overwrite` is passed.

4. Confirm the file exists and has valid WAV data. If another format was requested, convert the WAV, verify the result, and clean up any temporary file. Listen for truncation or obvious pronunciation problems when playback is available.
5. Report the speaker/style and absolute output path. For audio that will be shared or published, check the selected voice's current credit rules in the [README](README.md) and preserve its required attribution. Do not add spoken credits to the requested script unless asked.

The helper and README live beside the skill. Keep the documented connection methods synchronized with the helper.
