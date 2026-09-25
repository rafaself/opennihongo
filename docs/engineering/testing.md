# Testing strategy

This document defines the testing policy for the OpenNihongo MVP.

The goal is not merely to keep the test suite green. Tests must represent
intended domain behavior, product requirements, contracts, and regressions.

## Principles

Tests are part of the product specification.

When behavior changes intentionally, tests must change with it. When behavior
does not change, tests should normally remain stable during refactors.

Tests must not be weakened, skipped, deleted, or rewritten solely to make the
suite pass.

If a test fails because the implementation violates an existing requirement,
fix the implementation rather than changing the expectation.

Removing or changing a test is appropriate when the corresponding behavior,
requirement, contract, or obsolete functionality has intentionally changed.

## Test layers

### Unit tests

Use unit tests for pure domain behavior and deterministic business rules.

Typical targets include:

- learning and review rules;
- SRS scheduling;
- progress calculations;
- kana and kanji domain logic;
- validation;
- serialization;
- migrations;
- backup format behavior;
- other framework-independent logic.

Unit tests should be fast and should avoid browser APIs, IndexedDB, network
access, and unnecessary mocks.

### Integration tests

Use integration tests when correctness depends on multiple real application
components working together.

Typical targets include:

- repositories with IndexedDB;
- persistence adapters;
- backup export and import;
- migrations across stored data versions;
- serialization and deserialization boundaries;
- interactions between domain and persistence layers.

Prefer real collaborators where practical. Mock only external boundaries or
dependencies that are impractical to execute in the test environment.

### Component tests

Use component tests for important user-observable UI behavior.

Tests should interact with the UI as a user would and assert visible behavior,
accessibility semantics, or externally observable state changes.

Avoid testing React implementation details, component internals, or framework
mechanics.

### End-to-end tests

Keep the E2E suite focused on critical user journeys and browser-specific
behavior.

Initial high-value flows include:

- open the application, study content, record progress, reload, and verify that
  progress persists;
- export local data, clear or replace local state, import the backup, and verify
  that the expected state is restored.

E2E tests complement unit and integration tests. They are not the primary
mechanism for achieving code coverage.

The focused Storybook screenshot baseline and its review/update procedure are
documented in the [visual regression guide](visual-regression.md).

## Tooling

The planned MVP testing stack is:

- **Vitest** for unit and integration tests;
- **@vitest/coverage-v8** for code coverage;
- **React Testing Library** for React component tests;
- **@testing-library/user-event** for realistic user interaction;
- **@testing-library/jest-dom** for DOM assertions;
- **fake-indexeddb** for fast IndexedDB integration tests in Node-based test
  environments;
- **Playwright** for real-browser E2E tests;
- **fast-check** for property-based tests and domain invariants.

Mutation testing with **StrykerJS** is recommended for critical domain code, but
it is not an MVP merge gate initially.

HTTP mocking with **MSW** may be introduced when the application gains HTTP
integration. It is not required for the local-first MVP.

## Coverage policy

The MVP has a global minimum coverage gate of **95%** for every primary metric:

- statements >= 95%;
- branches >= 95%;
- functions >= 95%;
- lines >= 95%.

Critical framework-independent domain code should target **100%** coverage where
practical, especially:

- core learning rules;
- SRS behavior;
- backup serialization;
- backup restoration;
- data migrations.

The long-term target may be raised toward 100% globally as the codebase
stabilizes.

Coverage thresholds are merge gates once the application scaffold and test
runner are in place.

## Coverage integrity

Coverage must reflect meaningful executable behavior.

Do not increase coverage artificially by:

- excluding testable production files without a documented reason;
- adding ignore directives only to satisfy the threshold;
- executing code without meaningful assertions;
- creating tests that merely mirror the implementation;
- replacing behavioral assertions with trivial assertions.

Source coverage configuration should include the relevant production source
trees explicitly so that untested files do not disappear from coverage reports.

Coverage is a quality gate, not a substitute for test quality.

## Domain-oriented testing

For domain logic, prefer tests that express rules and invariants rather than
implementation steps.

Property-based testing should be considered for behavior with broad input
spaces, including:

- scheduling invariants;
- ordering;
- deduplication;
- serialization round trips;
- migration invariants;
- progress calculations.

For time-dependent logic, use an explicit or controlled clock. Avoid relying on
the machine's real current time.

Tests should be deterministic. Avoid arbitrary sleeps, timing-sensitive
assertions, random inputs without reproducible seeds, and hidden shared state.

## Regression testing

When fixing a meaningful bug, add a regression test when practical.

The preferred sequence is:

1. reproduce the defect in a test;
2. confirm that the test fails for the expected reason;
3. fix the implementation;
4. confirm that the regression test and the broader suite pass.

A bug fix without a regression test should be exceptional and justified when a
reliable automated reproduction is impractical.

## Persistence and migrations

Persistence behavior requires both fast integration coverage and selected
real-browser coverage.

Use `fake-indexeddb` for the majority of repository and persistence integration
tests.

Use Playwright for critical flows that need a browser's real IndexedDB
implementation.

Versioned backup formats and migrations should maintain fixtures for relevant
historical versions. Tests must verify both successful migration and expected
failure behavior for invalid or unsupported data.

## Mocks

Mocks should isolate true boundaries, not hide domain behavior.

Prefer:

- pure functions and real domain objects;
- in-memory or test implementations of infrastructure boundaries;
- explicit test fixtures.

Avoid:

- mocking the unit's own domain collaborators unnecessarily;
- deep mocks that reproduce implementation structure;
- asserting internal call sequences when observable behavior is sufficient.

## Test changes during implementation

Use the following decision model:

- **new behavior**: add appropriate tests;
- **changed requirement**: update implementation and affected tests;
- **bug fix**: add a regression test when practical;
- **behavior removed**: remove obsolete implementation and obsolete tests;
- **internal refactor with unchanged behavior**: tests should normally remain
  unchanged;
- **failing test caused by incorrect implementation**: fix the implementation,
  not the expectation.

## CI expectations

Once the application scaffold exists, pull requests should run at least:

- unit and integration tests;
- component tests where applicable;
- coverage validation;
- type checking;
- linting;
- build validation.

Critical E2E tests should also become required before merge once the first
user-facing flows exist.

The testing commands and CI implementation will be formalized when the
application scaffold is introduced.
