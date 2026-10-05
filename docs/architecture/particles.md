# Japanese particles

The optional `/particles` section introduces ten common particles: は, が, を,
に, で, へ, の, と, も, and か. Home offers a discovery link and primary
navigation keeps the section available alongside Kana and Practice. All lessons
at `/particles/$particleId` are accessible immediately, with previous/next and
related-lesson links. Unknown IDs use the application's not-found page.

## Ownership and content

`packages/content/src/particles` owns original English explanations, contextual
Japanese sentences, romanized readings, optional checks and source references.
`@opennihongo/content` exports readonly `ParticleLesson`, `ParticleExample`,
`ParticleToken`, `ParticleHighlight`, `ParticleCheck`, `ParticleReference`,
`ParticleSource` and `ParticleCatalog` contracts. Consumers use the public
`particleCatalog`, `particleLessons`, `particleIntroduction`, `particleSources`,
`getParticleLesson`, `reconstructParticleSentence` and `assertParticleCatalog`
exports. The content package has no React or storage dependency.

Each lesson has a stable slug ID, written glyph, particle pronunciation, role,
title, summary, approximate reading duration, short paragraphs and a scope note.
Examples have stable IDs, a situation, translation, reading and ordered sentence
tokens. Plain strings preserve words and punctuation; highlighted tokens point
to a particle ID and explain its particular job in this sentence. Concatenating
the tokens reconstructs the Japanese sentence exactly. Tokens are not a general
Japanese parser.

The web feature in `apps/web/src/features/particles` renders all lessons through
one reader. Thin route pages compose the overview and reader. Sentence selection,
particle selection, the reading toggle and optional-answer feedback stay local
to the feature and reset on lesson navigation. The shared segmented control and
native buttons support keyboard operation. Japanese glyphs carry language
attributes. Semantic colors work with the app's themes, cards stack on small
screens, and explanation reveals respect system and application reduced motion.

The quick check uses the current lesson ID as its correct option, with feedback
authored separately for each option. Checks do not gate reading or navigation,
create exercise results, or persist progress. Character Practice remains a
separate activity. Reading durations are estimates, not timers or enforced pace.

## Adding or revising a lesson

1. Add the lesson to the appropriate thematic module under `lessons/` and include
   its group in the ordered catalog. Keep IDs stable because they are public URLs.
2. Author at least two contextual examples using `example` and `p`. Highlight
   every particle being explained, including particles from other lessons, with
   the correct glyph and a sentence-specific explanation. Do not mark a kana
   inside a word as a particle simply because the glyph matches.
3. Write a narrowly framed, unambiguous optional check. Include the lesson's own
   ID as the answer and explain every distractor. In particular, avoid questions
   that mark に wrong where へ is also possible, or は wrong where が changes focus.
4. Cite reputable educational or linguistic references using a source ID and a
   useful locator. Store source title, institution, HTTPS URL and access date.
   Review the source itself; validation checks structure, not grammatical truth.
5. Run the content and web suites. Validation protects identities, provenance,
   related links, sentence reconstruction, highlighted glyphs, the focus particle
   and explained answer choices. Existing renderer behavior needs no per-ID code.

The initial grammar review uses the Japan Foundation's
[Irodori Grammar Notes](https://www.irodori.jpf.go.jp/assets/data/Grammar_all.pdf).
Locators refer to printed lesson/page identifiers in the compiled PDF, rather
than PDF page numbers. The illustrations, prose and sentence situations here are
original; the textbook itself is not bundled.

Teach particles through the sentence and its situation, not universal English
equivalents. は/が are an introduction to topic and subject, not a complete rule
for choosing them. に/で depend on the relationship to the verb; に/へ can overlap
in movement expressions. を, は and へ have special particle pronunciations.
The か examples use polite sentences, and the の and と lessons explicitly limit
their scope. Preserve these caveats when expanding the content.
