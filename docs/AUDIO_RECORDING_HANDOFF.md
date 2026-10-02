# CleverCove audio recording handoff

This is the complete recording inventory for **219 bundled audio assets**: 5 prompts, 26 letter names, 26 letter sounds, 100 numbers, and 62 tricky words.

## Copy/paste prompt for Codex on the voice-AI computer

```text
You are working on the CleverCove educational desktop app. Read docs/AUDIO_RECORDING_HANDOFF.md and src/content/audio-assets.json completely before changing files.

Use the local voice/audio-generation tools on this computer to create or replace every WAV file listed in the handoff document at its exact repository-relative output path. Do not rename IDs, change paths, remove files, or add cloud/runtime audio dependencies.

Voice and delivery requirements:
- Use one consistent, warm, encouraging, clearly articulated US-English adult voice suitable for Kindergarten. Do not imitate a child.
- Record only the requested line or sound. Do not speak filenames, labels, quotation marks, example words, or extra instructions.
- Prompts should sound friendly and unhurried. Letter names, numbers, and words should be spoken once with neutral intonation.
- Phonemes must be the sound, not the letter name. Follow the IPA/example directions in the handoff. Keep stop sounds short and continuous sounds clean; avoid an unnecessary trailing ‘uh’ except where the cue explicitly uses it for child clarity.
- C and K intentionally share the primary /k/ sound. The app prevents them from appearing together in a question. Homophones are also prevented from appearing together.

Technical requirements:
- WAV, mono, 22,050 Hz, signed 16-bit PCM.
- No music, room noise, reverb, clicks, clipping, or sound effects.
- Trim leading/trailing silence to roughly 40–100 ms and normalize consistently, with peaks no higher than -3 dBFS.
- Keep filenames and folders exactly as listed under public/audio/.

Quality-control requirements:
1. Listen to every generated file and confirm it matches its requested line/sound.
2. Pay special attention to all 26 phonemes, short vowel distinctions, C/K, G/J, Q, W, X, and Y.
3. Run npm run content:validate and npm test -- --run.
4. Create docs/AUDIO_REVIEW_REPORT.md listing each asset ID, pass/fail, duration, and any item needing human review.
5. Do not change a phoneme’s reviewStatus to adult-reviewed unless a qualified human explicitly approves that recording. Leave it adult-review-required otherwise.
```

## Recording standards

The **Line / target sound** column is what the recording must contain. The **Direction** column is guidance for the voice model and must not be spoken. All paths are repository-relative and intentionally stable.

## Game instruction prompts (5)

| Audio ID | Line / target sound | Output path | Direction |
|---|---|---|---|
| `prompt.counting.count-along` | Count along. Tap each number. | `public/audio/prompts/counting/count-along.wav` | Say exactly: “Count along. Tap each number.” |
| `prompt.counting.hear-the-number` | Which number did you hear? | `public/audio/prompts/counting/hear-the-number.wav` | Say exactly: “Which number did you hear?” |
| `prompt.counting.what-comes-next` | What comes next? | `public/audio/prompts/counting/what-comes-next.wav` | Say exactly: “What comes next?” |
| `prompt.reading.letter-sound-match` | Which letter makes this sound? | `public/audio/prompts/reading/letter-sound-match.wav` | Say exactly: “Which letter makes this sound?” |
| `prompt.reading.tricky-word-match` | Which word did you hear? | `public/audio/prompts/reading/tricky-word-match.wav` | Say exactly: “Which word did you hear?” |

## Letter names (26)

| Audio ID | Line / target sound | Output path | Direction |
|---|---|---|---|
| `letter.a.name` | A | `public/audio/letter-names/a.wav` | Say the letter name “A” once; do not make its phoneme. |
| `letter.b.name` | B | `public/audio/letter-names/b.wav` | Say the letter name “B” once; do not make its phoneme. |
| `letter.c.name` | C | `public/audio/letter-names/c.wav` | Say the letter name “C” once; do not make its phoneme. |
| `letter.d.name` | D | `public/audio/letter-names/d.wav` | Say the letter name “D” once; do not make its phoneme. |
| `letter.e.name` | E | `public/audio/letter-names/e.wav` | Say the letter name “E” once; do not make its phoneme. |
| `letter.f.name` | F | `public/audio/letter-names/f.wav` | Say the letter name “F” once; do not make its phoneme. |
| `letter.g.name` | G | `public/audio/letter-names/g.wav` | Say the letter name “G” once; do not make its phoneme. |
| `letter.h.name` | H | `public/audio/letter-names/h.wav` | Say the letter name “H” once; do not make its phoneme. |
| `letter.i.name` | I | `public/audio/letter-names/i.wav` | Say the letter name “I” once; do not make its phoneme. |
| `letter.j.name` | J | `public/audio/letter-names/j.wav` | Say the letter name “J” once; do not make its phoneme. |
| `letter.k.name` | K | `public/audio/letter-names/k.wav` | Say the letter name “K” once; do not make its phoneme. |
| `letter.l.name` | L | `public/audio/letter-names/l.wav` | Say the letter name “L” once; do not make its phoneme. |
| `letter.m.name` | M | `public/audio/letter-names/m.wav` | Say the letter name “M” once; do not make its phoneme. |
| `letter.n.name` | N | `public/audio/letter-names/n.wav` | Say the letter name “N” once; do not make its phoneme. |
| `letter.o.name` | O | `public/audio/letter-names/o.wav` | Say the letter name “O” once; do not make its phoneme. |
| `letter.p.name` | P | `public/audio/letter-names/p.wav` | Say the letter name “P” once; do not make its phoneme. |
| `letter.q.name` | Q | `public/audio/letter-names/q.wav` | Say the letter name “Q” once; do not make its phoneme. |
| `letter.r.name` | R | `public/audio/letter-names/r.wav` | Say the letter name “R” once; do not make its phoneme. |
| `letter.s.name` | S | `public/audio/letter-names/s.wav` | Say the letter name “S” once; do not make its phoneme. |
| `letter.t.name` | T | `public/audio/letter-names/t.wav` | Say the letter name “T” once; do not make its phoneme. |
| `letter.u.name` | U | `public/audio/letter-names/u.wav` | Say the letter name “U” once; do not make its phoneme. |
| `letter.v.name` | V | `public/audio/letter-names/v.wav` | Say the letter name “V” once; do not make its phoneme. |
| `letter.w.name` | W | `public/audio/letter-names/w.wav` | Say the letter name “W” once; do not make its phoneme. |
| `letter.x.name` | X | `public/audio/letter-names/x.wav` | Say the letter name “X” once; do not make its phoneme. |
| `letter.y.name` | Y | `public/audio/letter-names/y.wav` | Say the letter name “Y” once; do not make its phoneme. |
| `letter.z.name` | Z | `public/audio/letter-names/z.wav` | Say the letter name “Z” once; do not make its phoneme. |

## Letter sounds (phonemes) (26)

| Audio ID | Line / target sound | Output path | Direction |
|---|---|---|---|
| `phoneme.a` | short /æ/ (apple) | `public/audio/phonemes/a.wav` | Record only the sound: short /æ/ as in apple; a brief ‘aaa’ sound, not the letter name A. Do not say an example word. |
| `phoneme.b` | /b/ (bat; short ‘buh’ cue) | `public/audio/phonemes/b.wav` | Record only the sound: /b/ as in bat; a short ‘buh’ cue, not the letter name B. Do not say an example word. |
| `phoneme.c` | hard /k/ (cat; short ‘kuh’ cue) | `public/audio/phonemes/c.wav` | Record only the sound: hard /k/ as in cat; the same primary sound as K, a short ‘kuh’ cue. Do not say an example word. |
| `phoneme.d` | /d/ (dog; short ‘duh’ cue) | `public/audio/phonemes/d.wav` | Record only the sound: /d/ as in dog; a short ‘duh’ cue. Do not say an example word. |
| `phoneme.e` | short /ɛ/ (egg; ‘eh’) | `public/audio/phonemes/e.wav` | Record only the sound: short /ɛ/ as in egg; a brief ‘eh’ sound, not the letter name E. Do not say an example word. |
| `phoneme.f` | /f/ (fish; sustained ‘ffff’) | `public/audio/phonemes/f.wav` | Record only the sound: /f/ as in fish; a clean sustained ‘ffff’ sound. Do not say an example word. |
| `phoneme.g` | hard /g/ (go; short ‘guh’ cue) | `public/audio/phonemes/g.wav` | Record only the sound: hard /g/ as in go; a short ‘guh’ cue, not the letter name G. Do not say an example word. |
| `phoneme.h` | /h/ (hat; breathy ‘huh’ cue) | `public/audio/phonemes/h.wav` | Record only the sound: /h/ as in hat; a soft breathy ‘huh’ cue, not the letter name H. Do not say an example word. |
| `phoneme.i` | short /ɪ/ (igloo; ‘ih’) | `public/audio/phonemes/i.wav` | Record only the sound: short /ɪ/ as in igloo; a brief ‘ih’ sound, not the letter name I. Do not say an example word. |
| `phoneme.j` | /dʒ/ (jam; short ‘juh’ cue) | `public/audio/phonemes/j.wav` | Record only the sound: /dʒ/ as in jam; a short ‘juh’ cue. Do not say an example word. |
| `phoneme.k` | /k/ (kite; short ‘kuh’ cue) | `public/audio/phonemes/k.wav` | Record only the sound: /k/ as in kite; the same primary sound as hard C, a short ‘kuh’ cue. Do not say an example word. |
| `phoneme.l` | /l/ (leaf; clean ‘lll’) | `public/audio/phonemes/l.wav` | Record only the sound: /l/ as in leaf; a clean ‘lll’ sound with very little trailing vowel. Do not say an example word. |
| `phoneme.m` | /m/ (moon; sustained ‘mmm’) | `public/audio/phonemes/m.wav` | Record only the sound: /m/ as in moon; a clean sustained ‘mmm’ sound. Do not say an example word. |
| `phoneme.n` | /n/ (nest; sustained ‘nnn’) | `public/audio/phonemes/n.wav` | Record only the sound: /n/ as in nest; a clean sustained ‘nnn’ sound. Do not say an example word. |
| `phoneme.o` | short /ɑ/ (octopus; distinct from short A) | `public/audio/phonemes/o.wav` | Record only the sound: short /ɑ/ as in octopus in US English; a brief sound distinct from short A. Do not say an example word. |
| `phoneme.p` | /p/ (pig; short ‘puh’ cue) | `public/audio/phonemes/p.wav` | Record only the sound: /p/ as in pig; a short unvoiced ‘puh’ cue. Do not say an example word. |
| `phoneme.q` | /kw/ (queen; short ‘kwuh’ cue) | `public/audio/phonemes/q.wav` | Record only the sound: /kw/ as in queen; a short ‘kwuh’ cue. Do not say an example word. |
| `phoneme.r` | US /r/ (rabbit; clean ‘rrr’) | `public/audio/phonemes/r.wav` | Record only the sound: US English /r/ as in rabbit; a clean ‘rrr’ sound. Do not say an example word. |
| `phoneme.s` | /s/ (sun; sustained ‘ssss’) | `public/audio/phonemes/s.wav` | Record only the sound: /s/ as in sun; a clean sustained ‘ssss’ sound, not the letter name S. Do not say an example word. |
| `phoneme.t` | /t/ (top; short ‘tuh’ cue) | `public/audio/phonemes/t.wav` | Record only the sound: /t/ as in top; a short unvoiced ‘tuh’ cue. Do not say an example word. |
| `phoneme.u` | short /ʌ/ (umbrella; ‘uh’) | `public/audio/phonemes/u.wav` | Record only the sound: short /ʌ/ as in umbrella; a brief ‘uh’ sound, not the letter name U. Do not say an example word. |
| `phoneme.v` | /v/ (van; sustained ‘vvvv’) | `public/audio/phonemes/v.wav` | Record only the sound: /v/ as in van; a clean sustained ‘vvvv’ sound. Do not say an example word. |
| `phoneme.w` | /w/ (water; short ‘wuh’ cue) | `public/audio/phonemes/w.wav` | Record only the sound: /w/ as in water; a short ‘wuh’ cue, not ‘double-u’. Do not say an example word. |
| `phoneme.x` | /ks/ (end of fox) | `public/audio/phonemes/x.wav` | Record only the sound: /ks/ as at the end of fox; say only the blended ‘ks’ sound. Do not say an example word. |
| `phoneme.y` | consonant /j/ (yellow; short ‘yuh’ cue) | `public/audio/phonemes/y.wav` | Record only the sound: consonant /j/ as in yellow; a short ‘yuh’ cue, not the letter name Y. Do not say an example word. |
| `phoneme.z` | /z/ (zebra; sustained ‘zzzz’) | `public/audio/phonemes/z.wav` | Record only the sound: /z/ as in zebra; a clean sustained ‘zzzz’ sound. Do not say an example word. |

## Numbers (100)

| Audio ID | Line / target sound | Output path | Direction |
|---|---|---|---|
| `number.1` | 1 | `public/audio/numbers/1.wav` | Say the number “1” once. |
| `number.2` | 2 | `public/audio/numbers/2.wav` | Say the number “2” once. |
| `number.3` | 3 | `public/audio/numbers/3.wav` | Say the number “3” once. |
| `number.4` | 4 | `public/audio/numbers/4.wav` | Say the number “4” once. |
| `number.5` | 5 | `public/audio/numbers/5.wav` | Say the number “5” once. |
| `number.6` | 6 | `public/audio/numbers/6.wav` | Say the number “6” once. |
| `number.7` | 7 | `public/audio/numbers/7.wav` | Say the number “7” once. |
| `number.8` | 8 | `public/audio/numbers/8.wav` | Say the number “8” once. |
| `number.9` | 9 | `public/audio/numbers/9.wav` | Say the number “9” once. |
| `number.10` | 10 | `public/audio/numbers/10.wav` | Say the number “10” once. |
| `number.11` | 11 | `public/audio/numbers/11.wav` | Say the number “11” once. |
| `number.12` | 12 | `public/audio/numbers/12.wav` | Say the number “12” once. |
| `number.13` | 13 | `public/audio/numbers/13.wav` | Say the number “13” once. |
| `number.14` | 14 | `public/audio/numbers/14.wav` | Say the number “14” once. |
| `number.15` | 15 | `public/audio/numbers/15.wav` | Say the number “15” once. |
| `number.16` | 16 | `public/audio/numbers/16.wav` | Say the number “16” once. |
| `number.17` | 17 | `public/audio/numbers/17.wav` | Say the number “17” once. |
| `number.18` | 18 | `public/audio/numbers/18.wav` | Say the number “18” once. |
| `number.19` | 19 | `public/audio/numbers/19.wav` | Say the number “19” once. |
| `number.20` | 20 | `public/audio/numbers/20.wav` | Say the number “20” once. |
| `number.21` | 21 | `public/audio/numbers/21.wav` | Say the number “21” once. |
| `number.22` | 22 | `public/audio/numbers/22.wav` | Say the number “22” once. |
| `number.23` | 23 | `public/audio/numbers/23.wav` | Say the number “23” once. |
| `number.24` | 24 | `public/audio/numbers/24.wav` | Say the number “24” once. |
| `number.25` | 25 | `public/audio/numbers/25.wav` | Say the number “25” once. |
| `number.26` | 26 | `public/audio/numbers/26.wav` | Say the number “26” once. |
| `number.27` | 27 | `public/audio/numbers/27.wav` | Say the number “27” once. |
| `number.28` | 28 | `public/audio/numbers/28.wav` | Say the number “28” once. |
| `number.29` | 29 | `public/audio/numbers/29.wav` | Say the number “29” once. |
| `number.30` | 30 | `public/audio/numbers/30.wav` | Say the number “30” once. |
| `number.31` | 31 | `public/audio/numbers/31.wav` | Say the number “31” once. |
| `number.32` | 32 | `public/audio/numbers/32.wav` | Say the number “32” once. |
| `number.33` | 33 | `public/audio/numbers/33.wav` | Say the number “33” once. |
| `number.34` | 34 | `public/audio/numbers/34.wav` | Say the number “34” once. |
| `number.35` | 35 | `public/audio/numbers/35.wav` | Say the number “35” once. |
| `number.36` | 36 | `public/audio/numbers/36.wav` | Say the number “36” once. |
| `number.37` | 37 | `public/audio/numbers/37.wav` | Say the number “37” once. |
| `number.38` | 38 | `public/audio/numbers/38.wav` | Say the number “38” once. |
| `number.39` | 39 | `public/audio/numbers/39.wav` | Say the number “39” once. |
| `number.40` | 40 | `public/audio/numbers/40.wav` | Say the number “40” once. |
| `number.41` | 41 | `public/audio/numbers/41.wav` | Say the number “41” once. |
| `number.42` | 42 | `public/audio/numbers/42.wav` | Say the number “42” once. |
| `number.43` | 43 | `public/audio/numbers/43.wav` | Say the number “43” once. |
| `number.44` | 44 | `public/audio/numbers/44.wav` | Say the number “44” once. |
| `number.45` | 45 | `public/audio/numbers/45.wav` | Say the number “45” once. |
| `number.46` | 46 | `public/audio/numbers/46.wav` | Say the number “46” once. |
| `number.47` | 47 | `public/audio/numbers/47.wav` | Say the number “47” once. |
| `number.48` | 48 | `public/audio/numbers/48.wav` | Say the number “48” once. |
| `number.49` | 49 | `public/audio/numbers/49.wav` | Say the number “49” once. |
| `number.50` | 50 | `public/audio/numbers/50.wav` | Say the number “50” once. |
| `number.51` | 51 | `public/audio/numbers/51.wav` | Say the number “51” once. |
| `number.52` | 52 | `public/audio/numbers/52.wav` | Say the number “52” once. |
| `number.53` | 53 | `public/audio/numbers/53.wav` | Say the number “53” once. |
| `number.54` | 54 | `public/audio/numbers/54.wav` | Say the number “54” once. |
| `number.55` | 55 | `public/audio/numbers/55.wav` | Say the number “55” once. |
| `number.56` | 56 | `public/audio/numbers/56.wav` | Say the number “56” once. |
| `number.57` | 57 | `public/audio/numbers/57.wav` | Say the number “57” once. |
| `number.58` | 58 | `public/audio/numbers/58.wav` | Say the number “58” once. |
| `number.59` | 59 | `public/audio/numbers/59.wav` | Say the number “59” once. |
| `number.60` | 60 | `public/audio/numbers/60.wav` | Say the number “60” once. |
| `number.61` | 61 | `public/audio/numbers/61.wav` | Say the number “61” once. |
| `number.62` | 62 | `public/audio/numbers/62.wav` | Say the number “62” once. |
| `number.63` | 63 | `public/audio/numbers/63.wav` | Say the number “63” once. |
| `number.64` | 64 | `public/audio/numbers/64.wav` | Say the number “64” once. |
| `number.65` | 65 | `public/audio/numbers/65.wav` | Say the number “65” once. |
| `number.66` | 66 | `public/audio/numbers/66.wav` | Say the number “66” once. |
| `number.67` | 67 | `public/audio/numbers/67.wav` | Say the number “67” once. |
| `number.68` | 68 | `public/audio/numbers/68.wav` | Say the number “68” once. |
| `number.69` | 69 | `public/audio/numbers/69.wav` | Say the number “69” once. |
| `number.70` | 70 | `public/audio/numbers/70.wav` | Say the number “70” once. |
| `number.71` | 71 | `public/audio/numbers/71.wav` | Say the number “71” once. |
| `number.72` | 72 | `public/audio/numbers/72.wav` | Say the number “72” once. |
| `number.73` | 73 | `public/audio/numbers/73.wav` | Say the number “73” once. |
| `number.74` | 74 | `public/audio/numbers/74.wav` | Say the number “74” once. |
| `number.75` | 75 | `public/audio/numbers/75.wav` | Say the number “75” once. |
| `number.76` | 76 | `public/audio/numbers/76.wav` | Say the number “76” once. |
| `number.77` | 77 | `public/audio/numbers/77.wav` | Say the number “77” once. |
| `number.78` | 78 | `public/audio/numbers/78.wav` | Say the number “78” once. |
| `number.79` | 79 | `public/audio/numbers/79.wav` | Say the number “79” once. |
| `number.80` | 80 | `public/audio/numbers/80.wav` | Say the number “80” once. |
| `number.81` | 81 | `public/audio/numbers/81.wav` | Say the number “81” once. |
| `number.82` | 82 | `public/audio/numbers/82.wav` | Say the number “82” once. |
| `number.83` | 83 | `public/audio/numbers/83.wav` | Say the number “83” once. |
| `number.84` | 84 | `public/audio/numbers/84.wav` | Say the number “84” once. |
| `number.85` | 85 | `public/audio/numbers/85.wav` | Say the number “85” once. |
| `number.86` | 86 | `public/audio/numbers/86.wav` | Say the number “86” once. |
| `number.87` | 87 | `public/audio/numbers/87.wav` | Say the number “87” once. |
| `number.88` | 88 | `public/audio/numbers/88.wav` | Say the number “88” once. |
| `number.89` | 89 | `public/audio/numbers/89.wav` | Say the number “89” once. |
| `number.90` | 90 | `public/audio/numbers/90.wav` | Say the number “90” once. |
| `number.91` | 91 | `public/audio/numbers/91.wav` | Say the number “91” once. |
| `number.92` | 92 | `public/audio/numbers/92.wav` | Say the number “92” once. |
| `number.93` | 93 | `public/audio/numbers/93.wav` | Say the number “93” once. |
| `number.94` | 94 | `public/audio/numbers/94.wav` | Say the number “94” once. |
| `number.95` | 95 | `public/audio/numbers/95.wav` | Say the number “95” once. |
| `number.96` | 96 | `public/audio/numbers/96.wav` | Say the number “96” once. |
| `number.97` | 97 | `public/audio/numbers/97.wav` | Say the number “97” once. |
| `number.98` | 98 | `public/audio/numbers/98.wav` | Say the number “98” once. |
| `number.99` | 99 | `public/audio/numbers/99.wav` | Say the number “99” once. |
| `number.100` | 100 | `public/audio/numbers/100.wav` | Say the number “100” once. |

## Tricky words (62)

| Audio ID | Line / target sound | Output path | Direction |
|---|---|---|---|
| `word.a` | a | `public/audio/words/a.wav` | Say the word “a” once, naturally and without using it in a sentence. |
| `word.all` | all | `public/audio/words/all.wav` | Say the word “all” once, naturally and without using it in a sentence. |
| `word.am` | am | `public/audio/words/am.wav` | Say the word “am” once, naturally and without using it in a sentence. |
| `word.an` | an | `public/audio/words/an.wav` | Say the word “an” once, naturally and without using it in a sentence. |
| `word.and` | and | `public/audio/words/and.wav` | Say the word “and” once, naturally and without using it in a sentence. |
| `word.are` | are | `public/audio/words/are.wav` | Say the word “are” once, naturally and without using it in a sentence. |
| `word.at` | at | `public/audio/words/at.wav` | Say the word “at” once, naturally and without using it in a sentence. |
| `word.be` | be | `public/audio/words/be.wav` | Say the word “be” once, naturally and without using it in a sentence. |
| `word.blue` | blue | `public/audio/words/blue.wav` | Say the word “blue” once, naturally and without using it in a sentence. |
| `word.by` | by | `public/audio/words/by.wav` | Say the word “by” once, naturally and without using it in a sentence. |
| `word.can` | can | `public/audio/words/can.wav` | Say the word “can” once, naturally and without using it in a sentence. |
| `word.come` | come | `public/audio/words/come.wav` | Say the word “come” once, naturally and without using it in a sentence. |
| `word.do` | do | `public/audio/words/do.wav` | Say the word “do” once, naturally and without using it in a sentence. |
| `word.down` | down | `public/audio/words/down.wav` | Say the word “down” once, naturally and without using it in a sentence. |
| `word.for` | for | `public/audio/words/for.wav` | Say the word “for” once, naturally and without using it in a sentence. |
| `word.from` | from | `public/audio/words/from.wav` | Say the word “from” once, naturally and without using it in a sentence. |
| `word.funny` | funny | `public/audio/words/funny.wav` | Say the word “funny” once, naturally and without using it in a sentence. |
| `word.go` | go | `public/audio/words/go.wav` | Say the word “go” once, naturally and without using it in a sentence. |
| `word.he` | he | `public/audio/words/he.wav` | Say the word “he” once, naturally and without using it in a sentence. |
| `word.here` | here | `public/audio/words/here.wav` | Say the word “here” once, naturally and without using it in a sentence. |
| `word.I` | I | `public/audio/words/I.wav` | Say the word “I” once, naturally and without using it in a sentence. |
| `word.in` | in | `public/audio/words/in.wav` | Say the word “in” once, naturally and without using it in a sentence. |
| `word.is` | is | `public/audio/words/is.wav` | Say the word “is” once, naturally and without using it in a sentence. |
| `word.it` | it | `public/audio/words/it.wav` | Say the word “it” once, naturally and without using it in a sentence. |
| `word.like` | like | `public/audio/words/like.wav` | Say the word “like” once, naturally and without using it in a sentence. |
| `word.little` | little | `public/audio/words/little.wav` | Say the word “little” once, naturally and without using it in a sentence. |
| `word.look` | look | `public/audio/words/look.wav` | Say the word “look” once, naturally and without using it in a sentence. |
| `word.me` | me | `public/audio/words/me.wav` | Say the word “me” once, naturally and without using it in a sentence. |
| `word.my` | my | `public/audio/words/my.wav` | Say the word “my” once, naturally and without using it in a sentence. |
| `word.no` | no | `public/audio/words/no.wav` | Say the word “no” once, naturally and without using it in a sentence. |
| `word.of` | of | `public/audio/words/of.wav` | Say the word “of” once, naturally and without using it in a sentence. |
| `word.on` | on | `public/audio/words/on.wav` | Say the word “on” once, naturally and without using it in a sentence. |
| `word.once` | once | `public/audio/words/once.wav` | Say the word “once” once, naturally and without using it in a sentence. |
| `word.one` | one | `public/audio/words/one.wav` | Say the word “one” once, naturally and without using it in a sentence. |
| `word.out` | out | `public/audio/words/out.wav` | Say the word “out” once, naturally and without using it in a sentence. |
| `word.said` | said | `public/audio/words/said.wav` | Say the word “said” once, naturally and without using it in a sentence. |
| `word.says` | says | `public/audio/words/says.wav` | Say the word “says” once, naturally and without using it in a sentence. |
| `word.see` | see | `public/audio/words/see.wav` | Say the word “see” once, naturally and without using it in a sentence. |
| `word.she` | she | `public/audio/words/she.wav` | Say the word “she” once, naturally and without using it in a sentence. |
| `word.so` | so | `public/audio/words/so.wav` | Say the word “so” once, naturally and without using it in a sentence. |
| `word.the` | the | `public/audio/words/the.wav` | Say the word “the” once, naturally and without using it in a sentence. |
| `word.their` | their | `public/audio/words/their.wav` | Say the word “their” once, naturally and without using it in a sentence. |
| `word.there` | there | `public/audio/words/there.wav` | Say the word “there” once, naturally and without using it in a sentence. |
| `word.they` | they | `public/audio/words/they.wav` | Say the word “they” once, naturally and without using it in a sentence. |
| `word.this` | this | `public/audio/words/this.wav` | Say the word “this” once, naturally and without using it in a sentence. |
| `word.three` | three | `public/audio/words/three.wav` | Say the word “three” once, naturally and without using it in a sentence. |
| `word.to` | to | `public/audio/words/to.wav` | Say the word “to” once, naturally and without using it in a sentence. |
| `word.two` | two | `public/audio/words/two.wav` | Say the word “two” once, naturally and without using it in a sentence. |
| `word.up` | up | `public/audio/words/up.wav` | Say the word “up” once, naturally and without using it in a sentence. |
| `word.was` | was | `public/audio/words/was.wav` | Say the word “was” once, naturally and without using it in a sentence. |
| `word.we` | we | `public/audio/words/we.wav` | Say the word “we” once, naturally and without using it in a sentence. |
| `word.were` | were | `public/audio/words/were.wav` | Say the word “were” once, naturally and without using it in a sentence. |
| `word.what` | what | `public/audio/words/what.wav` | Say the word “what” once, naturally and without using it in a sentence. |
| `word.when` | when | `public/audio/words/when.wav` | Say the word “when” once, naturally and without using it in a sentence. |
| `word.where` | where | `public/audio/words/where.wav` | Say the word “where” once, naturally and without using it in a sentence. |
| `word.which` | which | `public/audio/words/which.wav` | Say the word “which” once, naturally and without using it in a sentence. |
| `word.why` | why | `public/audio/words/why.wav` | Say the word “why” once, naturally and without using it in a sentence. |
| `word.with` | with | `public/audio/words/with.wav` | Say the word “with” once, naturally and without using it in a sentence. |
| `word.word` | word | `public/audio/words/word.wav` | Say the word “word” once, naturally and without using it in a sentence. |
| `word.yellow` | yellow | `public/audio/words/yellow.wav` | Say the word “yellow” once, naturally and without using it in a sentence. |
| `word.you` | you | `public/audio/words/you.wav` | Say the word “you” once, naturally and without using it in a sentence. |
| `word.your` | your | `public/audio/words/your.wav` | Say the word “your” once, naturally and without using it in a sentence. |

## Final acceptance checklist

- [ ] All paths in this document exist and contain playable WAV audio.
- [ ] The same voice, loudness, pacing, and silence treatment are used throughout.
- [ ] Letter-name clips say names; phoneme clips make sounds.
- [ ] Short A, E, I, O, and U are distinguishable.
- [ ] C and K both make the intended /k/ sound and are labeled as equivalent in app content.
- [ ] No prompt contains a filename, label, or accidental extra phrase.
- [ ] Every phoneme has been flagged for qualified adult review unless approval has already occurred.
- [ ] `npm run content:validate` and `npm test -- --run` pass.

