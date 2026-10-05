# Learning history and progress

The learning architecture records completed exercise outcomes through one generic
history model. `@opennihongo/core` owns immutable `LearningRecord` contracts and
the pure `deriveItemProgress` projection. `@opennihongo/content` owns stable item
and profile identifiers. `@opennihongo/persistence` stores and migrates evidence;
it does not evaluate answers or calculate progress. The web app allocates session
and record occurrence IDs, supplies completion timestamps, and composes these
public APIs. React components present interactions and save status.

## Recording evidence

Each completed exercise produces the existing `ExerciseResult`. A learning record
wraps it with a unique record ID, session ID, profile ID, and completion timestamp.
The record is a deeply frozen snapshot. It contains per-item correct/incorrect
outcomes, including skips reported by the current evaluator. It does not contain
raw answers, accepted answers, generated exercise definitions, routes, or React
state. An exercise contributes one outcome per source item. The result's attempt
count preserves interaction metadata; it is not a universal item-attempt count.

Generation seeds remain independent from session occurrence IDs. Explicit inputs
and seeds remain reproducible; each real run receives a fresh opaque session ID.

The app appends a record when an exercise finishes. Its record ID and timestamp
remain stable across retries. Identical concurrent writes are idempotent; a
same-ID/different-payload write is rejected. The recorder retains failed writes
in the current view's memory and exposes a local retry action. Transient exercise
feedback remains usable even if storage fails. Navigating away does not cancel a
write already in flight, but uncommitted records are not durably queued.

## Local schema and migration

IndexedDB database `opennihongo` is version 3. `learningRecords` stores version-1
envelopes keyed by `record.id`, with session and multi-entry source-item indexes.
`itemProgressBaselines` stores version-1 imported baselines keyed by item ID and
tagged with `kana-progress-v1` provenance. Runtime readers validate both envelope
versions and domain invariants. IDs are opaque; persistence does not import the
content catalog to validate them.

The history upgrade stage for databases below version 2 copies `kanaProgress` rows into generic
initial baselines and removes the old store in the same version-change
transaction. A successfully committed database version is the migration marker.
An invalid row aborts the entire upgrade, preserving the v1 database for recovery.
The old counts and `lastAnsweredAt` values are preserved, with the latter mapped
to `lastPracticedAt`. No historical exercise or session records are fabricated:
those details were never stored and cannot be recovered.

The version-3 upgrade adds `writingHistoryProgress`, a separate version-1
envelope containing the last history chapter and explicitly completed chapter
IDs. Existing learning-record and baseline stores are retained when upgrading
from v2; they are not recreated. Fresh and v1 databases run both upgrade stages
in the same atomic transaction. Reading does not fabricate exercise evidence.
The [Writing history guide](writing-history.md) describes the public APIs,
resume rules and retry behavior.

## Derived progress

`deriveItemProgress(records, baselines)` returns sorted, immutable per-item
correct/incorrect counts, total completed observations, and latest activity time.
Counts include imported baselines and distinct completed records; duplicate
identical record IDs do not add evidence. Conflicting record IDs and duplicate
baselines fail explicitly. Ordering does not affect the projection. Latest times
are normalized to UTC; unsafe integer totals are rejected.

The projection is calculated on read and is not persisted as a cache. Targeted
history queries select records touching an item or belonging to a session. An
item query retains the whole multi-item result; consumers filter the derived
view to their authored set where appropriate. Session queries omit baselines,
which have no known session relationship.

In-session summaries use the existing core result scoring. Persisted result
groups contain completed exercises only and do not prove a whole session was
completed. Active-session resume, session manifests, mastery estimation, skill
taxonomies, streak rules, curriculum, adaptive policies, and SRS remain outside
this foundation. Later policies can consume the evidence without creating a
separate progress architecture for each content domain.

## Validation

Core tests protect result invariants and deterministic derivation. IndexedDB
integration tests protect targeted reads, duplicate writes, conflicts, and atomic
v1 migration. Web component tests isolate device storage while protecting
keyboard, focus, save failure, and retry behavior. Run
`pnpm --filter @opennihongo/web test:e2e` for the real-browser migration,
record/reload, and vocabulary-card journeys.
