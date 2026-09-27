"""Command-line entry point for generating curated pronunciation assets."""

from __future__ import annotations

import argparse
import sys
from collections.abc import Sequence
from pathlib import Path

from audio_generator.config import ConfigError, load_config
from audio_generator.generation import GenerationError, generate_batch
from audio_generator.models import InputError, load_definitions
from audio_generator.transcoder import FfmpegTranscoder, TranscodeError
from audio_generator.validation import AssetValidationError, validate_asset_directory
from audio_generator.voicevox import VoicevoxClient, VoicevoxError

DEFAULT_CONFIG = Path("tools/audio-generator/voice.json")
DEFAULT_OUTPUT = Path("packages/audio-assets/generated")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="opennihongo-audio",
        description="Generate reproducible pronunciation assets through the local VOICEVOX engine.",
    )
    parser.add_argument(
        "--input",
        type=Path,
        help="JSON content object or array of content objects",
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=DEFAULT_CONFIG,
        help="voice and encoder settings JSON",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="generated asset directory",
    )
    parser.add_argument(
        "--docker-container",
        help=(
            "call curl inside this already-running Docker container; set engine_url "
            "to the Engine's container-loopback address"
        ),
    )
    parser.add_argument(
        "--force", action="store_true", help="replace existing audio and metadata files"
    )
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="validate the existing generated audio directory without synthesis",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.validate_only:
        if args.input is not None:
            parser.error("--input cannot be used with --validate-only")
        try:
            report = validate_asset_directory(args.output_dir)
        except (AssetValidationError, OSError) as error:
            print(f"{parser.prog}: error: {error}", file=sys.stderr)
            return 2
        print(f"Validated {report.asset_count} audio asset(s) in {args.output_dir}.")
        return 0
    if args.input is None:
        parser.error("--input is required unless --validate-only is used")

    try:
        config = load_config(args.config)
        definitions = load_definitions(args.input)
        client = VoicevoxClient(config, docker_container=args.docker_container)
        transcoder = FfmpegTranscoder(
            config.ffmpeg_path, config.opus_bitrate, config.timeout_seconds
        )
        result = generate_batch(
            definitions, client, transcoder, args.output_dir, force=args.force
        )
    except (
        ConfigError,
        InputError,
        GenerationError,
        TranscodeError,
        VoicevoxError,
        OSError,
    ) as error:
        print(f"{parser.prog}: error: {error}", file=sys.stderr)
        return 2

    print(
        f"Validated {len(result.generated) + len(result.reused)} audio asset(s) "
        "before publication."
    )
    print(
        f"Generated {len(result.generated)} pronunciation asset(s); "
        f"reused {len(result.reused)} unchanged asset(s):"
    )
    for path in result.generated:
        print(f"generated: {path}")
    for path in result.reused:
        print(f"reused: {path}")
    return 0
