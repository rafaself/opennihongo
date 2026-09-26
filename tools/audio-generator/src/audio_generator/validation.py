"""Validation for generated audio, metadata sidecars, and inventories."""

from __future__ import annotations

import hashlib
import json
import math
import re
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path

from audio_generator.transcoder import TranscodeError, validate_opus

_ASSET_ID = re.compile(r"[a-z0-9]+(?:[._-][a-z0-9]+)*\Z")
_SHA256 = re.compile(r"[0-9a-f]{64}\Z")
_BITRATE = re.compile(r"([0-9]+)k\Z")
_FINGERPRINT_FIELDS = (
    "attribution",
    "attribution_required",
    "engine",
    "engine_version",
    "engine_version_reported",
    "ffmpeg_version",
    "generator_version",
    "id",
    "metadata_version",
    "output_format",
    "opus_application",
    "opus_bitrate",
    "opus_channels",
    "opus_sample_rate_hz",
    "opus_vbr_mode",
    "provider",
    "reading",
    "speaker_id",
    "speaker_name",
    "style_id",
    "style_name",
    "terms_url",
    "text",
)


class AssetValidationError(ValueError):
    """Raised when generated audio or its metadata is incomplete or invalid."""


@dataclass(frozen=True)
class AssetValidationReport:
    asset_count: int


def validate_asset_file(
    audio_path: Path,
    metadata: Mapping[str, object],
    *,
    metadata_path: Path | None = None,
    expected_id: str | None = None,
) -> None:
    """Validate one audio file and its parsed sidecar before it is published."""
    label = metadata_path.name if metadata_path is not None else audio_path.name
    asset_id = metadata.get("id")
    if not isinstance(asset_id, str) or not _ASSET_ID.fullmatch(asset_id):
        raise AssetValidationError(f"invalid metadata ID in {label}")
    if expected_id is not None and asset_id != expected_id:
        raise AssetValidationError(f"metadata ID does not match {label}")
    if metadata_path is not None and metadata_path.stem != asset_id:
        raise AssetValidationError(f"metadata ID does not match {label}")
    if audio_path.name != f"{asset_id}.opus":
        raise AssetValidationError(
            f"audio filename does not match metadata ID in {label}"
        )
    if not audio_path.is_file():
        raise AssetValidationError(f"audio file is missing for {label}")

    try:
        audio = audio_path.read_bytes()
    except OSError as error:
        raise AssetValidationError(
            f"cannot read audio file {audio_path}: {error}"
        ) from error
    checksum = metadata.get("sha256")
    if not isinstance(checksum, str) or not _SHA256.fullmatch(checksum):
        raise AssetValidationError(f"sha256 is invalid in {label}")
    if checksum != hashlib.sha256(audio).hexdigest():
        raise AssetValidationError(f"audio checksum does not match {label}")
    try:
        validate_opus(audio)
    except TranscodeError as error:
        raise AssetValidationError(
            f"invalid audio file {audio_path}: {error}"
        ) from error

    if metadata.get("output_format") != "opus":
        raise AssetValidationError(f"output_format must be opus in {label}")
    if (
        type(metadata.get("metadata_version")) is not int
        or metadata["metadata_version"] != 3
    ):
        raise AssetValidationError(f"unsupported metadata_version in {label}")
    if metadata.get("opus_application") != "voip":
        raise AssetValidationError(f"unsupported opus_application in {label}")
    if (
        metadata.get("opus_channels") != 1
        or type(metadata.get("opus_channels")) is not int
    ):
        raise AssetValidationError(f"unsupported opus_channels in {label}")
    if (
        metadata.get("opus_sample_rate_hz") != 48000
        or type(metadata.get("opus_sample_rate_hz")) is not int
    ):
        raise AssetValidationError(f"unsupported opus_sample_rate_hz in {label}")
    if metadata.get("opus_vbr_mode") != "off":
        raise AssetValidationError(f"unsupported opus_vbr_mode in {label}")
    bitrate = metadata.get("opus_bitrate")
    bitrate_match = _BITRATE.fullmatch(bitrate) if isinstance(bitrate, str) else None
    if bitrate_match is None or not 6 <= int(bitrate_match.group(1)) <= 510:
        raise AssetValidationError(f"invalid opus_bitrate in {label}")

    for field in (
        "engine",
        "engine_version",
        "engine_version_reported",
        "ffmpeg_version",
        "generator_version",
        "provider",
        "reading",
        "speaker_id",
        "speaker_name",
        "style_name",
        "terms_url",
        "text",
    ):
        value = metadata.get(field)
        if not isinstance(value, str) or not value.strip():
            raise AssetValidationError(f"{field} must be a non-empty string in {label}")
    style_id = metadata.get("style_id")
    if type(style_id) is not int or style_id <= 0:
        raise AssetValidationError(f"style_id must be a positive integer in {label}")
    if not isinstance(metadata.get("attribution_required"), bool):
        raise AssetValidationError(f"attribution_required must be boolean in {label}")
    if metadata["attribution_required"]:
        attribution = metadata.get("attribution")
        terms_url = metadata.get("terms_url")
        if not isinstance(attribution, str) or not attribution.strip():
            raise AssetValidationError(f"required attribution is missing in {label}")
        if not isinstance(terms_url, str) or not terms_url.startswith("https://"):
            raise AssetValidationError(f"required terms_url is invalid in {label}")

    generated_at = metadata.get("generated_at_utc")
    if not isinstance(generated_at, str):
        raise AssetValidationError(f"generated_at_utc is missing in {label}")
    try:
        parsed_generated_at = datetime.fromisoformat(generated_at)
    except ValueError as error:
        raise AssetValidationError(f"generated_at_utc is invalid in {label}") from error
    if (
        parsed_generated_at.tzinfo is None
        or parsed_generated_at.utcoffset() != timedelta(0)
    ):
        raise AssetValidationError(f"generated_at_utc must be UTC in {label}")

    optimized_size = metadata.get("optimized_size_bytes")
    source_size = metadata.get("source_wav_size_bytes")
    if type(optimized_size) is not int or optimized_size != len(audio):
        raise AssetValidationError(
            f"optimized_size_bytes does not match audio in {label}"
        )
    if type(source_size) is not int or source_size <= optimized_size:
        raise AssetValidationError(f"source_wav_size_bytes is inconsistent in {label}")
    reduction = metadata.get("size_reduction_percent")
    expected_reduction = round((1 - optimized_size / source_size) * 100, 2)
    if (
        not isinstance(reduction, (int, float))
        or isinstance(reduction, bool)
        or not math.isfinite(reduction)
        or reduction != expected_reduction
    ):
        raise AssetValidationError(f"size_reduction_percent is inconsistent in {label}")

    fingerprint = metadata.get("generation_fingerprint")
    if not isinstance(fingerprint, str) or not _SHA256.fullmatch(fingerprint):
        raise AssetValidationError(f"generation_fingerprint is invalid in {label}")
    try:
        expected_fingerprint = metadata_fingerprint(metadata)
    except (KeyError, TypeError, ValueError) as error:
        raise AssetValidationError(f"metadata fields are invalid in {label}") from error
    if fingerprint != expected_fingerprint:
        raise AssetValidationError(
            f"generation_fingerprint does not match metadata in {label}"
        )


def metadata_fingerprint(metadata: Mapping[str, object]) -> str:
    """Recompute the generation fingerprint from immutable synthesis inputs."""
    fields = {field: metadata[field] for field in _FINGERPRINT_FIELDS}
    canonical = json.dumps(
        fields, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(canonical).hexdigest()


def validate_manifest(
    manifest: object, metadata_by_id: Mapping[str, Mapping[str, object]]
) -> None:
    """Ensure the generated inventory points to each sidecar and audio checksum."""
    if (
        not isinstance(manifest, dict)
        or type(manifest.get("manifest_version")) is not int
        or manifest.get("manifest_version") != 1
    ):
        raise AssetValidationError("manifest_version must be 1")
    assets = manifest.get("assets")
    if not isinstance(assets, dict):
        raise AssetValidationError("manifest assets must be an object")
    if set(assets) != set(metadata_by_id):
        raise AssetValidationError("manifest asset IDs do not match metadata sidecars")
    for asset_id, metadata in metadata_by_id.items():
        entry = assets.get(asset_id)
        expected = {
            "audio_file": f"{asset_id}.opus",
            "generation_fingerprint": metadata.get("generation_fingerprint"),
            "metadata_file": f"{asset_id}.json",
            "sha256": metadata.get("sha256"),
        }
        if entry != expected:
            raise AssetValidationError(f"manifest entry is inconsistent for {asset_id}")


def validate_asset_directory(output_dir: str | Path) -> AssetValidationReport:
    """Validate every asset and the aggregate manifest in an output directory."""
    output = Path(output_dir)
    if not output.is_dir():
        raise AssetValidationError(f"audio asset directory does not exist: {output}")
    manifest_path = output / ".manifest.json"
    manifest = _read_json_object(manifest_path)
    metadata_by_id: dict[str, dict[str, object]] = {}
    for metadata_path in sorted(output.glob("*.json")):
        if metadata_path.name == manifest_path.name:
            continue
        metadata = _read_json_object(metadata_path)
        asset_id = metadata.get("id")
        if not isinstance(asset_id, str) or metadata_path.stem != asset_id:
            raise AssetValidationError(
                f"metadata ID does not match {metadata_path.name}"
            )
        audio_path = output / f"{asset_id}.opus"
        validate_asset_file(audio_path, metadata, metadata_path=metadata_path)
        metadata_by_id[asset_id] = metadata

    if not metadata_by_id:
        raise AssetValidationError(
            f"audio asset directory contains no metadata sidecars: {output}"
        )
    metadata_ids = set(metadata_by_id)
    for audio_path in sorted(output.glob("*.opus")):
        if not audio_path.is_file():
            raise AssetValidationError(f"audio asset is not a file: {audio_path}")
        if audio_path.stem not in metadata_ids:
            raise AssetValidationError(
                f"missing metadata sidecar for {audio_path.name}"
            )
    validate_manifest(manifest, metadata_by_id)
    return AssetValidationReport(len(metadata_by_id))


def _read_json_object(path: Path) -> dict[str, object]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise AssetValidationError(f"cannot read JSON file {path}: {error}") from error
    if not isinstance(value, dict):
        raise AssetValidationError(f"JSON file must contain an object: {path}")
    return value
