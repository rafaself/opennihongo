import io
import unittest
import wave
from unittest.mock import patch

from audio_fixtures import make_ogg_opus
from audio_generator.transcoder import (
    FfmpegTranscoder,
    TranscodeError,
    normalize_ogg_serial,
    validate_wav,
)


def make_wav(frame_count: int = 2400) -> bytes:
    output = io.BytesIO()
    with wave.open(output, "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(24000)
        audio.writeframes(bytes(frame_count * 2))
    return output.getvalue()


def make_opus_page(serial: int = 0) -> bytes:
    return make_ogg_opus(serial)


class WavValidationTests(unittest.TestCase):
    def test_accepts_non_empty_pcm_wav(self) -> None:
        validate_wav(make_wav())

    def test_rejects_empty_wav(self) -> None:
        with self.assertRaisesRegex(TranscodeError, "empty WAV"):
            validate_wav(make_wav(frame_count=0))

    def test_rejects_invalid_and_truncated_wav(self) -> None:
        with self.assertRaisesRegex(TranscodeError, "invalid PCM WAV"):
            validate_wav(b"RIFF1234WAVE")

        with self.assertRaisesRegex(TranscodeError, "truncated WAV"):
            validate_wav(make_wav()[:-2])

    def test_transcoder_validates_before_running_ffmpeg(self) -> None:
        with (
            patch("audio_generator.transcoder.subprocess.run") as run,
            self.assertRaisesRegex(TranscodeError, "invalid PCM WAV"),
        ):
            FfmpegTranscoder().convert_wav_to_opus(b"invalid")

        run.assert_not_called()


class OpusSettingsTests(unittest.TestCase):
    def test_converts_with_fixed_voice_settings(self) -> None:
        completed = type(
            "Completed",
            (),
            {"returncode": 0, "stdout": make_opus_page(8721), "stderr": b""},
        )()
        wav = make_wav()

        with patch(
            "audio_generator.transcoder.subprocess.run", return_value=completed
        ) as run:
            output = FfmpegTranscoder(bitrate="32k").convert_wav_to_opus(wav)

        self.assertEqual(output, normalize_ogg_serial(make_opus_page()))
        self.assertLess(len(output), len(wav))
        command = run.call_args.args[0]
        self.assertEqual(command[command.index("-ac") + 1], "1")
        self.assertEqual(command[command.index("-ar") + 1], "48000")
        self.assertEqual(command[command.index("-application") + 1], "voip")
        self.assertEqual(command[command.index("-b:a") + 1], "32k")
        self.assertEqual(command[command.index("-vbr") + 1], "off")
        self.assertEqual(run.call_args.kwargs["input"], wav)


if __name__ == "__main__":
    unittest.main()
