# Agent instructions

## Guidance

- Keep changes focused on the requested scope. Avoid unrelated refactors and speculative abstractions.
- Follow existing repository patterns, contracts, and documented conventions before introducing new ones.
- Treat the source-directory and file-size limits in `docs/architecture/frontend.md` as blocker boundaries, not suggestions. Do not proceed with a change that would exceed 12 direct source entries or 400 physical lines in a handwritten implementation/test file; reorganize first. If a touched folder or file is already over a limit, bring it within the limit before adding implementation there. If a safe, responsibility-based split cannot meet the limits, stop and ask the user before continuing. Exceeding either limit requires explicit prior user approval; a rationale in the final report or pull request is not approval.
- Use TDD for new or changed behavior when the behavior can reasonably and meaningfully be verified with automated tests. Follow `docs/engineering/testing.md`.
- Add or update tests when they protect meaningful behavior, domain rules, contracts, regressions, edge cases, or important user interactions.
- Do not create tests mechanically for every implementation change. Trivial visual adjustments, configuration-only changes, simple wiring, or other changes without meaningful behavioral risk do not require new tests solely because code changed.
- When functionality is intentionally removed, remove obsolete tests with it when appropriate. Do not add tests merely to prove that the removed functionality is absent.
- Add negative or absence tests only when the absence itself is a meaningful ongoing requirement, invariant, security boundary, regression risk, or product behavior that needs protection.
- Treat existing tests as behavior contracts. Never weaken, remove, skip, or rewrite tests solely to make the suite pass.
- When behavior, contracts, or engineering policy intentionally change, update the relevant tests and documentation together when applicable.
- Run the smallest relevant validation for the change and expand validation when the affected scope or risk requires it.
- Do not bypass or weaken repository quality gates to complete a task.
- If implementation, tests, requirements, or repository documentation conflict in a way that affects how the task should proceed, stop and ask the user how to resolve the conflict. Continue only after the user explicitly clarifies the intended direction.

## Repository guidance

Consult repository documentation contextually when it is relevant to the task:

- Code organization, frontend ownership, and package boundaries: `docs/architecture/frontend.md`
- Git, commits, pull requests, and contribution workflow: `CONTRIBUTING.md`
- Testing and TDD policy: `docs/engineering/testing.md`
- Issue creation guidance: `docs/issue-models/`

Do not load unrelated documentation by default.
