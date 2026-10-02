# Learning content

CleverCove keeps curriculum data outside game components. The first reusable pack is `content.kindergarten.core`, exported from `src/content/index.ts`.

## Stable IDs and records

IDs are durable references used by games, audio, preferences, progress, and anonymous educational exports. Changing an ID creates a different learning item, so edit display text rather than renaming a published ID.

- Numbers: `number.1` through `number.100`, with `value`, `display`, and `audioId`.
- Letters: `letter.a` through `letter.z`, with uppercase/lowercase display plus `letter.a.name` and `phoneme.a` audio references.
- Tricky words: `word.where`, `word.the`, and so on. `word.I` intentionally preserves the supplied capital `I`.
- Term groups: `tricky.term-1` through `tricky.term-4`.
- Curated confusion groups: `tricky.distractors.*`; games use these before ordinary in-group fallback choices.

The public catalog exports arrays plus lookup/filter helpers:

```ts
import {
  getCuratedDistractorIds,
  getLettersByIds,
  getNumbersThrough,
  getTrickyWordsByGroupId,
} from "../content";
```

`getLettersByIds()` deliberately falls back to A–Z for an empty or wholly invalid focus set. `getTrickyWordsByGroupId("all")` returns all four terms.

The two letter-sound games intentionally teach both directions of the same relationship. **Letter Sound Match** plays a phoneme and asks for its letter. **What Sound?** displays the uppercase/lowercase letter, offers its spoken letter name separately, and asks the learner to choose its phoneme. Both reuse the same `letter.*` and `phoneme.*` IDs and the same parent-selected focus letters.

Question choices are also sound-aware. Letters that share the taught primary sound use a shared `soundGroup` (currently hard C and K), while spoken homophones use a shared `homophoneGroup` (currently to/two and there/their). The quiz builder permits only one member of each equivalence group in a question, so a learner is never asked to guess between two audibly correct choices.

## Editing content

### Add a tricky word

1. Add its `word.*` record to `src/content/kindergarten/tricky-words.json`.
2. Add the ID to exactly one term group's `wordIds`.
3. If useful, add it to one or more curated `distractorGroups` with at least one other existing word.
4. Run `npm run audio:manifest`, generate or record its audio, then run `npm run content:validate`.

### Add a letter or phoneme reference

Add the letter record to `src/content/kindergarten/alphabet.json`. Letter-name IDs use `letter.<letter>.name`; replaceable sound IDs use `phoneme.<letter>`. Then refresh and validate the audio manifest. A phoneme recording can be replaced at its existing path without any game-code change.

### Add a word group

Add a stable `tricky.*` group record whose `wordIds` all exist in the word library. Term groups are learner preferences and should not contain names or other private data.

### Add a counting range

Update `src/content/kindergarten/numbers.json`. The declared `maximum` determines which number records are produced; each value in `supportedPracticeMaximums` must be an integer inside the range. Add the corresponding number audio definitions and files with the manifest/audio commands.

## Validation

Run:

```bash
npm run content:validate
```

The validator detects malformed or duplicate content/audio IDs, invalid ranges, missing required fields, missing audio references, duplicate group entries, nonexistent term/distractor references, duplicate audio paths, and phoneme assets without an adult-review state.

## Progress and anonymous export

Games record only aggregate attempts, correct counts, and practice completion through `ProgressService`, using stable `skill_id` and `content_id` values. Raw answers are not progress data. Anonymous educational export is allow-listed and may include those aggregate IDs/counts, but never learner names, student IDs, parent credentials, or private parent values.
