# Practice, feedback, and targeted review

## Outcome and scope

A learner can choose a beginner reading preset, practise Kana or words containing
Kanji, understand a correction with pronunciation and a concise explanation,
inspect item-level results, retry selected items, and find relevant reading
review after reloading. Existing games, optional theory checks, device-local
history, theme preferences, reduced motion, and GitHub Pages remain supported.

This release implements phases 0–3 of the design plan. It builds on documented
patterns from [Duolingo's Practice tab](https://blog.duolingo.com/guide-to-duolingo-practice-hub/),
[Busuu's focused review](https://help.busuu.com/hc/en-us/articles/16941530623249-How-do-I-review-specific-words-in-my-Vocabulary-Review),
[Khan Academy's progress reporting](https://support.khanacademy.org/hc/en-us/articles/360032987591-How-can-I-understand-my-progress-in-Khan-Academy),
and [OpenLearn's return-to-study navigation](https://www.open.edu/openlearn/get-started/frequently-asked-questions/how-start-course).
These are product references; learner benefits still require evaluation.

## Evidence contract

- Correctness continues to use the existing exercise evaluator and result model.
- New completion metadata identifies the exercise type and, for each source
  item, an answered, skipped, or self-reported response.
- Assistance records whether a hint or pronunciation was requested before
  submission. It does not prove that audio was heard or a hint was understood.
- A skip is distinct from an incorrect submitted answer. Existing scoring may
  still count both as incorrect; review and results explain the distinction.
- Flashcard recall is explicitly self-reported and is not assessed reading.
- New metadata is stored in a version-2 record envelope. Existing version-1
  records and imported totals retain their original meaning. Unknown historical
  assistance and skip reasons are not inferred from attempt counts.
- Results do not retain raw typed answers in durable history. Current answers
  may be presented transiently to explain the current exercise.
- Reading review is scoped by authored profile and current eligible content.
  It uses the latest reading observation for each item, with stable ordering
  for tied timestamps and duplicate/conflicting record handling.
- Incorrect, skipped, and help-requested readings can be revisited. A subsequent
  independent correct reading clears the item from this collection. An older
  incorrect result is labelled as historical evidence with unknown skip/help
  details. Imported totals do not establish a review reason.
- Review is an explainable practice selection, not a mastery estimate or SRS.

## User-facing flow

1. Practice offers beginner Kana and Kanji reading presets and a Reading review
   entry alongside existing configurable games.
2. A reading prompt retains its familiar input, optional help, keyboard controls,
   and canonical pronunciation.
3. Feedback presents the correct reading, a short content-derived explanation,
   pronunciation, and a predictable Continue action.
4. Results list the actual session items, distinguish correctness, skips, and
   requested help, and let the learner retry a selected subset.
5. Reading review explains selection, permits selection by subject and item,
   and opens a correctly configured fresh reading session.
6. Loading, empty, unavailable-storage, and retry states preserve a usable path
   into ordinary practice. Save failures retain the current retry controls.

The [clickable prototype](../prototypes/practice-review.html) is an intermediate
interaction artifact using illustrative content. It does not claim to store real
learning evidence. The implementation must use authored content and real local
persistence.

## Implementation responsibilities

- `core`: immutable evidence validation and a deterministic reading-review policy.
- `persistence`: versioned envelopes, validated reads, and idempotent writes.
- `content`: existing canonical readings, meanings, examples, and profile IDs.
- `web`: presets, review selection, explanatory presentation, result selection,
  recording help requests, and accessible navigation.

Keep new code inside responsibility-based folders, with at most 12 direct source
entries per folder and 400 physical lines per handwritten implementation/test.
Existing tests remain behavioral contracts. Use TDD for evidence, review rules,
storage compatibility, and important interactions.

## Completion audit

- [x] Inspect the current repository, result contracts, and package boundaries.
- [x] Build and inspect the intermediate clickable prototype (correction, skip,
      item results, and selected-item retry walkthrough).
- [x] Implement explicit evidence and versioned storage with compatibility tests.
- [x] Implement deterministic reading review with domain tests.
- [x] Deliver beginner presets and canonical corrective feedback.
- [x] Deliver item-level results and selected-item retry.
- [x] Deliver reload-safe reading review and storage recovery states.
- [x] Verify the complete flow with keyboard, mobile, and reduced motion.
- [x] Pass relevant package coverage, lint, formatting, type checks, build, and
      existing and new browser checks, including the production Pages build.
- [x] Capture screenshots and prepare a draft PR with validation evidence.

## Remaining learner validation

Observe Japanese beginners selecting practice, explaining a correction, choosing
review items, and returning on another day. Record task success, hesitation, and
requests for help. Evaluate delayed recall separately from usability. Check that
help-requested labels feel informative, that legacy-history explanations are
understandable, and that the review recommendation matches learners' intentions.
Automated checks and a prototype walkthrough do not establish learning gains.

## Storage and selection compatibility

The IndexedDB database remains version 3: the existing record store and indexes
are unchanged. Envelopes with explicit completion metadata use `schemaVersion: 2`;
records without metadata continue to use version 1. Readers accept both and
reject mismatched evidence versions. Existing records and imported baselines are
not rewritten. New flashcard records identify self-reported ratings or skips;
new graded sessions capture requests for hints and audio before completion.

Reading review uses the most recent timestamp per eligible item within its
reading profile. Equal timestamps use record identity as a deterministic tie
break; this does not infer a finer chronological order. Identical duplicate
records are ignored, and conflicting identities are rejected. Legacy correct
results do not add a review reason, but their assistance remains unknown.

Review checkbox selections are encoded in the review page's `reviewIds` search
parameter. Reloading that address preserves an explicit selection, including
none selected. Starting review creates a fresh normal reading session with only
selected canonical item IDs, capped at the existing 20-item session option.
Within-session retry creates a fresh session identity for the exact selected
exercises. A later correct reading without requested help clears that item from
saved review, without changing earlier evidence or claiming mastery.

Failed writes keep the immutable record available to Retry saving while the
session is open. Selected-item retry remains usable. The saved-review link is
available after writes finish successfully, so an unsaved answer is not presented
as saved review. Failed reads offer Retry loading and a return to normal practice.

## Validation evidence (2026-10-16)

| Check                                          | Result                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Core tests                                     | 219 passed; 100% statements, branches, functions, and lines                    |
| Persistence tests                              | 44 passed; 99.40% statements, 97.82% branches, 100% functions, 99.38% lines    |
| Web component tests                            | 297 passed; 98.15% statements, 95.23% branches, 99.84% functions, 98.76% lines |
| Development browser suite                      | 15 passed with one worker                                                      |
| Production Pages browser suite                 | 4 passed with one worker, including desktop and mobile reading review          |
| Repository lint, formatting, and type checking | Passed                                                                         |
| Production builds                              | Web, UI Gallery, Storybook, and the Pages build passed                         |
| Source boundaries                              | Affected source trees meet the 12-entry and 400-line limits                    |

The browser journeys verify canonical correction text, pronunciation requests,
keyboard submission and continuation, independent correctness, skips, assisted
correctness, item-level results, review selection, actual reload persistence,
queue clearing, mobile overflow, and reduced-motion use. Component tests cover
selected-item retry with a fresh identity, failed-save retry with the same record,
and failed history reads. Historical storage and migrations remain covered.

Manual browser inspection covered dark-theme desktop (1280 × 720) and mobile
(390 × 844), selected-item retry, a reloaded checkbox selection, and removal of a
subsequently correct independent reading from saved review. The temporary browser
viewport override was restored after inspection.

Screenshots from that walkthrough:

- [Beginner presets](../screenshots/practice-review/presets.jpg)
- [Contextual correction](../screenshots/practice-review/feedback.jpg)
- [Mobile feedback](../screenshots/practice-review/feedback-mobile.jpg)
- [Selectable results after review](../screenshots/practice-review/results.jpg)
- [Mobile review with a reloaded selection](../screenshots/practice-review/review-mobile.jpg)
- [Review after an independent correct reading clears an item](../screenshots/practice-review/review.jpg)

An initial concurrent browser run timed out under local resource contention. A
subsequent run reused a server that shut down and reported connection failures.
The complete suite then passed against a fresh server with one worker. Assertions,
timeouts, coverage gates, and repository test configuration were not weakened.
The production build reports Vite's non-blocking bundle-size advisory.

The draft PR is for review. Hosted deployment and human learner research are
separate from these local validation results.

Published for review as [draft PR #142](https://github.com/rafaself/opennihongo/pull/142).
GitHub applied the repository's existing administrator bypass when creating the
feature branch; repository rules were not changed. The release has not been
merged into `main` or deployed.
