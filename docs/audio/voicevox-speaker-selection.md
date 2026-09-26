# VOICEVOX speaker selection

Issue #107 records the initial speaker for the pronunciation asset pipeline.

## Decision

Use VOICEVOX Nemo, speaker 女声1, style ノーマル, style ID 10005, with VOICEVOX Nemo Engine 0.24.0. The machine-readable selection is in [voice.json](../../tools/audio-generator/voice.json), so the generation tool can load the same speaker and attribution settings.

VOICEVOX names the synthesis API parameter `speaker` for compatibility, but its value is a style ID. The selected configuration therefore stores the explicit `style_id` field. The engine must expose style ID 10005 for 女声1 / ノーマル; the generator should fail clearly if its installed engine does not.

## Comparison

This first-pass review compares official voice descriptions and stated usage terms for a shortlist. It is a qualitative selection, not a blinded listening or pronunciation-error benchmark. The generator should use identical sample text when validating the voice in its actual engine environment.

| Candidate                      | Clarity and delivery                                          | Fit for study audio                                                                                                                                                                                                                 | Decision                           |
| ------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| VOICEVOX Nemo 女声1 / ノーマル | Official materials describe it as transparent and calm.       | Nemo is characterless and intended for neutral use across settings, which keeps repeated word and phrase readings from inheriting a fictional character persona.                                                                    | Selected.                          |
| 四国めたん / ノーマル          | Official materials describe a clear voice with a strong core. | Strong articulation is promising, but the named character gives the default voice a more distinct persona than the neutral delivery requested by the epic.                                                                          | Considered; neutral fit is weaker. |
| ずんだもん / ノーマル          | Official materials describe a high, childlike voice.          | Its distinctive register and character are less suitable as a neutral reference voice for repeated beginner drills.                                                                                                                 | Not selected.                      |
| もち子さん / ノーマル          | Official materials describe a clear, gentle voice.            | The voice library requires the voice actor credit and prior contact for enterprise use; its terms also restrict distributing generated audio materials without prior contact. That is a poor fit for reusable pronunciation assets. | Not selected.                      |

The shortlist is intentionally small: it compares the neutral option against two widely available character voices and one especially clear, gentle option whose usage terms add constraints relevant to generated assets.

## Licensing and attribution

- The VOICEVOX software terms require a credit identifying VOICEVOX and require generated audio to follow the selected voice library's terms.
- The VOICEVOX Nemo terms allow commercial and non-commercial use of generated audio when credited. The required text is exactly “VOICEVOX Nemo”. Record this credit wherever the application exposes its audio and license credits. The official Q&A recommends an audible credit at the beginning or end when audio is used on its own; standalone redistribution or reuse of a clip must preserve the required credit in that context.
- The Nemo Engine is a separate development-time tool. Its source repository offers LGPL v3 and an alternate license by request. Run it only in the generation environment; the production app consumes generated static audio and must not depend on or redistribute the engine.
- Recheck the linked terms before producing or publishing the audio library because speaker licenses and engine releases can change.

## Sources

- [VOICEVOX Nemo overview](https://voicevox.hiroshiba.jp/nemo/) describes the characterless voice library and its intended broad, neutral use.
- [VOICEVOX Nemo voice descriptions](https://prtimes.jp/main/html/rd/p/000000001.000132725.html) describes 女声1 as transparent and calm, alongside the other Nemo voices.
- [VOICEVOX Nemo terms](https://voicevox.hiroshiba.jp/nemo/term/) state the required attribution and permitted use.
- [VOICEVOX software terms](https://voicevox.hiroshiba.jp/term/) cover the engine's general credit and voice-library requirements.
- [VOICEVOX audio model list](https://github.com/VOICEVOX/voicevox_vvm/blob/main/README.md) maps Nemo 女声1 / ノーマル to style ID 10005 and documents model and library terms.
- [VOICEVOX Nemo Engine 0.24.0](https://github.com/VOICEVOX/voicevox_nemo_engine/releases/tag/0.24.0) is the latest stable engine release selected for reproducible generation.
- [VOICEVOX Nemo Engine license](https://github.com/VOICEVOX/voicevox_nemo_engine/blob/master/LICENSE) describes the LGPL v3 and alternate-license terms.
- [四国めたん profile](https://voicevox.hiroshiba.jp/product/shikoku_metan/), [ずんだもん profile](https://voicevox.hiroshiba.jp/product/zundamon/), and [もち子さん profile](https://voicevox.hiroshiba.jp/product/mochikosan/) support the comparison above. See the [もち子さん terms](https://vtubermochio.wixsite.com/mochizora/%E5%88%A9%E7%94%A8%E8%A6%8F%E7%B4%84) for its additional credit and distribution requirements.
