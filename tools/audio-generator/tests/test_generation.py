import hashlib
import io
import json
import tempfile
import unittest
import wave
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

from audio_generator.config import load_config
from audio_generator.generation import GenerationError, generate_batch
from audio_generator.models import AudioDefinition
from audio_generator.transcoder import (
    FfmpegTranscoder,
    TranscodeError,
    normalize_ogg_serial,
)


def make_ogg_page(serial: int) -> bytes:
    packet = b"OpusHead" + bytes(11)
    return (
        b"OggS"
        + bytes([0, 2])
        + bytes(8)
        + serial.to_bytes(4, "little")
        + bytes(4)
        + bytes(4)
        + bytes([1, len(packet)])
        + packet
    )


OPUS = normalize_ogg_serial(make_ogg_page(0))


def make_wav() -> bytes:
    output = io.BytesIO()
    with wave.open(output, "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(24000)
        audio.writeframes(bytes(2400))
    return output.getvalue()


class FakeClient:
    config = load_config(Path(__file__).resolve().parents[1] / "voice.json")
    speaker_id = "speaker-uuid"

    def __init__(self) -> None:
        self.definitions: list[AudioDefinition] = []

    def verify_engine(self) -> tuple[str, str]:
        return "0.24.0", self.speaker_id

    def synthesize(self, definition: AudioDefinition) -> bytes:
        self.definitions.append(definition)
        return b"RIFF" + bytes(1024)


class FakeTranscoder:
    def version(self) -> str:
        return "ffmpeg version 7.1.5"

    def convert_wav_to_opus(self, _wav: bytes) -> bytes:
        return OPUS


class GenerationTests(unittest.TestCase):
    def test_generates_opus_and_metadata_for_a_batch(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory) / "generated"
            generated_at = datetime(2026, 9, 26, tzinfo=timezone.utc)
            definitions = [
                AudioDefinition("nihongo", "日本語", "にほんご"),
                AudioDefinition("kana.hiragana.a", "あ", "あ"),
            ]
            results = generate_batch(
                definitions,
                FakeClient(),
                FakeTranscoder(),
                output_dir,
                generated_at=generated_at,
            )

            self.assertEqual(
                results.generated,
                (output_dir / "nihongo.opus", output_dir / "kana.hiragana.a.opus"),
            )
            self.assertEqual(results.reused, ())
            self.assertEqual((output_dir / "nihongo.opus").read_bytes(), OPUS)
            self.assertEqual((output_dir / "kana.hiragana.a.opus").read_bytes(), OPUS)
            metadata = json.loads(
                (output_dir / "nihongo.json").read_text(encoding="utf-8")
            )
            self.assertEqual(metadata["reading"], "にほんご")
            self.assertEqual(metadata["text"], "日本語")
            self.assertEqual(metadata["id"], "nihongo")
            self.assertEqual(metadata["engine_version"], "0.24.0")
            self.assertEqual(metadata["engine_version_reported"], "0.24.0")
            self.assertEqual(metadata["speaker_name"], "女声1")
            self.assertEqual(metadata["style_id"], 10005)
            self.assertEqual(metadata["style_name"], "ノーマル")
            self.assertEqual(metadata["ffmpeg_version"], "ffmpeg version 7.1.5")
            self.assertEqual(metadata["metadata_version"], 3)
            self.assertEqual(metadata["generator_version"], "0.1.0")
            self.assertEqual(metadata["opus_application"], "voip")
            self.assertEqual(metadata["opus_bitrate"], "32k")
            self.assertEqual(metadata["opus_channels"], 1)
            self.assertEqual(metadata["opus_sample_rate_hz"], 48000)
            self.assertEqual(metadata["opus_vbr_mode"], "off")
            self.assertEqual(metadata["source_wav_size_bytes"], 1028)
            self.assertEqual(metadata["optimized_size_bytes"], len(OPUS))
            self.assertGreater(metadata["size_reduction_percent"], 90)
            self.assertEqual(metadata["speaker_id"], "speaker-uuid")
            self.assertTrue(metadata["attribution_required"])
            self.assertTrue(metadata["terms_url"].startswith("https://"))
            self.assertEqual(metadata["generated_at_utc"], "2026-09-26T00:00:00+00:00")
            self.assertEqual(len(metadata["sha256"]), 64)
            self.assertEqual(metadata["sha256"], hashlib.sha256(OPUS).hexdigest())
            self.assertEqual(len(metadata["generation_fingerprint"]), 64)
            manifest = json.loads(
                (output_dir / ".manifest.json").read_text(encoding="utf-8")
            )
            self.assertEqual(manifest["manifest_version"], 1)
            self.assertEqual(
                manifest["assets"]["nihongo"],
                {
                    "audio_file": "nihongo.opus",
                    "generation_fingerprint": metadata["generation_fingerprint"],
                    "metadata_file": "nihongo.json",
                    "sha256": metadata["sha256"],
                },
            )

    def test_reuses_assets_when_generation_inputs_are_unchanged(self) -> None:
        definition = AudioDefinition("nihongo", "日本語", "にほんご")
        timestamp = datetime(2026, 9, 26, tzinfo=timezone.utc)
        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory)
            generate_batch(
                [definition],
                FakeClient(),
                FakeTranscoder(),
                output_dir,
                generated_at=timestamp,
            )
            metadata_before = (output_dir / "nihongo.json").read_bytes()
            second_client = FakeClient()

            second = generate_batch(
                [definition], second_client, FakeTranscoder(), output_dir
            )

            self.assertEqual(second.generated, ())
            self.assertEqual(second.reused, (output_dir / "nihongo.opus",))
            self.assertEqual(second_client.definitions, [])
            self.assertEqual((output_dir / "nihongo.json").read_bytes(), metadata_before)

    def test_manifest_keeps_assets_from_previous_batches(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory)
            generate_batch(
                [AudioDefinition("nihongo", "日本語", "にほんご")],
                FakeClient(),
                FakeTranscoder(),
                output_dir,
            )
            generate_batch(
                [AudioDefinition("tokyo", "東京", "とうきょう")],
                FakeClient(),
                FakeTranscoder(),
                output_dir,
            )

            manifest = json.loads(
                (output_dir / ".manifest.json").read_text(encoding="utf-8")
            )
            self.assertEqual(set(manifest["assets"]), {"nihongo", "tokyo"})

    def test_force_replaces_changed_inputs_and_refreshes_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory)
            generate_batch(
                [AudioDefinition("nihongo", "日本語", "にほんご")],
                FakeClient(),
                FakeTranscoder(),
                output_dir,
            )
            previous_metadata = json.loads(
                (output_dir / "nihongo.json").read_text(encoding="utf-8")
            )
            replacement = AudioDefinition("nihongo", "日本語", "ニホンゴ")

            result = generate_batch(
                [replacement],
                FakeClient(),
                FakeTranscoder(),
                output_dir,
                force=True,
            )

            current_metadata = json.loads(
                (output_dir / "nihongo.json").read_text(encoding="utf-8")
            )
            self.assertEqual(result.generated, (output_dir / "nihongo.opus",))
            self.assertEqual(current_metadata["reading"], "ニホンゴ")
            self.assertNotEqual(
                current_metadata["generation_fingerprint"],
                previous_metadata["generation_fingerprint"],
            )

    def test_rejects_audio_that_no_longer_matches_its_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory)
            generate_batch(
                [AudioDefinition("nihongo", "日本語", "にほんご")],
                FakeClient(),
                FakeTranscoder(),
                output_dir,
            )
            (output_dir / "nihongo.opus").write_bytes(b"changed")

            with self.assertRaisesRegex(GenerationError, "audio checksum"):
                generate_batch(
                    [AudioDefinition("nihongo", "日本語", "にほんご")],
                    FakeClient(),
                    FakeTranscoder(),
                    output_dir,
                )

    def test_rejects_changed_inputs_without_force(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory)
            generate_batch(
                [AudioDefinition("nihongo", "日本語", "にほんご")],
                FakeClient(),
                FakeTranscoder(),
                output_dir,
            )
            replacement_client = FakeClient()

            with self.assertRaisesRegex(GenerationError, "use --force"):
                generate_batch(
                    [AudioDefinition("nihongo", "日本語", "ニホンゴ")],
                    replacement_client,
                    FakeTranscoder(),
                    output_dir,
                )

            self.assertEqual(replacement_client.definitions, [])

    def test_refuses_to_overwrite_without_force(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory)
            (output_dir / "nihongo.opus").write_bytes(OPUS)

            with self.assertRaisesRegex(GenerationError, "incomplete existing asset"):
                generate_batch(
                    [AudioDefinition("nihongo", "日本語", "にほんご")],
                    FakeClient(),
                    FakeTranscoder(),
                    output_dir,
                )

    def test_rejects_output_that_does_not_compress_the_wav(self) -> None:
        class SmallWavClient(FakeClient):
            def synthesize(self, definition: AudioDefinition) -> bytes:
                self.definitions.append(definition)
                return b"RIFF1234"

        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory) / "generated"
            with self.assertRaisesRegex(GenerationError, "not smaller"):
                generate_batch(
                    [AudioDefinition("short", "あ", "あ")],
                    SmallWavClient(),
                    FakeTranscoder(),
                    output_dir,
                )

            self.assertFalse(output_dir.exists())

    def test_rejects_naive_generation_timestamps(self) -> None:
        with (
            tempfile.TemporaryDirectory() as directory,
            self.assertRaisesRegex(GenerationError, "include a timezone"),
        ):
            generate_batch(
                [AudioDefinition("nihongo", "日本語", "にほんご")],
                FakeClient(),
                FakeTranscoder(),
                directory,
                generated_at=datetime(2026, 9, 26),  # noqa: DTZ001
            )

    def test_failed_batch_does_not_publish_staged_files(self) -> None:
        client = FakeClient()

        class FailingTranscoder:
            def __init__(self) -> None:
                self.calls = 0

            def version(self) -> str:
                return "ffmpeg version 7.1.5"

            def convert_wav_to_opus(self, _wav: bytes) -> bytes:
                self.calls += 1
                if self.calls == 1:
                    return OPUS
                raise TranscodeError("failed")

        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory) / "generated"
            with self.assertRaises(TranscodeError):
                generate_batch(
                    [
                        AudioDefinition("nihongo", "日本語", "にほんご"),
                        AudioDefinition("kana.hiragana.a", "あ", "あ"),
                    ],
                    client,
                    FailingTranscoder(),
                    output_dir,
                )

            self.assertFalse(output_dir.exists())

    def test_repeated_generation_with_force_is_byte_for_byte_repeatable(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory)
            client = FakeClient()
            timestamp = datetime(2026, 9, 26, tzinfo=timezone.utc)
            generate_batch(
                [AudioDefinition("nihongo", "日本語", "にほんご")],
                client,
                FakeTranscoder(),
                output_dir,
                generated_at=timestamp,
            )
            first_audio = (output_dir / "nihongo.opus").read_bytes()
            first_metadata = (output_dir / "nihongo.json").read_bytes()
            generate_batch(
                [AudioDefinition("nihongo", "日本語", "にほんご")],
                client,
                FakeTranscoder(),
                output_dir,
                force=True,
                generated_at=timestamp,
            )
            self.assertEqual((output_dir / "nihongo.opus").read_bytes(), first_audio)
            self.assertEqual((output_dir / "nihongo.json").read_bytes(), first_metadata)

    def test_transcoder_normalizes_random_ogg_serials(self) -> None:
        outputs = [make_ogg_page(1024), make_ogg_page(38419)]
        completed = [
            type("Completed", (), {"returncode": 0, "stdout": audio, "stderr": b""})()
            for audio in outputs
        ]
        with patch(
            "audio_generator.transcoder.subprocess.run", side_effect=completed
        ) as run:
            transcoder = FfmpegTranscoder("ffmpeg", "32k")
            first = transcoder.convert_wav_to_opus(make_wav())
            second = transcoder.convert_wav_to_opus(make_wav())

        self.assertEqual(first, second)
        self.assertEqual(first[14:18], bytes(4))
        self.assertEqual(len(run.call_args_list), 2)
        arguments = run.call_args.args[0]
        self.assertIn("+bitexact", arguments)
        self.assertIn("32k", arguments)
        self.assertIn("opus", arguments)

    def test_transcoder_reports_external_ffmpeg_version(self) -> None:
        completed = type(
            "Completed",
            (),
            {"returncode": 0, "stdout": b"ffmpeg version 7.1.5\n", "stderr": b""},
        )()
        with patch("audio_generator.transcoder.subprocess.run", return_value=completed):
            self.assertEqual(FfmpegTranscoder().version(), "ffmpeg version 7.1.5")


if __name__ == "__main__":
    unittest.main()
