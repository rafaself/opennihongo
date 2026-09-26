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
            if channels < 1 or sample_width < 1 or sample_rate < 1 or frame_count < 1:
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
    if not audio:
        raise TranscodeError("FFmpeg returned empty Opus audio")
    offset = 0
    stream_serial: int | None = None
    expected_sequence = 0
    packets: list[bytes] = []
    packet_buffer = bytearray()
    saw_eos = False
    while offset < len(audio):
        if (
            len(audio) - offset < 27
            or audio[offset : offset + 4] != b"OggS"
            or audio[offset + 4] != 0
        ):
            raise TranscodeError("FFmpeg output contains an invalid Ogg page")
        flags = audio[offset + 5]
        if flags & ~0x07:
            raise TranscodeError("FFmpeg output contains unsupported Ogg page flags")
        serial = int.from_bytes(audio[offset + 14 : offset + 18], "little")
        sequence = int.from_bytes(audio[offset + 18 : offset + 22], "little")
        if stream_serial is None:
            if not flags & 0x02 or flags & 0x01:
                raise TranscodeError(
                    "FFmpeg output does not start with an Ogg BOS page"
                )
            stream_serial = serial
        elif serial != stream_serial:
            raise TranscodeError("FFmpeg output contains multiple Ogg streams")
        elif flags & 0x02:
            raise TranscodeError("FFmpeg output contains an unexpected Ogg BOS page")
        if sequence != expected_sequence:
            raise TranscodeError("FFmpeg output contains an out-of-order Ogg page")
        expected_sequence += 1
        if bool(flags & 0x01) != bool(packet_buffer):
            raise TranscodeError(
                "FFmpeg output contains an invalid Ogg continuation page"
            )

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

        body_offset = table_end
        for segment_size in lacing:
            packet_buffer.extend(audio[body_offset : body_offset + segment_size])
            body_offset += segment_size
            if segment_size < 255:
                packets.append(bytes(packet_buffer))
                packet_buffer.clear()
        if flags & 0x04:
            if page_end != len(audio):
                raise TranscodeError(
                    "FFmpeg output contains data after its Ogg EOS page"
                )
            saw_eos = True
        elif page_end == len(audio):
            raise TranscodeError("FFmpeg output is missing its Ogg EOS page")
        offset = page_end

    if packet_buffer:
        raise TranscodeError("FFmpeg output contains a truncated Ogg packet")
    if not saw_eos:
        raise TranscodeError("FFmpeg output is missing its Ogg EOS page")
    if len(packets) < 3:
        raise TranscodeError("FFmpeg output contains no Opus audio packet")

    header = packets[0]
    if len(header) < 19 or not header.startswith(b"OpusHead"):
        raise TranscodeError("FFmpeg output is not a valid Ogg Opus stream")
    version, channels, mapping_family = header[8], header[9], header[18]
    input_sample_rate = int.from_bytes(header[12:16], "little")
    if version == 0 or version > 15:
        raise TranscodeError("FFmpeg output uses an unsupported Opus version")
    if channels != 1 or mapping_family != 0:
        raise TranscodeError("FFmpeg output uses an unsupported Opus channel mapping")
    if input_sample_rate != OPUS_SAMPLE_RATE_HZ:
        raise TranscodeError("FFmpeg output uses an unsupported Opus input sample rate")
    _validate_opus_tags(packets[1])
    if any(not packet for packet in packets[2:]):
        raise TranscodeError("FFmpeg output contains an empty Opus audio packet")


def _validate_opus_tags(packet: bytes) -> None:
    if len(packet) < 16 or not packet.startswith(b"OpusTags"):
        raise TranscodeError("FFmpeg output does not contain valid OpusTags")
    offset = 8
    vendor_size = int.from_bytes(packet[offset : offset + 4], "little")
    offset += 4 + vendor_size
    if offset + 4 > len(packet):
        raise TranscodeError("FFmpeg output contains truncated OpusTags")
    comment_count = int.from_bytes(packet[offset : offset + 4], "little")
    offset += 4
    for _ in range(comment_count):
        if offset + 4 > len(packet):
            raise TranscodeError("FFmpeg output contains truncated OpusTags")
        comment_size = int.from_bytes(packet[offset : offset + 4], "little")
        offset += 4 + comment_size
        if offset > len(packet):
            raise TranscodeError("FFmpeg output contains truncated OpusTags")
    if any(packet[offset:]):
        raise TranscodeError("FFmpeg output contains invalid OpusTags padding")


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
