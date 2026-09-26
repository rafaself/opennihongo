import io
import json
import shutil
import tempfile
import threading
import unittest
import wave
from dataclasses import replace
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from audio_generator.config import load_config
from audio_generator.generation import generate_batch
from audio_generator.models import AudioDefinition
from audio_generator.transcoder import FfmpegTranscoder
from audio_generator.voicevox import VoicevoxClient, VoicevoxError


def make_wav() -> bytes:
    output = io.BytesIO()
    with wave.open(output, "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(24000)
        audio.writeframes(bytes(2400))
    return output.getvalue()


WAV = make_wav()
REQUESTS: list[tuple[str, str, bytes]] = []
STYLE_ID = 10005
ENGINE_VERSION = "0.24.0"
SPEAKER_UUID: str | None = "speaker-uuid"


class FakeEngine(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        global SPEAKER_UUID
        REQUESTS.append((self.command, self.path, b""))
        if self.path == "/version":
            self.respond(200, json.dumps(ENGINE_VERSION).encode())
        elif self.path == "/speakers":
            self.respond(
                200,
                json.dumps(
                    [
                        {
                            "name": "女声1",
                            "speaker_uuid": SPEAKER_UUID,
                            "styles": [{"name": "ノーマル", "id": STYLE_ID}],
                        }
                    ]
                ).encode(),
            )
        else:
            self.respond(404, b"missing")

    def do_POST(self) -> None:
        body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
        REQUESTS.append((self.command, self.path, body))
        if self.path.startswith("/audio_query?"):
            if "text=redirect" in self.path:
                self.send_response(302)
                self.send_header("Location", "/version")
                self.end_headers()
                return
            self.respond(200, json.dumps({"kana": "ニホンゴ"}).encode())
        elif self.path.startswith("/synthesis?"):
            self.respond(200, WAV, "audio/wav")
        else:
            self.respond(404, b"missing")

    def respond(
        self, status: int, body: bytes, content_type: str = "application/json"
    ) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, _format: str, *_args: object) -> None:
        pass


class VoicevoxClientTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), FakeEngine)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def setUp(self) -> None:
        REQUESTS.clear()
        config = replace(
            load_config(Path(__file__).resolve().parents[1] / "voice.json"),
            engine_url=self.base_url,
        )
        self.client = VoicevoxClient(config)

    def test_verifies_pinned_engine_version_and_style(self) -> None:
        self.assertEqual(self.client.verify_engine(), ("0.24.0", "speaker-uuid"))

    def test_rejects_selected_speaker_without_uuid(self) -> None:
        global SPEAKER_UUID
        SPEAKER_UUID = None
        try:
            with self.assertRaisesRegex(VoicevoxError, "speaker UUID"):
                self.client.verify_engine()
        finally:
            SPEAKER_UUID = "speaker-uuid"

    def test_rejects_unversioned_engine_report(self) -> None:
        global ENGINE_VERSION
        ENGINE_VERSION = "latest"
        try:
            with self.assertRaisesRegex(VoicevoxError, "running latest"):
                self.client.verify_engine()
        finally:
            ENGINE_VERSION = "0.24.0"

    def test_synthesizes_from_configured_reading_and_style(self) -> None:
        result = self.client.synthesize(
            AudioDefinition("nihongo", "日本語", "にほんご")
        )

        self.assertEqual(result, WAV)
        query_path = urlsplit(REQUESTS[0][1])
        self.assertEqual(
            parse_qs(query_path.query), {"text": ["にほんご"], "speaker": ["10005"]}
        )
        self.assertEqual(json.loads(REQUESTS[1][2]), {"kana": "ニホンゴ"})
        self.assertIn("speaker=10005", REQUESTS[1][1])

    @unittest.skipUnless(
        shutil.which("ffmpeg"), "FFmpeg is required for the encoder integration test"
    )
    def test_full_pipeline_writes_valid_opus_and_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            generated = generate_batch(
                [AudioDefinition("nihongo", "日本語", "にほんご")],
                self.client,
                FfmpegTranscoder(
                    self.client.config.ffmpeg_path,
                    self.client.config.opus_bitrate,
                    self.client.config.timeout_seconds,
                ),
                directory,
            )
            audio = generated.generated[0].read_bytes()
            metadata = json.loads(
                (Path(directory) / "nihongo.json").read_text(encoding="utf-8")
            )

        self.assertTrue(audio.startswith(b"OggS"))
        self.assertIn(b"OpusHead", audio[:512])
        self.assertEqual(metadata["reading"], "にほんご")
        self.assertEqual(metadata["engine_version"], "0.24.0")
        self.assertEqual(metadata["engine_version_reported"], "0.24.0")
        self.assertEqual(metadata["speaker_id"], "speaker-uuid")
        self.assertEqual(metadata["style_id"], STYLE_ID)
        self.assertEqual(metadata["generator_version"], "0.1.0")
        self.assertEqual(len(metadata["generation_fingerprint"]), 64)
        self.assertLess(len(audio), len(WAV))
        self.assertEqual(metadata["source_wav_size_bytes"], len(WAV))
        self.assertEqual(metadata["optimized_size_bytes"], len(audio))
        self.assertGreater(metadata["size_reduction_percent"], 0)
        self.assertEqual(metadata["opus_application"], "voip")
        self.assertIn("ffmpeg version", metadata["ffmpeg_version"])

    def test_rejects_engine_with_wrong_version(self) -> None:
        config = replace(self.client.config, engine_version="0.23.0")
        client = VoicevoxClient(config)

        with self.assertRaisesRegex(VoicevoxError, "0.23.0"):
            client.verify_engine()

    def test_rejects_unavailable_configured_style(self) -> None:
        config = replace(self.client.config, style_id=99999)
        client = VoicevoxClient(config)

        with self.assertRaisesRegex(VoicevoxError, "99999"):
            client.verify_engine()

    def test_does_not_follow_engine_redirects(self) -> None:
        with self.assertRaisesRegex(VoicevoxError, "HTTP 302"):
            self.client.synthesize(AudioDefinition("redirect", "転送", "redirect"))

        self.assertFalse(any(method == "GET" for method, _, _ in REQUESTS))


if __name__ == "__main__":
    unittest.main()
