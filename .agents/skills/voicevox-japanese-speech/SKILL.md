---
name: voicevox-japanese-speech
description: Generate Japanese speech WAV files with an already-running local VOICEVOX Docker Engine.
---

# VOICEVOX Japanese Speech

Follow this workflow as written: the local VOICEVOX Docker container is already configured and running at `http://127.0.0.1:50021` (or at the configured `VOICEVOX_URL`). Do not install, download, start, stop, or reconfigure the engine during ordinary generation. If this setup does not work, stop and consult the skill's [README](README.md); another setup requires an intentional workflow change.

## Workflow

1. Preserve the user's exact spoken text. If a kanji, name, or number has an important ambiguous reading, use a supplied kana reading or ask.
2. List the styles available from this engine and resolve the requested voice to its live style ID:

   ```sh
   python3 .agents/skills/voicevox-japanese-speech/scripts/synthesize.py --list-speakers
   ```

   If no voice is specified, choose a clear, neutral Japanese style when appropriate. Do not assume style IDs are shared across engines.

3. Generate a WAV at the requested destination. Use `--text-file` for long input and `--reading` when the user supplies a pronunciation that should be spoken instead of the written text:

   ```sh
   python3 .agents/skills/voicevox-japanese-speech/scripts/synthesize.py \
     --style-id 10005 \
     --text 'こんにちは。' \
     --output ./generated_audio/hello.wav
   ```

   The helper refuses remote engine URLs and existing output files unless `--overwrite` is passed.

4. Confirm the file exists and has valid WAV data. If another format was requested, convert the WAV, verify the result, and clean up any temporary file. Listen for truncation or obvious pronunciation problems when playback is available.
5. Report the speaker/style and absolute output path. For audio that will be shared or published, check the selected voice's current credit rules in the [README](README.md) and preserve its required attribution. Do not add spoken credits to the requested script unless asked.

The helper and README live beside this skill. If a different engine or connection method is needed, update the workflow and helper together before using it.
