# Japanese writing history

The optional introduction at `/writing-history` offers nine short chapters before
character practice. Home suggests it and primary navigation places it before
Kana. Every chapter is available immediately. Reading does not award exercise
results or require answers, dates, or historical mappings to be memorized.

## Content and ownership

`@opennihongo/content` exports the readonly `writingHistoryCatalog`, its chapter,
character and source collections, and `getWritingHistoryChapter` and
`getHistoricalCharacter`. The definitions live in `src/writing-history` with
chapter groups, character records, source provenance and validation separated
from presentation. Consumers use public package exports, never web components.

`HistoryChapter` has a stable slug ID, title, summary, estimated duration, and
ordered units. `HistoryUnit` is a discriminated union of explanation, diagram,
character comparison, script example, timeline and supplementary note. The web
feature renders unit kinds rather than chapter IDs. Additional chapters using
these units require content changes, not router or renderer changes.

Character comparisons gently reveal the newly selected glyphs and explanation
using semantic motion tokens. Selection stays immediate and keyboard focus
remains on the choices. System and application reduced-motion preferences
disable this animation. Example choices wrap on small screens.

`HistoricalCharacter` distinguishes script from form. A hentaigana entry is a
historical hiragana variant, not an independent script. Modern entries may link
to an existing canonical `LearningItemId`. Origin arrays describe source
characters, phonetic context, transformation, confidence, caveats and sources.
Multiple possible origins can be represented without claiming one certain
lineage. `relatedIds` describe other connections independently from origins.

The curated set includes eight hiragana pairs: 安 → あ, 以 → い, 宇 → う,
衣 → え, 於 → お, 加 → か, 左 → さ and 止 → と. It also includes the katakana
pairs 阿 → ア and 加 → カ, plus historical /a/ variants U+1B002, U+1B003 and
U+1B004. Source-character
`reading` fields describe their phonetic role in the teaching example; they are
**not** dictionaries of modern kanji readings. The Chinese-character glyphs are
modern printed comparisons, not reconstructions of early written forms.

## Authoring and historical care

1. Add or reuse a source with a stable ID, title, institution, HTTPS URL and
   access date. References attach a page, section or other useful locator to
   the source ID. Prefer academic, museum, governmental and educational sources.
2. Add character entries independently of chapters. Keep IDs stable. Link
   canonical learning IDs only when the glyph and script match. Record uncertain
   relationships explicitly and explain educational simplifications in caveats.
3. Add a chapter to its appropriate chronological group and include it in the
   ordered catalog. Give it 3–5 short units, a useful visual explanation and an
   approximate 2–4 minute estimate. Do not enforce a minimum time on the reader.
4. Run the content suite, including `assertWritingHistoryCatalog`. It checks
   identities, source provenance, character and learning references, diagram
   edges and complete sentence reconstruction. Add tests for new meaningful
   content contracts or new unit behavior.
5. Review prose against the cited source itself. Structural validation cannot
   establish historical truth or certify chapter duration. Source disclosures
   are available in the reader; the full provenance remains in authored data.

Avoid one arrival date, one inventor, or exclusive gender explanations for an
entire script. Man’yōgana is a phonetic use of Chinese characters, not a separate
modern script. Hiragana and katakana develop along overlapping paths. Diagrams
should preserve continued kanji use rather than imply total replacement.
Chapter 7 previews modern mixed writing before chapter 8 returns to variation.

Standardization should distinguish taught forms from a universal ban. Printing
and education helped narrow ordinary usage, while historical forms continued in
other contexts. Do not confuse shape variation with historical spelling.

Give each chapter a narrative thread: begin with a concrete problem or scene,
connect its visual to that problem, and explain how the next chapter follows.
Use documented objects and practices, such as mokkan, poetry exchanges, and
reading annotations, to make the history tangible. Explicitly label imagined
scenes and modern analogies; do not present invented dialogue or reconstructed
events as evidence. Keep paragraphs short and deeper social context optional.
Aim for roughly 350–500 words including visual explanations, with room to
explore the interaction within the 2–4 minute editorial estimate. This is an
authoring guideline, not a word-count test or a minimum reading requirement.

Write original explanations. Do not copy source illustrations or prose into
the app without permission. The local NINJAL font is unmodified, has its official
SHA256 verified, and is retained with the Apache 2.0 license and provenance
notice. Its glyphs represent historical forms, not manuscript facsimiles.

## Reading progress

The persistence package owns a version-1 progress envelope in the version-3
IndexedDB store `writingHistoryProgress`, keyed by `writing-history`.
`WritingHistoryProgress` contains `lastChapterId` and unique
`completedChapterIds`. The public APIs load progress, update position and union
an explicit completion with saved completions transactionally. IDs are opaque
to storage; the app ignores unknown IDs when deriving the current track.

The feature's parent route owns a progress provider. It loads when history is
entered, updates UI optimistically and serializes writes across chapter
navigation. Opening a chapter only updates position. Marking it read is an
explicit action. A track is complete only when every current chapter is marked.

Failed operations remain queued in memory and a visible Retry action attempts
them again in order. A failed initial read is retried before any write, avoiding
replacement of unknown existing progress. Stored corruption is reported rather
than silently reset. Leaving the whole section discards unsaved in-memory
operations; writes already in flight are not cancelled. There is no durable
pending-write queue or cross-tab live UI synchronization. Concurrent storage
updates still preserve the union of completed chapters.

Resume uses the last unfinished chapter, then the next unread chapter with
wraparound, and starts revisiting from the beginning when all are complete.
Routes determine the displayed chapter even if storage resolves later. Reading
and character practice remain independently accessible.

## Validation

Content and progress rules have unit tests. IndexedDB tests cover fresh, v1 and
v2 databases, preservation of exercise evidence, corruption and concurrent
completion updates. Component tests cover navigation, interaction and save
retry. Playwright covers reading the whole track, reload/resume, real font
loading, mobile keyboard interaction and practice after the schema upgrade.
Manual visual review covers both themes and small screens; pacing remains an
editorial estimate rather than measured learner research.
