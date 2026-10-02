import { readFile, writeFile } from "node:fs/promises";

const rootUrl = new URL("../", import.meta.url);
const assets = JSON.parse(await readFile(new URL("src/content/audio-assets.json", rootUrl), "utf8"));

const phonemeDirections = {
  a: "short /æ/ as in apple; a brief ‘aaa’ sound, not the letter name A",
  b: "/b/ as in bat; a short ‘buh’ cue, not the letter name B",
  c: "hard /k/ as in cat; the same primary sound as K, a short ‘kuh’ cue",
  d: "/d/ as in dog; a short ‘duh’ cue",
  e: "short /ɛ/ as in egg; a brief ‘eh’ sound, not the letter name E",
  f: "/f/ as in fish; a clean sustained ‘ffff’ sound",
  g: "hard /g/ as in go; a short ‘guh’ cue, not the letter name G",
  h: "/h/ as in hat; a soft breathy ‘huh’ cue, not the letter name H",
  i: "short /ɪ/ as in igloo; a brief ‘ih’ sound, not the letter name I",
  j: "/dʒ/ as in jam; a short ‘juh’ cue",
  k: "/k/ as in kite; the same primary sound as hard C, a short ‘kuh’ cue",
  l: "/l/ as in leaf; a clean ‘lll’ sound with very little trailing vowel",
  m: "/m/ as in moon; a clean sustained ‘mmm’ sound",
  n: "/n/ as in nest; a clean sustained ‘nnn’ sound",
  o: "short /ɑ/ as in octopus in US English; a brief sound distinct from short A",
  p: "/p/ as in pig; a short unvoiced ‘puh’ cue",
  q: "/kw/ as in queen; a short ‘kwuh’ cue",
  r: "US English /r/ as in rabbit; a clean ‘rrr’ sound",
  s: "/s/ as in sun; a clean sustained ‘ssss’ sound, not the letter name S",
  t: "/t/ as in top; a short unvoiced ‘tuh’ cue",
  u: "short /ʌ/ as in umbrella; a brief ‘uh’ sound, not the letter name U",
  v: "/v/ as in van; a clean sustained ‘vvvv’ sound",
  w: "/w/ as in water; a short ‘wuh’ cue, not ‘double-u’",
  x: "/ks/ as at the end of fox; say only the blended ‘ks’ sound",
  y: "consonant /j/ as in yellow; a short ‘yuh’ cue, not the letter name Y",
  z: "/z/ as in zebra; a clean sustained ‘zzzz’ sound",
};

const phonemeTargets = {
  a: "short /æ/ (apple)",
  b: "/b/ (bat; short ‘buh’ cue)",
  c: "hard /k/ (cat; short ‘kuh’ cue)",
  d: "/d/ (dog; short ‘duh’ cue)",
  e: "short /ɛ/ (egg; ‘eh’)",
  f: "/f/ (fish; sustained ‘ffff’)",
  g: "hard /g/ (go; short ‘guh’ cue)",
  h: "/h/ (hat; breathy ‘huh’ cue)",
  i: "short /ɪ/ (igloo; ‘ih’)",
  j: "/dʒ/ (jam; short ‘juh’ cue)",
  k: "/k/ (kite; short ‘kuh’ cue)",
  l: "/l/ (leaf; clean ‘lll’)",
  m: "/m/ (moon; sustained ‘mmm’)",
  n: "/n/ (nest; sustained ‘nnn’)",
  o: "short /ɑ/ (octopus; distinct from short A)",
  p: "/p/ (pig; short ‘puh’ cue)",
  q: "/kw/ (queen; short ‘kwuh’ cue)",
  r: "US /r/ (rabbit; clean ‘rrr’)",
  s: "/s/ (sun; sustained ‘ssss’)",
  t: "/t/ (top; short ‘tuh’ cue)",
  u: "short /ʌ/ (umbrella; ‘uh’)",
  v: "/v/ (van; sustained ‘vvvv’)",
  w: "/w/ (water; short ‘wuh’ cue)",
  x: "/ks/ (end of fox)",
  y: "consonant /j/ (yellow; short ‘yuh’ cue)",
  z: "/z/ (zebra; sustained ‘zzzz’)",
};

const kindOrder = ["prompt", "letter-name", "phoneme", "number", "word"];
const kindTitles = {
  prompt: "Game instruction prompts",
  "letter-name": "Letter names",
  phoneme: "Letter sounds (phonemes)",
  number: "Numbers",
  word: "Tricky words",
};

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function recordingDirection(asset) {
  if (asset.kind === "prompt") return `Say exactly: “${asset.text}”`;
  if (asset.kind === "letter-name") return `Say the letter name “${asset.text}” once; do not make its phoneme.`;
  if (asset.kind === "number") return `Say the number “${asset.text}” once.`;
  if (asset.kind === "word") return `Say the word “${asset.text}” once, naturally and without using it in a sentence.`;
  const letter = asset.id.slice("phoneme.".length);
  return `Record only the sound: ${phonemeDirections[letter] ?? asset.text}. Do not say an example word.`;
}

function lineOrTarget(asset) {
  if (asset.kind !== "phoneme") return asset.text;
  const letter = asset.id.slice("phoneme.".length);
  return phonemeTargets[letter] ?? asset.text;
}

const counts = Object.fromEntries(kindOrder.map((kind) => [kind, assets.filter((asset) => asset.kind === kind).length]));
const output = [];
output.push("# CleverCove audio recording handoff");
output.push("");
output.push(`This is the complete recording inventory for **${assets.length} bundled audio assets**: ${counts.prompt} prompts, ${counts["letter-name"]} letter names, ${counts.phoneme} letter sounds, ${counts.number} numbers, and ${counts.word} tricky words.`);
output.push("");
output.push("## Copy/paste prompt for Codex on the voice-AI computer");
output.push("");
output.push("```text");
output.push("You are working on the CleverCove educational desktop app. Read docs/AUDIO_RECORDING_HANDOFF.md and src/content/audio-assets.json completely before changing files.");
output.push("");
output.push("Use the local voice/audio-generation tools on this computer to create or replace every WAV file listed in the handoff document at its exact repository-relative output path. Do not rename IDs, change paths, remove files, or add cloud/runtime audio dependencies.");
output.push("");
output.push("Voice and delivery requirements:");
output.push("- Use one consistent, warm, encouraging, clearly articulated US-English adult voice suitable for Kindergarten. Do not imitate a child.");
output.push("- Record only the requested line or sound. Do not speak filenames, labels, quotation marks, example words, or extra instructions.");
output.push("- Prompts should sound friendly and unhurried. Letter names, numbers, and words should be spoken once with neutral intonation.");
output.push("- Phonemes must be the sound, not the letter name. Follow the IPA/example directions in the handoff. Keep stop sounds short and continuous sounds clean; avoid an unnecessary trailing ‘uh’ except where the cue explicitly uses it for child clarity.");
output.push("- C and K intentionally share the primary /k/ sound. The app prevents them from appearing together in a question. Homophones are also prevented from appearing together.");
output.push("");
output.push("Technical requirements:");
output.push("- WAV, mono, 22,050 Hz, signed 16-bit PCM.");
output.push("- No music, room noise, reverb, clicks, clipping, or sound effects.");
output.push("- Trim leading/trailing silence to roughly 40–100 ms and normalize consistently, with peaks no higher than -3 dBFS.");
output.push("- Keep filenames and folders exactly as listed under public/audio/.");
output.push("");
output.push("Quality-control requirements:");
output.push("1. Listen to every generated file and confirm it matches its requested line/sound.");
output.push("2. Pay special attention to all 26 phonemes, short vowel distinctions, C/K, G/J, Q, W, X, and Y.");
output.push("3. Run npm run content:validate and npm test -- --run.");
output.push("4. Create docs/AUDIO_REVIEW_REPORT.md listing each asset ID, pass/fail, duration, and any item needing human review.");
output.push("5. Do not change a phoneme’s reviewStatus to adult-reviewed unless a qualified human explicitly approves that recording. Leave it adult-review-required otherwise.");
output.push("```");
output.push("");
output.push("## Recording standards");
output.push("");
output.push("The **Line / target sound** column is what the recording must contain. The **Direction** column is guidance for the voice model and must not be spoken. All paths are repository-relative and intentionally stable.");
output.push("");

for (const kind of kindOrder) {
  const kindAssets = assets.filter((asset) => asset.kind === kind);
  output.push(`## ${kindTitles[kind]} (${kindAssets.length})`);
  output.push("");
  output.push("| Audio ID | Line / target sound | Output path | Direction |");
  output.push("|---|---|---|---|");
  for (const asset of kindAssets) {
    output.push(`| \`${escapeCell(asset.id)}\` | ${escapeCell(lineOrTarget(asset))} | \`public/${escapeCell(asset.path)}\` | ${escapeCell(recordingDirection(asset))} |`);
  }
  output.push("");
}

output.push("## Final acceptance checklist");
output.push("");
output.push("- [ ] All paths in this document exist and contain playable WAV audio.");
output.push("- [ ] The same voice, loudness, pacing, and silence treatment are used throughout.");
output.push("- [ ] Letter-name clips say names; phoneme clips make sounds.");
output.push("- [ ] Short A, E, I, O, and U are distinguishable.");
output.push("- [ ] C and K both make the intended /k/ sound and are labeled as equivalent in app content.");
output.push("- [ ] No prompt contains a filename, label, or accidental extra phrase.");
output.push("- [ ] Every phoneme has been flagged for qualified adult review unless approval has already occurred.");
output.push("- [ ] `npm run content:validate` and `npm test -- --run` pass.");
output.push("");

await writeFile(new URL("docs/AUDIO_RECORDING_HANDOFF.md", rootUrl), `${output.join("\n")}\n`);
console.log(`Wrote docs/AUDIO_RECORDING_HANDOFF.md with ${assets.length} recording jobs.`);
