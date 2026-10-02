# Privacy model

CleverCove is local-first. It has no learner accounts, telemetry, analytics, advertising, cloud database, online speech service, or AI API. The optional signed application updater is the only network feature.

## Data boundaries

- Parent PINs are salted and hashed before storage.
- Student IDs remain in the private-values service and are omitted from public profiles.
- Games persist aggregate counters, stable skill IDs, and stable content IDs. They do not persist answer text, incorrect guesses, or played audio.
- Learning preferences such as a counting range or word group are educational settings, not private credentials.
- Audio ships inside the application and plays offline.

## Anonymous educational export

Exports are built from an explicit allow-list rather than by copying stored profiles. They may include anonymous learner numbers, grade, game totals, non-sensitive preference summaries, and content-level learning aggregates. They never include names, local learner UUIDs, Student IDs, parent PIN data, addresses, phone numbers, or raw answers.

Treat a generated export as educational data even though direct identifiers are removed. A parent chooses when and where to share it.
