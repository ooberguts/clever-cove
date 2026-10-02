# Local audio assets

Curriculum speech is bundled under `public/audio` and works offline. Game code calls `AudioService.play("word.where")`; it never constructs a file path. `AudioService` resolves IDs using `src/content/audio-assets.json`, clamps volume, and returns `false` rather than throwing when an ID or file cannot be played.

The existing `GameSoundService` remains separate: it synthesizes short keypad/feedback tones, while `AudioService` handles spoken curriculum assets.

## Manifest fields

Each entry includes:

- stable `id`
- `kind` (`number`, `letter-name`, `phoneme`, `word`, or `prompt`)
- source `text` for generation/review
- predictable local WAV `path`
- `reviewStatus` (`generated`, `adult-review-required`, or `adult-reviewed`)

Refresh definitions after changing content:

```bash
npm run audio:manifest
npm run content:validate
```

The refresh preserves an existing `adult-reviewed` status.

## Generate speech on macOS

The development-only generator uses macOS `say` to create a temporary AIFF and `afconvert` to create 22.05 kHz, mono, 16-bit PCM WAV. Neither command is used by the released app.

Generate missing files (existing recordings are left untouched):

```bash
npm run audio:generate
```

Generate selected IDs:

```bash
npm run audio:generate -- --ids word.where,number.17,phoneme.m
```

Regenerate selected assets or choose another installed macOS voice:

```bash
npm run audio:generate -- --id word.where --force --voice Samantha
```

The command rejects unknown IDs, reports each failure, and exits nonzero if any asset failed. Windows development does not need `say`; use the already bundled WAV files or copy reviewed replacements into the same manifest paths.

## Phonemes require adult review

Text-to-speech letter output is not a reliable isolated phoneme. The generated files at `audio/phonemes/a.wav` through `audio/phonemes/z.wav` are placeholders only. Every one is marked `adult-review-required` in the manifest and must be reviewed by an adult with phonics expertise before being treated as instructional-quality audio.

To replace a placeholder:

1. Record or obtain a reviewed isolated phoneme locally (no online runtime dependency).
2. Convert it to WAV, preferably 22.05 kHz mono 16-bit PCM.
3. Replace `public/audio/phonemes/<letter>.wav`, keeping the path unchanged.
4. Change that manifest entry to `adult-reviewed`.
5. Run `npm run content:validate` and listen to the clip in the game or an audio-review workflow.

Do not use `--force` for a reviewed file unless you intentionally want to replace it with a generated placeholder.
