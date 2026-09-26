import json
import tempfile
import unittest
from pathlib import Path

from audio_generator.models import InputError, load_definitions, parse_definitions


class DefinitionTests(unittest.TestCase):
    def test_parses_one_definition_and_a_batch(self) -> None:
        one = {"id": "nihongo", "text": "日本語", "reading": "にほんご"}
        batch = [one, {"id": "kana.hiragana.a", "text": "あ", "reading": "あ"}]

        self.assertEqual(parse_definitions(one)[0].reading, "にほんご")
        self.assertEqual(len(parse_definitions(batch)), 2)

    def test_loads_json_file(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "content.json"
            path.write_text(
                json.dumps({"id": "nihongo", "text": "日本語", "reading": "にほんご"}),
                encoding="utf-8",
            )

            self.assertEqual(load_definitions(path)[0].id, "nihongo")

    def test_rejects_duplicate_ids(self) -> None:
        definition = {"id": "nihongo", "text": "日本語", "reading": "にほんご"}

        with self.assertRaisesRegex(InputError, "duplicate"):
            parse_definitions([definition, definition])

    def test_rejects_unsafe_ids_and_missing_readings(self) -> None:
        with self.assertRaisesRegex(InputError, "id"):
            parse_definitions(
                {"id": "../nihongo", "text": "日本語", "reading": "にほんご"}
            )
        with self.assertRaisesRegex(InputError, "reading"):
            parse_definitions({"id": "nihongo", "text": "日本語"})


if __name__ == "__main__":
    unittest.main()
