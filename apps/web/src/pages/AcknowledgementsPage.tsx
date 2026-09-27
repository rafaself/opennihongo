import { Link } from "@tanstack/react-router";
import { Divider, Stack, Surface, Text } from "@opennihongo/ui";

export function AcknowledgementsPage() {
  return (
    <section
      aria-labelledby="acknowledgements-title"
      className="my-auto max-w-3xl py-12"
    >
      <Stack gap="8">
        <Stack gap="3">
          <Text color="secondary" variant="label">
            Project information and credits
          </Text>
          <Text id="acknowledgements-title" variant="display">
            Acknowledgements &amp; licenses
          </Text>
          <Text color="secondary">
            This page records the project&apos;s current licensing status,
            third-party credits, and dependency policy.
          </Text>
        </Stack>

        <Surface className="p-6 md:p-8" elevation="card">
          <Stack gap="6">
            <section aria-labelledby="project-status-title">
              <Stack gap="2">
                <Text id="project-status-title" variant="heading">
                  Project licensing
                </Text>
                <Text>
                  OpenNihongo&apos;s license decision is pending. Until a
                  project license is published, no permission to copy, modify,
                  distribute, or reuse OpenNihongo code is granted here.
                </Text>
              </Stack>
            </section>

            <Divider decorative />

            <section aria-labelledby="credits-title">
              <Stack gap="3">
                <Text id="credits-title" variant="heading">
                  Acknowledgements
                </Text>
                <ul className="list-inside list-disc space-y-2">
                  <li>
                    Nunito by The Nunito Project Authors is used under the SIL
                    Open Font License 1.1. Its license is included with the font
                    files in the repository.
                  </li>
                  <li>
                    React and React DOM, TanStack Router, Radix UI Primitives,
                    and Floating UI are used under the MIT License.
                  </li>
                  <li>
                    The production dependency tree also includes packages under
                    the permissive 0BSD and Unlicense terms.
                  </li>
                </ul>
              </Stack>
            </section>

            <Divider decorative />

            <section aria-labelledby="pronunciation-audio-title">
              <Stack gap="3">
                <Text id="pronunciation-audio-title" variant="heading">
                  Pronunciation audio
                </Text>
                <Text>
                  Our pronunciation audio is generated with VOICEVOX Nemo Engine
                  using VOICEVOX Nemo. The canonical pronunciation catalog uses
                  女声1 / ノーマル (style ID 10005); the complete Hiragana chart
                  and its matching Katakana chart use 男声2 / ノーマル (style ID
                  10000). The required voice credit is{" "}
                  <strong>VOICEVOX Nemo</strong>.
                </Text>
                <Text>
                  The{" "}
                  <a
                    className="font-bold text-brand-text underline"
                    href="https://voicevox.hiroshiba.jp/nemo/term/"
                  >
                    VOICEVOX Nemo terms
                  </a>{" "}
                  permit commercial and non-commercial use of generated audio
                  with credit and list additional conditions. The{" "}
                  <a
                    className="font-bold text-brand-text underline"
                    href="https://voicevox.hiroshiba.jp/term/"
                  >
                    VOICEVOX software terms
                  </a>{" "}
                  also require a credit identifying VOICEVOX and compliance with
                  the selected voice library&apos;s terms.
                </Text>
                <Text>
                  The engine is used to generate assets and is not included in
                  the application. Its source project offers the engine under
                  LGPL v3 or a separate license by request. See the{" "}
                  <a
                    className="font-bold text-brand-text underline"
                    href="https://github.com/VOICEVOX/voicevox_nemo_engine/blob/master/LICENSE"
                  >
                    VOICEVOX Nemo Engine license
                  </a>{" "}
                  and its{" "}
                  <a
                    className="font-bold text-brand-text underline"
                    href="https://github.com/VOICEVOX/voicevox_nemo_engine/blob/master/LGPL_LICENSE"
                  >
                    LGPL v3 text
                  </a>
                  .
                </Text>
              </Stack>
            </section>

            <Divider decorative />

            <section aria-labelledby="dependency-policy-title">
              <Stack gap="2">
                <Text id="dependency-policy-title" variant="heading">
                  Dependency policy
                </Text>
                <Text>
                  We add third-party dependencies only when their licenses are
                  permissive and compatible with the project&apos;s intended
                  distribution. Before adoption, we review the package and its
                  transitive dependencies, license and notice requirements,
                  maintenance activity, security posture, and reliable
                  availability.
                </Text>
                <Text color="secondary">
                  We do not adopt copyleft, source-available, custom, missing,
                  or unclear licenses. Fonts may use the SIL Open Font License
                  1.1, with its required notice retained alongside the font
                  files. Dependency approval does not grant rights to reuse
                  OpenNihongo code. Versions and declarations are recorded in
                  the workspace manifests and lockfile.
                </Text>
              </Stack>
            </section>
          </Stack>
        </Surface>

        <Link className="font-bold text-brand-text underline" to="/">
          Back to Learn
        </Link>
      </Stack>
    </section>
  );
}
