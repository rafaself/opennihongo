# Contributing to Nihon Shiga

## Workflow

Nihon Shiga uses a trunk-based workflow:

- `main` is the integration branch;
- work happens in short-lived branches;
- changes reach `main` through pull requests;
- pull requests are squash-merged.

Recommended branch names include:

- `feat/kana-table`
- `fix/backup-import`
- `refactor/core-model`
- `docs/architecture`

## Commit and pull request convention

Commits intended for the permanent history and pull request titles follow
Conventional Commits:

`type(scope?): message`

The scope is optional. Use it only when it adds useful context.

Examples:

- `feat(kana): add hiragana table`
- `fix(persistence): validate imported progress`
- `refactor(core): simplify learning session`
- `docs: update contribution guide`
- `chore: configure repository`

Supported types:

- `feat`
- `fix`
- `refactor`
- `test`
- `docs`
- `chore`
- `ci`
- `build`
- `perf`
- `revert`

Common scopes may include `web`, `core`, `ui`, `kana`, `kanji`,
`grammar`, `learning`, `persistence`, `backup`, `data`, `tooling`,
`deps`, and `repo`. This is intentionally not a whitelist.

Subjects should be concise, imperative, start with a lowercase character, and
not end with a period.

Breaking changes may use `!`, for example:

`feat(core)!: change progress serialization format`

Because pull requests are squash-merged, the pull request title becomes the
primary commit message that enters `main`.

## Issues

Manual GitHub issues intentionally remain simple and unrestricted. Blank issues
are enabled so maintainers and contributors can provide a title and free-form
description without completing an engineering template.

When AI agents author structured issues, use the models in
`docs/issue-models/`:

- `task.md` for scoped executable work;
- `epic.md` for multi-issue initiatives.

### Recommended issue titles

Issue title formatting is a recommendation, not an enforced rule.

For regular issues, prefer:

`[Scope1][Scope2] Issue title`

Scopes are optional. Do not add a `[Task]` marker.

For epics, prefer:

`[Epic][Scope1][Scope2] Issue title`

`[Epic]` is the only special marker used to identify an epic.

Examples:

- `[Kana][UI] Add hiragana table`
- `[Persistence] Add progress export`
- `[Epic][Kana] Kana learning foundation`
- `[Epic] Initial learning experience`
