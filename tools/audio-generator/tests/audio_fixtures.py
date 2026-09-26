"""Minimal Ogg Opus fixtures for generator validation tests."""

from __future__ import annotations


def make_ogg_opus(serial: int = 0, *, include_audio: bool = True) -> bytes:
    head = (
        b"OpusHead"
        + bytes([1, 1])
        + bytes(2)
        + (48000).to_bytes(4, "little")
        + bytes(2)
        + bytes([0])
    )
    tags = b"OpusTags" + bytes(4) + bytes(4)
    packets = [head, tags]
    if include_audio:
        packets.append(b"\xf8\xff\xfe")

    body = b"".join(packets)
    lacing = bytes(map(len, packets))
    flags = 6  # Beginning and end of a single-page Ogg stream.
    granule = (960 if include_audio else 0).to_bytes(8, "little")
    page = bytearray(
        b"OggS"
        + bytes([0, flags])
        + granule
        + serial.to_bytes(4, "little")
        + bytes(8)  # Page sequence and checksum are normalized by the caller.
        + bytes([len(lacing)])
        + lacing
        + body
    )
    return bytes(page)
