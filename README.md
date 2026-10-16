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

## Public website and deployment

The public app is hosted at <https://rafaself.github.io/opennihongo/>.
GitHub Pages serves the static frontend, including generated pronunciation
audio. Learning progress and preferences stay in each visitor's browser.

The `Deploy GitHub Pages` workflow validates and deploys pushes to `main`.
It can also be started manually from the Actions tab. Repository Settings →
Pages must use **GitHub Actions** as the publishing source. The repository is
public so Pages hosting and standard GitHub-hosted Actions runners are free.

Build and verify the same deployment locally:

```sh
pnpm install --frozen-lockfile
pnpm --filter @opennihongo/web build:pages
pnpm --filter @opennihongo/web exec playwright install chromium
pnpm --filter @opennihongo/web test:pages
pnpm --filter @opennihongo/web preview --base=/opennihongo/
```

Only `apps/web/dist` is published. The Pages build uses `/opennihongo/` as
Vite's asset base. Production builds use hash routing, such as
`/opennihongo/#/kanji`, so shared links and page refreshes work on static hosting.
The development server retains browser-history routing. Changing the repository
name or publishing under a custom domain requires updating the build base and
the production browser-test configuration.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for repository conventions and
development workflow.

## Licensing status

The project license is pending a final decision. Until a project license is
published, do not assume permission to copy, modify, distribute, or reuse
OpenNihongo code. Third-party software and assets remain subject to their own
license terms and notices.
