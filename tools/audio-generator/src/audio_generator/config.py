"""External configuration for the local VOICEVOX generator."""

from __future__ import annotations

import ipaddress
import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit


class ConfigError(ValueError):
    """Raised when generator configuration is missing or unsafe."""


@dataclass(frozen=True)
class GeneratorConfig:
    provider: str
    engine: str
    engine_version: str
    speaker_name: str
    style_name: str
    style_id: int
    engine_url: str
    timeout_seconds: float
    ffmpeg_path: str
    opus_bitrate: str
    attribution_required: bool
    attribution_text: str
    terms_url: str


def load_config(path: str | Path) -> GeneratorConfig:
    source = Path(path)
    try:
        value = json.loads(source.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise ConfigError(f"cannot read config file {source}: {error}") from error
    if not isinstance(value, dict):
        raise ConfigError("config must be a JSON object")

    attribution = value.get("attribution")
    if not isinstance(attribution, dict):
        raise ConfigError("attribution must be an object")

    provider = _required_string(value, "provider")
    engine = _required_string(value, "engine")
    engine_version = _required_string(value, "engine_version")
    speaker_name = _required_string(value, "speaker_name")
    style_name = _required_string(value, "style_name")
    engine_url = _required_string(value, "engine_url").rstrip("/")
    ffmpeg_path = _required_string(value, "ffmpeg_path")
    style_id = value.get("style_id")
    if not isinstance(style_id, int) or isinstance(style_id, bool) or style_id <= 0:
        raise ConfigError("style_id must be a positive integer")

    timeout = value.get("timeout_seconds")
    if (
        not isinstance(timeout, (int, float))
        or isinstance(timeout, bool)
        or not math.isfinite(timeout)
        or timeout <= 0
    ):
        raise ConfigError("timeout_seconds must be a positive number")
    opus_bitrate = _required_string(value, "opus_bitrate")
    bitrate = re.fullmatch(r"([0-9]+)k", opus_bitrate)
    if not bitrate or not 6 <= int(bitrate.group(1)) <= 510:
        raise ConfigError("opus_bitrate must be between 6k and 510k")

    required = attribution.get("required")
    if not isinstance(required, bool):
        raise ConfigError("attribution.required must be a boolean")
    attribution_text = _required_string(attribution, "text")
    terms_url = _required_string(attribution, "terms_url")
    validate_engine_url(engine_url)

    return GeneratorConfig(
        provider=provider,
        engine=engine,
        engine_version=engine_version,
        speaker_name=speaker_name,
        style_name=style_name,
        style_id=style_id,
        engine_url=engine_url,
        timeout_seconds=float(timeout),
        ffmpeg_path=ffmpeg_path,
        opus_bitrate=opus_bitrate,
        attribution_required=required,
        attribution_text=attribution_text,
        terms_url=terms_url,
    )


def _required_string(value: dict[str, Any], name: str) -> str:
    item = value.get(name)
    if not isinstance(item, str) or not item.strip():
        raise ConfigError(f"{name} must be a non-empty string")
    return item.strip()


def validate_engine_url(value: str) -> None:
    try:
        parsed = urlsplit(value)
        port = parsed.port
    except (TypeError, ValueError) as error:
        raise ConfigError("engine_url is invalid") from error
    if (
        parsed.scheme != "http"
        or not parsed.hostname
        or parsed.username
        or parsed.password
    ):
        raise ConfigError("engine_url must be an HTTP URL without credentials")
    if port is not None and not 1 <= port <= 65535:
        raise ConfigError("engine_url port must be between 1 and 65535")
    if parsed.query or parsed.fragment:
        raise ConfigError("engine_url cannot include a query or fragment")
    host = parsed.hostname.lower()
    try:
        is_loopback = ipaddress.ip_address(host).is_loopback
    except ValueError:
        is_loopback = host == "localhost"
    if not is_loopback:
        raise ConfigError("engine_url must use a loopback address")
