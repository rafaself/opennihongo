import contextlib
import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from audio_generator.cli import main
from audio_generator.validation import AssetValidationError, AssetValidationReport


class ValidationCommandTests(unittest.TestCase):
    def test_validate_only_reports_the_number_of_valid_assets(self) -> None:
        stdout = io.StringIO()
        with (
            tempfile.TemporaryDirectory() as directory,
            patch(
                "audio_generator.cli.validate_asset_directory",
                return_value=AssetValidationReport(3),
            ) as validate,
            contextlib.redirect_stdout(stdout),
        ):
            result = main(["--validate-only", "--output-dir", directory])

        self.assertEqual(result, 0)
        validate.assert_called_once_with(Path(directory))
        self.assertIn("Validated 3 audio asset(s)", stdout.getvalue())

    def test_validate_only_reports_invalid_assets_without_synthesis(self) -> None:
        stderr = io.StringIO()
        with (
            patch(
                "audio_generator.cli.validate_asset_directory",
                side_effect=AssetValidationError("audio checksum mismatch"),
            ) as validate,
            contextlib.redirect_stderr(stderr),
        ):
            result = main(["--validate-only"])

        self.assertEqual(result, 2)
        validate.assert_called_once()
        self.assertIn("audio checksum mismatch", stderr.getvalue())


if __name__ == "__main__":
    unittest.main()
