# OpenNihongo

A local-first platform for learning the Japanese language.

## Development

The frontend uses pnpm for workspace dependencies and Nx for project graph,
task orchestration, caching, affected execution, and architecture enforcement.
Install dependencies with `pnpm install`, start the web app with `pnpm dev`,
and run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, and `pnpm build`.
Use `pnpm format` to apply formatting. Use `pnpm nx affected -t lint typecheck
test build build-storybook --base=origin/main --head=HEAD` to validate changed
projects and their dependents.

See [the frontend architecture guide](docs/architecture/frontend.md) for module
ownership and dependency rules. The UI package's isolated component workshop is
available with `pnpm storybook`. See the [Design System developer workflow](docs/architecture/design-system-workflow.md)
for public imports, Storybook and Gallery responsibilities, and local validation commands.
See the [local VOICEVOX generation guide](tools/audio-generator/README.md) to
run the development-only audio engine.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for repository conventions and
development workflow.

## Licensing status

The project license is pending a final decision. Until a project license is
published, do not assume permission to copy, modify, distribute, or reuse
OpenNihongo code. Third-party software and assets remain subject to their own
license terms and notices.
