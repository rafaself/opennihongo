"""Deterministic WAV-to-Opus conversion through the FFmpeg executable."""

from __future__ import annotations

import io
import subprocess
import wave

OPUS_APPLICATION = "voip"
OPUS_CHANNELS = 1
OPUS_SAMPLE_RATE_HZ = 48000
OPUS_VBR_MODE = "off"


class TranscodeError(RuntimeError):
    """Raised when FFmpeg is missing or cannot create valid Opus audio."""


class FfmpegTranscoder:
    def __init__(
        self,
        ffmpeg_path: str = "ffmpeg",
        bitrate: str = "32k",
        timeout_seconds: float = 120,
    ) -> None:
        self.ffmpeg_path = ffmpeg_path
        self.bitrate = bitrate
        self.timeout_seconds = timeout_seconds

    def version(self) -> str:
        try:
            result = subprocess.run(
                [self.ffmpeg_path, "-version"],
                capture_output=True,
                check=False,
                timeout=self.timeout_seconds,
            )
        except FileNotFoundError as error:
            raise TranscodeError(
                f"FFmpeg executable not found: {self.ffmpeg_path}"
            ) from error
        except (subprocess.TimeoutExpired, OSError) as error:
            raise TranscodeError(f"cannot read FFmpeg version: {error}") from error
        if result.returncode != 0:
            raise TranscodeError("FFmpeg could not report its version")
        version = result.stdout.decode("utf-8", errors="replace").splitlines()
        if not version or not version[0].strip():
            raise TranscodeError("FFmpeg returned an empty version")
        return version[0].strip()

    def convert_wav_to_opus(self, wav: bytes) -> bytes:
        validate_wav(wav)
        command = [
            self.ffmpeg_path,
            "-nostdin",
            "-hide_banner",
            "-loglevel",
            "error",
            "-fflags",
            "+bitexact",
            "-i",
            "pipe:0",
            "-map_metadata",
            "-1",
            "-vn",
            "-ac",
            str(OPUS_CHANNELS),
            "-ar",
            str(OPUS_SAMPLE_RATE_HZ),
            "-c:a",
            "libopus",
            "-application",
            OPUS_APPLICATION,
            "-b:a",
            self.bitrate,
            "-vbr",
            OPUS_VBR_MODE,
            "-flags:a",
            "+bitexact",
            "-f",
            "opus",
            "pipe:1",
        ]
        try:
            result = subprocess.run(
                command,
                input=wav,
                capture_output=True,
                check=False,
                timeout=self.timeout_seconds,
            )
        except FileNotFoundError as error:
            raise TranscodeError(
                f"FFmpeg executable not found: {self.ffmpeg_path}"
            ) from error
        except subprocess.TimeoutExpired as error:
            raise TranscodeError("FFmpeg timed out while converting audio") from error
        except OSError as error:
            raise TranscodeError(f"cannot run FFmpeg: {error}") from error

        if result.returncode != 0:
            detail = result.stderr.decode("utf-8", errors="replace").strip()[-500:]
            suffix = f": {detail}" if detail else ""
            raise TranscodeError(f"FFmpeg could not encode Opus audio{suffix}")
        opus = normalize_ogg_serial(result.stdout)
        validate_opus(opus)
        return opus


def validate_wav(audio: bytes) -> None:
    """Reject malformed, empty, or truncated PCM WAV input before encoding."""
    try:
        with wave.open(io.BytesIO(audio), "rb") as source:
            channels = source.getnchannels()
            sample_width = source.getsampwidth()
            sample_rate = source.getframerate()
            frame_count = source.getnframes()
            frame_size = channels * sample_width
            if (
                channels < 1
                or sample_width < 1
                or sample_rate < 1
                or frame_count < 1
            ):
                raise TranscodeError("VOICEVOX returned an empty WAV stream")
            frames = source.readframes(frame_count)
    except (EOFError, wave.Error) as error:
        raise TranscodeError("VOICEVOX returned an invalid PCM WAV stream") from error

    if len(frames) != frame_count * frame_size:
        raise TranscodeError("VOICEVOX returned a truncated WAV stream")


def normalize_ogg_serial(audio: bytes) -> bytes:
    """Replace FFmpeg's random Ogg stream serial and recompute page checksums."""
    normalized = bytearray(audio)
    offset = 0
    while offset < len(normalized):
        if len(normalized) - offset < 27 or normalized[offset : offset + 4] != b"OggS":
            raise TranscodeError("FFmpeg output is not a valid Ogg stream")
        if normalized[offset + 4] != 0:
            raise TranscodeError("FFmpeg output uses an unsupported Ogg page version")

        segment_count = normalized[offset + 26]
        table_end = offset + 27 + segment_count
        if table_end > len(normalized):
            raise TranscodeError("FFmpeg output contains a truncated Ogg page header")
        body_size = sum(normalized[offset + 27 : table_end])
        page_end = table_end + body_size
        if page_end > len(normalized):
            raise TranscodeError("FFmpeg output contains a truncated Ogg page")

        normalized[offset + 14 : offset + 18] = bytes(4)
        normalized[offset + 22 : offset + 26] = bytes(4)
        checksum = _ogg_crc(normalized[offset:page_end])
        normalized[offset + 22 : offset + 26] = checksum.to_bytes(4, "little")
        offset = page_end
    if not normalized:
        raise TranscodeError("FFmpeg returned empty Opus audio")
    return bytes(normalized)


def validate_opus(audio: bytes) -> None:
    if not audio.startswith(b"OggS"):
        raise TranscodeError("FFmpeg output is not a valid Ogg Opus stream")
    offset = 0
    first_packet = b""
    while offset < len(audio):
        if (
            len(audio) - offset < 27
            or audio[offset : offset + 4] != b"OggS"
            or audio[offset + 4] != 0
        ):
            raise TranscodeError("FFmpeg output contains an invalid Ogg page")
        segment_count = audio[offset + 26]
        table_end = offset + 27 + segment_count
        if table_end > len(audio):
            raise TranscodeError("FFmpeg output contains a truncated Ogg page header")
        lacing = audio[offset + 27 : table_end]
        page_end = table_end + sum(lacing)
        if page_end > len(audio):
            raise TranscodeError("FFmpeg output contains a truncated Ogg page")

        page = bytearray(audio[offset:page_end])
        expected_crc = int.from_bytes(page[22:26], "little")
        page[22:26] = bytes(4)
        if _ogg_crc(page) != expected_crc:
            raise TranscodeError("FFmpeg output contains an invalid Ogg page checksum")
        if not first_packet:
            body_offset = table_end
            first_packet = bytes(audio[body_offset : body_offset + sum(lacing)])
        offset = page_end

    if not first_packet.startswith(b"OpusHead"):
        raise TranscodeError("FFmpeg output is not a valid Ogg Opus stream")


def _ogg_crc(page: bytes | bytearray) -> int:
    checksum = 0
    for byte in page:
        checksum ^= byte << 24
        for _ in range(8):
            if checksum & 0x80000000:
                checksum = ((checksum << 1) ^ 0x04C11DB7) & 0xFFFFFFFF
            else:
                checksum = (checksum << 1) & 0xFFFFFFFF
    return checksum
