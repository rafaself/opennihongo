"""Small standard-library client for the local VOICEVOX Engine API."""

from __future__ import annotations

import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import HTTPRedirectHandler, Request, build_opener

from audio_generator.config import GeneratorConfig, validate_engine_url
from audio_generator.models import AudioDefinition


class VoicevoxError(RuntimeError):
    """Raised for engine connectivity, configuration, or synthesis errors."""


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


class VoicevoxClient:
    def __init__(self, config: GeneratorConfig) -> None:
        self.config = config
        validate_engine_url(config.engine_url)
        self.base_url = config.engine_url.rstrip("/")
        self._opener = build_opener(_NoRedirectHandler)

    def verify_engine(self) -> str:
        version_value = self._json_request("/version")
        if not isinstance(version_value, str):
            raise VoicevoxError("VOICEVOX /version returned an invalid response")
        if version_value not in {self.config.engine_version, "latest"}:
            raise VoicevoxError(
                f"VOICEVOX engine version mismatch: configured {self.config.engine_version}, "
                f"running {version_value}"
            )

        speakers = self._json_request("/speakers")
        if not isinstance(speakers, list):
            raise VoicevoxError("VOICEVOX /speakers returned an invalid response")
        for speaker in speakers:
            if (
                not isinstance(speaker, dict)
                or speaker.get("name") != self.config.speaker_name
            ):
                continue
            styles = speaker.get("styles")
            if not isinstance(styles, list):
                break
            for style in styles:
                if (
                    isinstance(style, dict)
                    and style.get("id") == self.config.style_id
                    and style.get("name") == self.config.style_name
                ):
                    return version_value
            break
        raise VoicevoxError(
            "configured VOICEVOX style is unavailable: "
            f"{self.config.speaker_name} / {self.config.style_name} ({self.config.style_id})"
        )

    def synthesize(self, definition: AudioDefinition) -> bytes:
        query_bytes = self._request(
            "/audio_query",
            method="POST",
            params={"text": definition.reading, "speaker": str(self.config.style_id)},
            body=b"",
        )
        try:
            query: Any = json.loads(query_bytes)
        except json.JSONDecodeError as error:
            raise VoicevoxError(
                f"VOICEVOX /audio_query returned invalid JSON for {definition.id}"
            ) from error
        if not isinstance(query, dict) or not query:
            raise VoicevoxError(
                f"VOICEVOX /audio_query returned an empty query for {definition.id}"
            )

        wav = self._request(
            "/synthesis",
            method="POST",
            params={"speaker": str(self.config.style_id)},
            body=json.dumps(query, ensure_ascii=False).encode("utf-8"),
            content_type="application/json",
        )
        if len(wav) < 12 or wav[:4] != b"RIFF" or wav[8:12] != b"WAVE":
            raise VoicevoxError(
                f"VOICEVOX /synthesis returned invalid WAV audio for {definition.id}"
            )
        return wav

    def _json_request(self, path: str) -> Any:
        response = self._request(path)
        try:
            return json.loads(response)
        except json.JSONDecodeError as error:
            raise VoicevoxError(f"VOICEVOX {path} returned invalid JSON") from error

    def _request(
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
        request = Request(url, data=body, headers=headers, method=method)
        try:
            with self._opener.open(
                request, timeout=self.config.timeout_seconds
            ) as response:
                if not 200 <= response.status < 300:
                    raise VoicevoxError(
                        f"VOICEVOX {path} returned HTTP {response.status}"
                    )
                return response.read()
        except HTTPError as error:
            try:
                detail = error.read(300).decode("utf-8", errors="replace").strip()
            finally:
                error.close()
            suffix = f": {detail}" if detail else ""
            raise VoicevoxError(
                f"VOICEVOX {path} returned HTTP {error.code}{suffix}"
            ) from error
        except (TimeoutError, URLError, OSError) as error:
            raise VoicevoxError(
                f"cannot reach VOICEVOX engine at {self.base_url}: {error}"
            ) from error
