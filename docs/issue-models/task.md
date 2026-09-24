# Task issue model

Use this model when an AI agent creates an executable issue for implementation,
refactoring, documentation, tooling, investigation, or similar scoped work.

This is an authoring model, not a GitHub issue form.

## Recommended title

Prefer:

`[Scope1][Scope2] Issue title`

Scopes are optional and should only be included when they add useful context.

Examples:

- `[Kana][UI] Add hiragana table`
- `[Persistence] Add progress export`
- `[Core][SRS] Define review state transitions`
- `Improve onboarding copy`

Do not add a `[Task]` marker.

## Context

Explain why the work is needed and the problem it addresses.

## Objective

Describe the concrete outcome this task should produce.

## Implementation

Describe the intended approach, relevant technical areas, and important
implementation considerations.

Use prose or regular bullet points when useful. Do not use checkboxes here.
Implementation details are guidance for the work, not a second completion
checklist.

## Acceptance criteria

Use checkboxes only for objective, externally verifiable conditions that define
when the task is complete.

- [ ] ...
- [ ] ...

Keep the list focused. Avoid restating every implementation step as an
acceptance criterion.

## Constraints

Document relevant non-goals, compatibility requirements, architecture
boundaries, migration concerns, or security constraints.

## Dependencies

List issue or architectural dependencies when applicable. Use `None` when
there are no known dependencies.
