import hashlib
import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

from audio_fixtures import make_ogg_opus
from audio_generator.config import load_config
from audio_generator.generation import generate_batch
from audio_generator.models import AudioDefinition
from audio_generator.transcoder import TranscodeError, normalize_ogg_serial
from audio_generator.validation import (
    AssetValidationError,
    validate_asset_directory,
)

VOICE_CONFIG = Path(__file__).resolve().parents[1] / "voice.json"
VALID_OPUS = normalize_ogg_serial(make_ogg_opus())


class FakeClient:
    config = load_config(VOICE_CONFIG)

    def verify_engine(self) -> tuple[str, str]:
        return "0.24.0", "speaker-uuid"

    def synthesize(self, _definition: AudioDefinition) -> bytes:
        return b"RIFF" + bytes(1024)


class FakeTranscoder:
    def __init__(self, output: bytes = VALID_OPUS) -> None:
        self.output = output

    def version(self) -> str:
        return "ffmpeg version 7.1.5"

    def convert_wav_to_opus(self, _wav: bytes) -> bytes:
        return self.output


class AssetValidationTests(unittest.TestCase):
    def create_assets(self, directory: Path) -> Path:
        output = directory / "generated"
        generate_batch(
            [AudioDefinition("nihongo", "日本語", "にほんご")],
            FakeClient(),
            FakeTranscoder(),
            output,
            generated_at=datetime(2026, 9, 26, tzinfo=timezone.utc),
        )
        return output

    def test_validates_audio_metadata_and_inventory_together(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = self.create_assets(Path(directory))

            result = validate_asset_directory(output)

            self.assertEqual(result.asset_count, 1)

    def test_rejects_corrupt_audio_even_when_the_checksum_is_updated(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = self.create_assets(Path(directory))
            audio_path = output / "nihongo.opus"
            corrupted = bytearray(audio_path.read_bytes())
            corrupted[-1] ^= 0x01
            audio_path.write_bytes(corrupted)
            metadata_path = output / "nihongo.json"
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            metadata["sha256"] = hashlib.sha256(corrupted).hexdigest()
            metadata_path.write_text(json.dumps(metadata), encoding="utf-8")

            with self.assertRaisesRegex(AssetValidationError, "Ogg page checksum"):
                validate_asset_directory(output)

    def test_rejects_metadata_that_claims_an_unsupported_format(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = self.create_assets(Path(directory))
            metadata_path = output / "nihongo.json"
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            metadata["output_format"] = "wav"
            metadata_path.write_text(json.dumps(metadata), encoding="utf-8")

            with self.assertRaisesRegex(AssetValidationError, "output_format"):
                validate_asset_directory(output)

    def test_rejects_metadata_with_an_out_of_range_encoder_bitrate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = self.create_assets(Path(directory))
            metadata_path = output / "nihongo.json"
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            metadata["opus_bitrate"] = "999k"
            metadata_path.write_text(json.dumps(metadata), encoding="utf-8")

            with self.assertRaisesRegex(AssetValidationError, "opus_bitrate"):
                validate_asset_directory(output)

    def test_rejects_a_manifest_that_disagrees_with_sidecar_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = self.create_assets(Path(directory))
            manifest_path = output / ".manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["assets"]["nihongo"]["sha256"] = "0" * 64
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

            with self.assertRaisesRegex(AssetValidationError, "manifest.*inconsistent"):
                validate_asset_directory(output)

    def test_rejects_audio_without_a_matching_sidecar(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = self.create_assets(Path(directory))
            (output / "orphan.opus").write_bytes(VALID_OPUS)

            with self.assertRaisesRegex(AssetValidationError, "missing metadata"):
                validate_asset_directory(output)

    def test_rejects_metadata_whose_audio_file_is_missing(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = self.create_assets(Path(directory))
            (output / "nihongo.opus").unlink()

            with self.assertRaisesRegex(AssetValidationError, "audio file is missing"):
                validate_asset_directory(output)

    def test_rejects_metadata_that_no_longer_matches_its_fingerprint(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = self.create_assets(Path(directory))
            metadata_path = output / "nihongo.json"
            metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            metadata["reading"] = "ニホンゴ"
            metadata_path.write_text(json.dumps(metadata), encoding="utf-8")

            with self.assertRaisesRegex(AssetValidationError, "generation_fingerprint"):
                validate_asset_directory(output)

    def test_generation_rejects_a_stream_without_audio_packets_before_publish(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "generated"
            empty_stream = normalize_ogg_serial(make_ogg_opus(include_audio=False))

            with self.assertRaisesRegex(TranscodeError, "audio packet"):
                generate_batch(
                    [AudioDefinition("nihongo", "日本語", "にほんご")],
                    FakeClient(),
                    FakeTranscoder(empty_stream),
                    output,
                )

            self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()
