"""Batch orchestration, metadata, and atomic publication of generated assets."""

from __future__ import annotations

import hashlib
import json
import os
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Protocol

from audio_generator import __version__
from audio_generator.config import GeneratorConfig
from audio_generator.models import AudioDefinition
from audio_generator.transcoder import (
    OPUS_APPLICATION,
    OPUS_CHANNELS,
    OPUS_SAMPLE_RATE_HZ,
    OPUS_VBR_MODE,
    validate_opus,
)
from audio_generator.validation import (
    AssetValidationError,
    metadata_fingerprint,
    validate_asset_file,
    validate_manifest,
)

MANIFEST_NAME = ".manifest.json"


class GenerationError(RuntimeError):
    """Raised when a batch cannot safely be generated or published."""


@dataclass(frozen=True)
class GenerationResult:
    generated: tuple[Path, ...]
    reused: tuple[Path, ...]


class SynthesisClient(Protocol):
    config: GeneratorConfig

    def verify_engine(self) -> tuple[str, str]: ...

    def synthesize(self, definition: AudioDefinition) -> bytes: ...


class Transcoder(Protocol):
    def version(self) -> str: ...

    def convert_wav_to_opus(self, wav: bytes) -> bytes: ...


def generate_batch(
    definitions: tuple[AudioDefinition, ...] | list[AudioDefinition],
    client: SynthesisClient,
    transcoder: Transcoder,
    output_dir: str | Path,
    *,
    force: bool = False,
    generated_at: datetime | None = None,
) -> GenerationResult:
    """Generate changed assets, reuse unchanged ones, and refresh the manifest."""
    if not definitions:
        raise GenerationError("cannot generate an empty batch")
    if generated_at is not None and (
        generated_at.tzinfo is None or generated_at.utcoffset() is None
    ):
        raise GenerationError("generation timestamp must include a timezone")
    ids = [definition.id for definition in definitions]
    if len(ids) != len(set(ids)):
        raise GenerationError("batch contains duplicate asset IDs")

    output = Path(output_dir)
    if output.exists() and not output.is_dir():
        raise GenerationError(f"output path is not a directory: {output}")

    reported_engine_version, speaker_id = client.verify_engine()
    ffmpeg_version = transcoder.version()
    timestamp = generated_at or datetime.now(timezone.utc)
    timestamp_text = timestamp.astimezone(timezone.utc).isoformat(timespec="seconds")
    existing_metadata = _read_existing_metadata(output, set(ids))
    reused: list[Path] = []
    pending: list[AudioDefinition] = []
    metadata_by_id = existing_metadata

    for definition in definitions:
        audio_path, metadata_path = _output_paths(output, definition)
        audio_exists = audio_path.exists()
        metadata_exists = metadata_path.exists()
        if not force and audio_exists and metadata_exists:
            metadata = _read_metadata(metadata_path)
            _validate_asset(audio_path, metadata, metadata_path, definition.id)
            expected_fingerprint = _generation_fingerprint(
                definition,
                client.config,
                reported_engine_version,
                speaker_id,
                ffmpeg_version,
            )
            if metadata.get("generation_fingerprint") != expected_fingerprint:
                raise GenerationError(
                    f"generation inputs changed for {definition.id}; use --force to replace it"
                )
            metadata_by_id[definition.id] = metadata
            reused.append(audio_path)
        elif not force and (audio_exists or metadata_exists):
            raise GenerationError(
                f"incomplete existing asset {definition.id}; use --force to replace it"
            )
        else:
            pending.append(definition)

    output.parent.mkdir(parents=True, exist_ok=True)
    staged: list[tuple[Path, Path]] = []
    generated: list[Path] = []
    with tempfile.TemporaryDirectory(
        prefix=".audio-generator-", dir=output.parent
    ) as staging_name:
        staging = Path(staging_name)
        for definition in pending:
            wav = client.synthesize(definition)
            opus = transcoder.convert_wav_to_opus(wav)
            validate_opus(opus)
            if len(opus) >= len(wav):
                raise GenerationError(
                    f"optimized audio for {definition.id} is not smaller than its WAV source"
                )
            metadata = _metadata(
                definition,
                client.config,
                reported_engine_version,
                speaker_id,
                ffmpeg_version,
                timestamp_text,
                wav,
                opus,
            )
            audio_stage = staging / f"{definition.id}.opus"
            metadata_stage = staging / f"{definition.id}.json"
            audio_stage.write_bytes(opus)
            metadata_stage.write_text(_encode_json(metadata), encoding="utf-8")
            staged_metadata = _read_metadata(metadata_stage)
            _validate_asset(audio_stage, staged_metadata, metadata_stage, definition.id)
            staged.extend(
                [
                    (audio_stage, output / audio_stage.name),
                    (metadata_stage, output / metadata_stage.name),
                ]
            )
            metadata_by_id[definition.id] = staged_metadata
            generated.append(output / audio_stage.name)

        manifest_stage = staging / MANIFEST_NAME
        manifest = _manifest(metadata_by_id)
        manifest_stage.write_text(_encode_json(manifest), encoding="utf-8")
        try:
            validate_manifest(_read_metadata(manifest_stage), metadata_by_id)
        except AssetValidationError as error:
            raise GenerationError(
                f"asset manifest validation failed: {error}"
            ) from error
        if output.exists() and not output.is_dir():
            raise GenerationError(f"output path is not a directory: {output}")
        if not force:
            appeared = [target for _, target in staged if target.exists()]
            if appeared:
                raise GenerationError(
                    "output files appeared during generation; no files were published"
                )
        output.mkdir(parents=True, exist_ok=True)
        for source, target in staged:
            os.replace(source, target)
        os.replace(manifest_stage, output / MANIFEST_NAME)

    return GenerationResult(tuple(generated), tuple(reused))


def _output_paths(output: Path, definition: AudioDefinition) -> tuple[Path, Path]:
    return output / f"{definition.id}.opus", output / f"{definition.id}.json"


def _read_existing_metadata(
    output: Path, ignored_ids: set[str]
) -> dict[str, dict[str, object]]:
    if not output.exists():
        return {}
    metadata_by_id: dict[str, dict[str, object]] = {}
    for metadata_path in sorted(output.glob("*.json")):
        if metadata_path.name == MANIFEST_NAME or metadata_path.stem in ignored_ids:
            continue
        metadata = _read_metadata(metadata_path)
        asset_id = metadata.get("id")
        if asset_id != metadata_path.stem:
            raise GenerationError(f"metadata ID does not match {metadata_path.name}")
        audio_path = output / f"{asset_id}.opus"
        _validate_asset(audio_path, metadata, metadata_path, str(asset_id))
        metadata_by_id[str(asset_id)] = metadata
    for audio_path in sorted(output.glob("*.opus")):
        if not audio_path.is_file():
            raise GenerationError(f"audio asset is not a file: {audio_path}")
        if audio_path.stem not in metadata_by_id and audio_path.stem not in ignored_ids:
            raise GenerationError(f"metadata file is missing for {audio_path.name}")
    return metadata_by_id


def _read_metadata(path: Path) -> dict[str, object]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise GenerationError(f"cannot read metadata file {path}: {error}") from error
    if not isinstance(value, dict):
        raise GenerationError(f"metadata file must contain an object: {path}")
    return value


def _validate_asset(
    audio_path: Path,
    metadata: dict[str, object],
    metadata_path: Path,
    expected_id: str,
) -> None:
    try:
        validate_asset_file(
            audio_path,
            metadata,
            metadata_path=metadata_path,
            expected_id=expected_id,
        )
    except AssetValidationError as error:
        raise GenerationError(f"asset validation failed: {error}") from error


def _metadata_fields(
    definition: AudioDefinition,
    config: GeneratorConfig,
    reported_engine_version: str,
    speaker_id: str,
    ffmpeg_version: str,
) -> dict[str, object]:
    return {
        "attribution": config.attribution_text if config.attribution_required else None,
        "attribution_required": config.attribution_required,
        "engine": config.engine,
        "engine_version": config.engine_version,
        "engine_version_reported": reported_engine_version,
        "ffmpeg_version": ffmpeg_version,
        "generator_version": __version__,
        "id": definition.id,
        "metadata_version": 3,
        "output_format": "opus",
        "opus_application": OPUS_APPLICATION,
        "opus_bitrate": config.opus_bitrate,
        "opus_channels": OPUS_CHANNELS,
        "opus_sample_rate_hz": OPUS_SAMPLE_RATE_HZ,
        "opus_vbr_mode": OPUS_VBR_MODE,
        "provider": config.provider,
        "reading": definition.reading,
        "speaker_id": speaker_id,
        "speaker_name": config.speaker_name,
        "style_id": config.style_id,
        "style_name": config.style_name,
        "terms_url": config.terms_url,
        "text": definition.text,
    }


def _generation_fingerprint(
    definition: AudioDefinition,
    config: GeneratorConfig,
    reported_engine_version: str,
    speaker_id: str,
    ffmpeg_version: str,
) -> str:
    fields = _metadata_fields(
        definition, config, reported_engine_version, speaker_id, ffmpeg_version
    )
    return metadata_fingerprint(fields)


def _metadata(
    definition: AudioDefinition,
    config: GeneratorConfig,
    reported_engine_version: str,
    speaker_id: str,
    ffmpeg_version: str,
    generated_at: str,
    wav: bytes,
    opus: bytes,
) -> dict[str, object]:
    fields = _metadata_fields(
        definition, config, reported_engine_version, speaker_id, ffmpeg_version
    )
    return {
        **fields,
        "generated_at_utc": generated_at,
        "generation_fingerprint": _generation_fingerprint(
            definition, config, reported_engine_version, speaker_id, ffmpeg_version
        ),
        "optimized_size_bytes": len(opus),
        "size_reduction_percent": round((1 - len(opus) / len(wav)) * 100, 2),
        "sha256": hashlib.sha256(opus).hexdigest(),
        "source_wav_size_bytes": len(wav),
    }


def _manifest(metadata_by_id: dict[str, dict[str, object]]) -> dict[str, object]:
    assets: dict[str, dict[str, object]] = {}
    for asset_id, metadata in sorted(metadata_by_id.items()):
        assets[asset_id] = {
            "audio_file": f"{asset_id}.opus",
            "generation_fingerprint": metadata.get("generation_fingerprint"),
            "metadata_file": f"{asset_id}.json",
            "sha256": metadata["sha256"],
        }
    return {"assets": assets, "manifest_version": 1}


def _encode_json(value: dict[str, object]) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
