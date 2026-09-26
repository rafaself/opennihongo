import json
import tempfile
import unittest
from pathlib import Path

from audio_generator.config import ConfigError, load_config


class LoadConfigTests(unittest.TestCase):
    def write_config(self, value: object) -> Path:
        temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(temp_dir.cleanup)
        path = Path(temp_dir.name) / "voice.json"
        path.write_text(json.dumps(value), encoding="utf-8")
        return path

    def test_loads_external_voice_and_encoder_settings(self) -> None:
        config = load_config(self.write_config(config_data()))

        self.assertEqual(config.style_id, 10005)
        self.assertEqual(config.engine_version, "0.24.0")
        self.assertEqual(config.engine_url, "http://127.0.0.1:50021")
        self.assertEqual(config.ffmpeg_path, "ffmpeg")
        self.assertEqual(config.opus_bitrate, "32k")

    def test_rejects_missing_or_invalid_style_id(self) -> None:
        data = config_data()
        data["style_id"] = True

        with self.assertRaisesRegex(ConfigError, "style_id"):
            load_config(self.write_config(data))

    def test_rejects_non_loopback_plain_http_engine(self) -> None:
        data = config_data()
        data["engine_url"] = "http://voicevox.internal:50021"

        with self.assertRaisesRegex(ConfigError, "loopback"):
            load_config(self.write_config(data))

    def test_rejects_remote_https_engine(self) -> None:
        data = config_data()
        data["engine_url"] = "https://voicevox.example"

        with self.assertRaisesRegex(ConfigError, "HTTP URL"):
            load_config(self.write_config(data))

    def test_rejects_malformed_engine_urls_and_non_finite_timeouts(self) -> None:
        data = config_data()
        data["engine_url"] = "http://[invalid"
        with self.assertRaisesRegex(ConfigError, "engine_url is invalid"):
            load_config(self.write_config(data))

        data = config_data()
        data["timeout_seconds"] = float("inf")
        with self.assertRaisesRegex(ConfigError, "timeout_seconds"):
            load_config(self.write_config(data))


def config_data() -> dict[str, object]:
    return {
        "provider": "VOICEVOX",
        "engine": "voicevox_nemo_engine",
        "engine_version": "0.24.0",
        "speaker_name": "女声1",
        "style_name": "ノーマル",
        "style_id": 10005,
        "engine_url": "http://127.0.0.1:50021",
        "timeout_seconds": 60,
        "ffmpeg_path": "ffmpeg",
        "opus_bitrate": "32k",
        "attribution": {
            "required": True,
            "text": "VOICEVOX Nemo",
            "terms_url": "https://voicevox.hiroshiba.jp/nemo/term/",
        },
    }


if __name__ == "__main__":
    unittest.main()
