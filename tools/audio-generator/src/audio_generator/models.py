"""Input models and validation for curated pronunciation content."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

_ASSET_ID = re.compile(r"[a-z0-9]+(?:[._-][a-z0-9]+)*\Z")


class InputError(ValueError):
    """Raised when a content definition is invalid."""


@dataclass(frozen=True)
class AudioDefinition:
    id: str
    text: str
    reading: str

    def __post_init__(self) -> None:
        if not isinstance(self.id, str) or not _ASSET_ID.fullmatch(self.id):
            raise InputError(
                "id must contain lowercase letters, digits, dots, underscores, or hyphens"
            )
        if not isinstance(self.text, str) or not self.text.strip():
            raise InputError(f"text for {self.id} must be a non-empty string")
        if not isinstance(self.reading, str) or not self.reading.strip():
            raise InputError(f"reading for {self.id} must be a non-empty string")


def parse_definitions(value: Any) -> tuple[AudioDefinition, ...]:
    """Parse one definition or a JSON-style array of definitions."""
    rows = value if isinstance(value, list) else [value]
    if not rows:
        raise InputError("content must include at least one definition")

    definitions: list[AudioDefinition] = []
    seen: set[str] = set()
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            raise InputError(f"definition {index + 1} must be an object")
        for field in ("id", "text", "reading"):
            if field not in row:
                raise InputError(f"definition {index + 1} is missing {field}")
        if any(not isinstance(row[field], str) for field in ("id", "text", "reading")):
            raise InputError(
                f"definition {index + 1} id, text, and reading must be strings"
            )

        definition = AudioDefinition(row["id"], row["text"], row["reading"])
        if definition.id in seen:
            raise InputError(f"duplicate id: {definition.id}")
        seen.add(definition.id)
        definitions.append(definition)
    return tuple(definitions)


def load_definitions(path: str | Path) -> tuple[AudioDefinition, ...]:
    """Load definitions from a UTF-8 JSON file."""
    source = Path(path)
    try:
        value = json.loads(source.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise InputError(f"cannot read content file {source}: {error}") from error
    return parse_definitions(value)
