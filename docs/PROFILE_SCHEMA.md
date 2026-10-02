# Learner profile schema

CleverCove stores one versioned `AppData` document in the operating system app-data directory. Schema upgrades create a backup before migration.

## Public learner fields

- `id` — local UUID used to connect settings and progress without relying on a name.
- `displayName` and `grade` — editable Parent Mode fields.
- `preferences` — non-sensitive educational choices: counting maximum, optional letter focus IDs, and tricky-word group.
- `progress` — game-level aggregate sessions, attempts, successes, and completed rounds, including totals grouped by date.
- `learningProgress` — aggregate attempts and correct counts keyed by stable `skillId` plus `contentId`, including totals grouped by date.
- `gameConfigurationRefs` — configuration presence metadata; never the private value itself.

## Private fields

`StoredLearner.privateValues` is never returned by `ProfileService`. Student IDs are the first supported private value. Parent PINs are stored separately as salted hashes; the original PIN is not persisted.

## Version 2 migration

Version 2 adds default Kindergarten preferences and an empty content-progress record to existing learners. The migration preserves profiles, private values, and earlier game progress.

## Version 3 migration

Version 3 adds empty daily aggregate records to existing game and learning progress. Earlier lifetime totals remain available immediately, while improvement-over-time comparisons begin collecting after the update. The migration preserves profiles, private values, preferences, and all earlier totals.
