# Epic issue model

Use this model when an AI agent creates an epic that coordinates multiple
issues toward one broader outcome.

This is an authoring model, not a GitHub issue form.

## Recommended title

Prefer:

`[Epic][Scope1][Scope2] Issue title`

`[Epic]` is the only special issue-type marker used in titles.

Scopes are optional and should only be included when they add useful context.

Examples:

- `[Epic][Kana] Kana learning foundation`
- `[Epic][Persistence][Backup] Local data portability`
- `[Epic] Initial learning experience`

## Summary

Describe the final outcome of the epic.

## Architecture decisions

Document global architecture decisions and invariants inherited by child
issues.

- ...

## Out of scope

Define explicit boundaries for the epic.

- ...

## Child issues

- [ ] #...
- [ ] #...

## Dependency graph

Describe ordering constraints and dependencies between child issues.

- ...

## Shared surfaces

Document contracts, schemas, files, modules, or other surfaces that require
coordination across child issues.

- ...

## Acceptance criteria

- [ ] ...
- [ ] ...
