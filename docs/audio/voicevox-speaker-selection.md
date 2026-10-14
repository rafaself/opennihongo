# VOICEVOX speaker selection

## Selected voices

Use these four VOICEVOX Nemo styles for Japanese speech generation:

| Voice and style  | Style ID | Official voice description |
| ---------------- | -------: | -------------------------- |
| 女声1 / ノーマル |    10005 | Transparent and calm       |
| 男声3 / ノーマル |    10002 | Energetic yet calm         |
| 男声2 / ノーマル |    10000 | Deep and weighty           |
| 女声6 / ノーマル |    10006 | Fresh and reassuring       |

Nemo is a characterless voice library. These four styles use the same Nemo audio terms and required credit; choosing a different style does not change the permissions.

## Listen to the samples

[Play the four-voice comparison](voice-comparison/four-nemo-voices.wav). It sequences the retained samples in the order below, with a one-second pause between voices. Individual clips are available for focused listening.

| Order | Voice and style  | Style ID | Individual sample                                 |
| ----: | ---------------- | -------: | ------------------------------------------------- |
|     1 | 女声1 / ノーマル |    10005 | [WAV](voice-comparison/10005-female-1-normal.wav) |
|     2 | 男声3 / ノーマル |    10002 | [WAV](voice-comparison/10002-male-3-normal.wav)   |
|     3 | 男声2 / ノーマル |    10000 | [WAV](voice-comparison/10000-male-2-normal.wav)   |
|     4 | 女声6 / ノーマル |    10006 | [WAV](voice-comparison/10006-female-6-normal.wav) |

## Usage terms and credit

Generated audio may be used commercially or non-commercially when credited as **VOICEVOX Nemo**. The terms prohibit use without credit, uses grossly against public morals or damaging VOICEVOX's or the voice provider's reputation or image, rights violations, false attribution, promoting crime, machine-learning use, and other violations of the terms. Review the linked terms again before publishing generated audio because they may change.

Keep the credit with the audio wherever the application presents its audio and license credits. The VOICEVOX software terms also require identifying VOICEVOX and following the selected voice library's terms.

## Production status

The canonical pronunciation catalog, beginner word audio, and 30 Kanji
example-word recordings use 女声1 /
ノーマル (10005), configured in [voice.json](../../tools/audio-generator/voice.json).
Every tile in the Hiragana chart uses VOICEVOX Nemo 男声2 / ノーマル (10000)
audio. The Katakana chart reuses the corresponding clips, including matching
long-vowel samples. The 115 clips cover basic characters, dakuten,
combinations, small っ examples, and long vowels. They are organized under
`packages/audio-assets/generated/kana-chart-hiragana-nemo-10000/`, with
style-qualified IDs and a collection-specific manifest, so they do not replace
canonical lesson or practice assets. The set's configuration and input are
[voice-nemo-male2.json](../../tools/audio-generator/voice-nemo-male2.json) and
[kana-chart-hiragana-voice10000.json](../../tools/audio-generator/inputs/kana-chart-hiragana-voice10000.json).
Always confirm a style ID in the running engine's `/speakers` response before
generating with it.

## Sources

- [VOICEVOX Nemo overview](https://voicevox.hiroshiba.jp/nemo/) describes Nemo as a characterless voice library.
- [VOICEVOX Nemo terms](https://voicevox.hiroshiba.jp/nemo/term/) specify the required credit, permitted uses, and restrictions.
- [VOICEVOX audio model list](https://github.com/VOICEVOX/voicevox_vvm/blob/main/README.md) maps Nemo style names to style IDs and repeats the required Nemo credit.
- [VOICEVOX Nemo voice descriptions](https://prtimes.jp/main/html/rd/p/000000001.000132725.html) describes 女声1, 男声2, 男声3, and 女声6.
- [VOICEVOX software terms](https://voicevox.hiroshiba.jp/term/) cover VOICEVOX credit and use of each voice library under its own terms.
