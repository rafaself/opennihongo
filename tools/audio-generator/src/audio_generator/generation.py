"""Batch orchestration, metadata, and atomic publication of generated assets."""

from __future__ import annotations

import hashlib
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Protocol

from audio_generator.config import GeneratorConfig
from audio_generator.models import AudioDefinition
from audio_generator.transcoder import validate_opus


class GenerationError(RuntimeError):
    """Raised when a batch cannot safely be generated or published."""


class SynthesisClient(Protocol):
    config: GeneratorConfig

    def verify_engine(self) -> str: ...

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
) -> list[Path]:
    """Generate a batch into staging, then publish its audio and metadata files."""
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
    targets = [
        path for definition in definitions for path in _output_paths(output, definition)
    ]
    existing = [path for path in targets if path.exists()]
    if existing and not force:
        raise GenerationError(
            "output files already exist; use --force to replace them: "
            + ", ".join(path.name for path in existing)
        )

    reported_engine_version = client.verify_engine()
    ffmpeg_version = transcoder.version()
    timestamp = generated_at or datetime.now(timezone.utc)
    timestamp = timestamp.astimezone(timezone.utc).isoformat(timespec="seconds")
    output.parent.mkdir(parents=True, exist_ok=True)

    staged: list[tuple[Path, Path]] = []
    with tempfile.TemporaryDirectory(
        prefix=".audio-generator-", dir=output.parent
    ) as staging_name:
        staging = Path(staging_name)
        for definition in definitions:
            wav = client.synthesize(definition)
            opus = transcoder.convert_wav_to_opus(wav)
            validate_opus(opus)
            audio_stage = staging / f"{definition.id}.opus"
            metadata_stage = staging / f"{definition.id}.json"
            audio_stage.write_bytes(opus)
            metadata_stage.write_text(
                json.dumps(
                    _metadata(
                        definition,
                        client.config,
                        reported_engine_version,
                        ffmpeg_version,
                        timestamp,
                        opus,
                    ),
                    ensure_ascii=False,
                    indent=2,
                    sort_keys=True,
                )
                + "\n",
                encoding="utf-8",
            )
            staged.extend(
                [
                    (audio_stage, output / audio_stage.name),
                    (metadata_stage, output / metadata_stage.name),
                ]
            )

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

    return [output / f"{definition.id}.opus" for definition in definitions]


def _output_paths(output: Path, definition: AudioDefinition) -> tuple[Path, Path]:
    return output / f"{definition.id}.opus", output / f"{definition.id}.json"


def _metadata(
    definition: AudioDefinition,
    config: GeneratorConfig,
    reported_engine_version: str,
    ffmpeg_version: str,
    generated_at: str,
    opus: bytes,
) -> dict[str, object]:
    return {
        "attribution": config.attribution_text if config.attribution_required else None,
        "attribution_required": config.attribution_required,
        "engine": config.engine,
        "engine_version": config.engine_version,
        "engine_version_reported": reported_engine_version,
        "ffmpeg_version": ffmpeg_version,
        "generated_at_utc": generated_at,
        "id": definition.id,
        "metadata_version": 1,
        "output_format": "opus",
        "opus_bitrate": config.opus_bitrate,
        "provider": config.provider,
        "reading": definition.reading,
        "sha256": hashlib.sha256(opus).hexdigest(),
        "speaker_name": config.speaker_name,
        "style_id": config.style_id,
        "style_name": config.style_name,
        "terms_url": config.terms_url,
        "text": definition.text,
    }
