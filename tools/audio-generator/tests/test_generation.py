import json
import tempfile
import unittest
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


class FakeClient:
    config = load_config(Path(__file__).resolve().parents[1] / "voice.json")

    def __init__(self) -> None:
        self.definitions: list[AudioDefinition] = []

    def verify_engine(self) -> str:
        return "0.24.0"

    def synthesize(self, definition: AudioDefinition) -> bytes:
        self.definitions.append(definition)
        return b"RIFF\x04\x00\x00\x00WAVE"


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
                results,
                [output_dir / "nihongo.opus", output_dir / "kana.hiragana.a.opus"],
            )
            self.assertEqual((output_dir / "nihongo.opus").read_bytes(), OPUS)
            self.assertEqual((output_dir / "kana.hiragana.a.opus").read_bytes(), OPUS)
            metadata = json.loads(
                (output_dir / "nihongo.json").read_text(encoding="utf-8")
            )
            self.assertEqual(metadata["reading"], "にほんご")
            self.assertEqual(metadata["engine_version"], "0.24.0")
            self.assertEqual(metadata["engine_version_reported"], "0.24.0")
            self.assertEqual(metadata["ffmpeg_version"], "ffmpeg version 7.1.5")
            self.assertEqual(metadata["metadata_version"], 1)
            self.assertTrue(metadata["attribution_required"])
            self.assertTrue(metadata["terms_url"].startswith("https://"))
            self.assertEqual(metadata["generated_at_utc"], "2026-09-26T00:00:00+00:00")
            self.assertEqual(len(metadata["sha256"]), 64)

    def test_refuses_to_overwrite_without_force(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output_dir = Path(directory)
            (output_dir / "nihongo.opus").write_bytes(OPUS)

            with self.assertRaisesRegex(GenerationError, "already exist"):
                generate_batch(
                    [AudioDefinition("nihongo", "日本語", "にほんご")],
                    FakeClient(),
                    FakeTranscoder(),
                    output_dir,
                )

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
            first = transcoder.convert_wav_to_opus(b"wav")
            second = transcoder.convert_wav_to_opus(b"wav")

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
