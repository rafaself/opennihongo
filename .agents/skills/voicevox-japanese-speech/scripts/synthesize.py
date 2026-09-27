"""Synthesize one Japanese speech clip with a local VOICEVOX Engine."""

from __future__ import annotations

import argparse
import ipaddress
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

DEFAULT_ENGINE_URL = os.environ.get("VOICEVOX_URL", "http://127.0.0.1:50021")
REQUEST_TIMEOUT_SECONDS = 180


class EngineError(RuntimeError):
    """Raised when the local VOICEVOX API cannot complete a request."""


class _NoRedirectHandler(HTTPRedirectHandler):
    def redirect_request(
        self,
        _request: Request,
        _response: Any,
        _code: int,
        _message: str,
        _headers: Any,
        _url: str,
    ) -> Request | None:
        return None


def validate_engine_url(value: str) -> str:
    try:
        parsed = urlsplit(value)
        port = parsed.port
    except ValueError as error:
        raise EngineError("engine URL is invalid") from error

    if parsed.scheme != "http" or not parsed.hostname:
        raise EngineError("engine URL must be an HTTP loopback URL")
    if parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise EngineError("engine URL cannot contain credentials, query, or fragment")
    if parsed.path not in ("", "/"):
        raise EngineError("engine URL cannot include a path")
    if port is not None and not 1 <= port <= 65535:
        raise EngineError("engine URL port must be between 1 and 65535")

    host = parsed.hostname.lower()
    try:
        is_loopback = ipaddress.ip_address(host).is_loopback
    except ValueError:
        is_loopback = host == "localhost"
    if not is_loopback:
        raise EngineError("engine URL must use localhost or a loopback IP address")

    return value.rstrip("/")


class VoicevoxClient:
    def __init__(
        self, base_url: str, docker_container: str | None = None
    ) -> None:
        self.base_url = validate_engine_url(base_url)
        if docker_container is not None and not re.fullmatch(
            r"[A-Za-z0-9][A-Za-z0-9_.-]*", docker_container
        ):
            raise EngineError("Docker container name is invalid")
        self.docker_container = docker_container
        self.opener = build_opener(_NoRedirectHandler)

    def request(
        self,
        path: str,
        *,
        method: str = "GET",
        params: dict[str, str] | None = None,
        body: bytes | None = None,
        content_type: str | None = None,
    ) -> bytes:
        url = f"{self.base_url}{path}"
        if params:
            url = f"{url}?{urlencode(params)}"
        headers = {"Content-Type": content_type} if content_type else {}
        if self.docker_container is not None:
            return self._request_in_container(
                url, path, method=method, body=body, headers=headers
            )

        request = Request(url, data=body, headers=headers, method=method)
        try:
            with self.opener.open(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
                if not 200 <= response.status < 300:
                    raise EngineError(
                        f"VOICEVOX {path} returned HTTP {response.status}"
                    )
                return response.read()
        except HTTPError as error:
            try:
                detail = error.read(400).decode("utf-8", errors="replace").strip()
            finally:
                error.close()
            suffix = f": {detail}" if detail else ""
            raise EngineError(
                f"VOICEVOX {path} returned HTTP {error.code}{suffix}"
            ) from error
        except (TimeoutError, URLError, OSError) as error:
            raise EngineError(
                f"cannot reach local VOICEVOX at {self.base_url}: {error}"
            ) from error

    def _request_in_container(
        self,
        url: str,
        path: str,
        *,
        method: str,
        body: bytes | None,
        headers: dict[str, str],
    ) -> bytes:
        if self.docker_container is None:
            raise EngineError("Docker container was not configured")
        marker = b"\n__VOICEVOX_HTTP_STATUS__"
        command = ["docker", "exec"]
        if body is not None:
            command.append("--interactive")
        command.extend(
            [
                self.docker_container,
                "curl",
                "--silent",
                "--show-error",
                "--max-time",
                str(REQUEST_TIMEOUT_SECONDS),
                "--request",
                method,
            ]
        )
        for name, value in headers.items():
            command.extend(["--header", f"{name}: {value}"])
        if body is not None:
            command.extend(["--data-binary", "@-"])
        command.extend(["--write-out", marker.decode() + "%{http_code}", url])

        try:
            response = subprocess.run(
                command,
                input=body,
                capture_output=True,
                check=False,
                timeout=REQUEST_TIMEOUT_SECONDS + 5,
            )
        except (OSError, subprocess.TimeoutExpired) as error:
            raise EngineError(
                f"cannot reach VOICEVOX inside Docker container "
                f"{self.docker_container}: {error}"
            ) from error

        if response.returncode != 0:
            detail = response.stderr.decode("utf-8", errors="replace").strip()
            suffix = f": {detail}" if detail else ""
            raise EngineError(f"Docker request to VOICEVOX {path} failed{suffix}")

        marker_index = response.stdout.rfind(marker)
        if marker_index < 0:
            raise EngineError(
                f"Docker request to VOICEVOX {path} returned no HTTP status"
            )
        content = response.stdout[:marker_index]
        status_bytes = response.stdout[marker_index + len(marker) :]
        try:
            status = int(status_bytes)
        except ValueError as error:
            raise EngineError(
                f"Docker request to VOICEVOX {path} returned an invalid HTTP status"
            ) from error
        if not 200 <= status < 300:
            detail = content[:400].decode("utf-8", errors="replace").strip()
            suffix = f": {detail}" if detail else ""
            raise EngineError(f"VOICEVOX {path} returned HTTP {status}{suffix}")
        return content

    def speakers(self) -> list[Any]:
        try:
            speakers = json.loads(self.request("/speakers"))
        except json.JSONDecodeError as error:
            raise EngineError("VOICEVOX /speakers returned invalid JSON") from error
        if not isinstance(speakers, list):
            raise EngineError("VOICEVOX /speakers returned an invalid response")
        return speakers

    def synthesize(self, text: str, style_id: int) -> tuple[bytes, str, str]:
        speaker_name, style_name = find_style(self.speakers(), style_id)
        query_body = self.request(
            "/audio_query",
            method="POST",
            params={"text": text, "speaker": str(style_id)},
            body=b"",
        )
        try:
            query = json.loads(query_body)
        except json.JSONDecodeError as error:
            raise EngineError("VOICEVOX /audio_query returned invalid JSON") from error
        if not isinstance(query, dict) or not query:
            raise EngineError("VOICEVOX /audio_query returned an empty query")

        wav = self.request(
            "/synthesis",
            method="POST",
            params={"speaker": str(style_id)},
            body=json.dumps(query, ensure_ascii=False).encode("utf-8"),
            content_type="application/json",
        )
        if len(wav) < 12 or wav[:4] != b"RIFF" or wav[8:12] != b"WAVE":
            raise EngineError("VOICEVOX /synthesis returned invalid WAV audio")
        return wav, speaker_name, style_name


def find_style(speakers: list[Any], style_id: int) -> tuple[str, str]:
    for speaker in speakers:
        if not isinstance(speaker, dict):
            continue
        styles = speaker.get("styles")
        if not isinstance(styles, list):
            continue
        for style in styles:
            if isinstance(style, dict) and style.get("id") == style_id:
                speaker_name = speaker.get("name")
                style_name = style.get("name")
                if isinstance(speaker_name, str) and isinstance(style_name, str):
                    return speaker_name, style_name
    raise EngineError(f"VOICEVOX style ID {style_id} is not available")


def print_speakers(speakers: list[Any]) -> None:
    count = 0
    for speaker in speakers:
        if not isinstance(speaker, dict) or not isinstance(speaker.get("name"), str):
            continue
        styles = speaker.get("styles")
        if not isinstance(styles, list):
            continue
        for style in styles:
            if not isinstance(style, dict) or not isinstance(style.get("id"), int):
                continue
            if not isinstance(style.get("name"), str):
                continue
            print(f"{style['id']}\t{speaker['name']} / {style['name']}")
            count += 1
    if count == 0:
        raise EngineError("VOICEVOX /speakers contained no usable styles")


def read_text(args: argparse.Namespace) -> str:
    if args.text is not None:
        value = args.text
    else:
        try:
            value = args.text_file.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as error:
            raise EngineError(
                f"cannot read UTF-8 text file {args.text_file}: {error}"
            ) from error
    spoken_text = args.reading if args.reading is not None else value
    if not spoken_text.strip():
        raise EngineError("speech text must not be empty")
    return spoken_text


def save_wav(output: Path, wav: bytes, *, overwrite: bool) -> None:
    if output.suffix.lower() != ".wav":
        raise EngineError("output must use a .wav extension")
    if output.exists() and not overwrite:
        raise EngineError(
            f"output already exists; pass --overwrite to replace it: {output}"
        )
    if output.exists() and output.is_dir():
        raise EngineError(f"output path is a directory: {output}")

    output.parent.mkdir(parents=True, exist_ok=True)
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb",
            prefix=f".{output.name}.",
            suffix=".tmp",
            dir=output.parent,
            delete=False,
        ) as temporary:
            temporary_path = Path(temporary.name)
            temporary.write(wav)
        if overwrite:
            os.replace(temporary_path, output)
        else:
            # Hard-link creation is atomic and fails if another process created the target.
            os.link(temporary_path, output)
            temporary_path.unlink()
    except FileExistsError as error:
        raise EngineError(
            f"output appeared during synthesis; left it unchanged: {output}"
        ) from error
    except OSError as error:
        raise EngineError(f"cannot write WAV file {output}: {error}") from error
    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Synthesize Japanese speech with local VOICEVOX Engine."
    )
    parser.add_argument(
        "--engine-url",
        default=DEFAULT_ENGINE_URL,
        help="local engine URL (default: %(default)s)",
    )
    parser.add_argument(
        "--docker-container",
        help="run curl inside this existing container; use its loopback Engine URL",
    )
    parser.add_argument(
        "--list-speakers",
        action="store_true",
        help="list available style IDs and names",
    )
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--text", help="exact text to synthesize")
    source.add_argument(
        "--text-file", type=Path, help="UTF-8 file containing the text to synthesize"
    )
    parser.add_argument(
        "--reading",
        help="optional kana reading to synthesize instead of the supplied text",
    )
    parser.add_argument(
        "--style-id", type=int, help="VOICEVOX style ID (the API calls this speaker)"
    )
    parser.add_argument("--output", type=Path, help="destination WAV path")
    parser.add_argument(
        "--overwrite", action="store_true", help="replace an existing output file"
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        client = VoicevoxClient(args.engine_url, args.docker_container)
        if args.list_speakers:
            if any(
                (
                    args.text is not None,
                    args.text_file is not None,
                    args.reading is not None,
                    args.style_id is not None,
                    args.output is not None,
                    args.overwrite,
                )
            ):
                parser.error(
                    "--list-speakers cannot be combined with synthesis options"
                )
            print_speakers(client.speakers())
            return 0

        if args.text is None and args.text_file is None:
            parser.error("provide --text or --text-file unless using --list-speakers")
        if args.style_id is None or args.style_id <= 0:
            parser.error("--style-id must be a positive style ID")
        if args.output is None:
            parser.error("--output is required for synthesis")

        wav, speaker_name, style_name = client.synthesize(
            read_text(args), args.style_id
        )
        save_wav(args.output, wav, overwrite=args.overwrite)
    except EngineError as error:
        parser.exit(2, f"{parser.prog}: error: {error}\n")

    print(
        f"Generated WAV with {speaker_name} / {style_name} (style {args.style_id}): {args.output.resolve()}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
