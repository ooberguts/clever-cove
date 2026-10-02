import { readFile, writeFile } from "node:fs/promises";

const rootUrl = new URL("../", import.meta.url);
const alphabet = JSON.parse(await readFile(new URL("src/content/kindergarten/alphabet.json", rootUrl), "utf8"));
const numberRange = JSON.parse(await readFile(new URL("src/content/kindergarten/numbers.json", rootUrl), "utf8"));
const trickyWords = JSON.parse(await readFile(new URL("src/content/kindergarten/tricky-words.json", rootUrl), "utf8"));
const outputUrl = new URL("src/content/audio-assets.json", rootUrl);
let existingAssets = [];
try {
  existingAssets = JSON.parse(await readFile(outputUrl, "utf8"));
} catch {
  // The first manifest generation intentionally starts without prior metadata.
}
const existingById = new Map(existingAssets.map((asset) => [asset.id, asset]));

const assets = [];

for (const prompt of [
  { id: "prompt.counting.what-comes-next", text: "What comes next?", filename: "what-comes-next" },
  { id: "prompt.counting.hear-the-number", text: "Which number did you hear?", filename: "hear-the-number" },
  { id: "prompt.counting.count-along", text: "Count along. Tap each number.", filename: "count-along" },
  { id: "prompt.reading.letter-sound-match", text: "Which letter makes this sound?", filename: "reading/letter-sound-match" },
  { id: "prompt.reading.tricky-word-match", text: "Which word did you hear?", filename: "reading/tricky-word-match" },
]) {
  assets.push({
    id: prompt.id,
    kind: "prompt",
    text: prompt.text,
    path: `audio/prompts/${prompt.filename.includes("/") ? prompt.filename : `counting/${prompt.filename}`}.wav`,
    reviewStatus: "generated",
  });
}

for (let value = numberRange.minimum; value <= numberRange.maximum; value += 1) {
  assets.push({
    id: `number.${value}`,
    kind: "number",
    text: String(value),
    path: `audio/numbers/${value}.wav`,
    reviewStatus: "generated",
  });
}

for (const letter of alphabet) {
  assets.push({
    id: letter.letterNameAudioId,
    kind: "letter-name",
    text: letter.uppercase,
    path: `audio/letter-names/${letter.lowercase}.wav`,
    reviewStatus: "generated",
  });
  assets.push({
    id: letter.phonemeAudioId,
    kind: "phoneme",
    text: letter.lowercase,
    path: `audio/phonemes/${letter.lowercase}.wav`,
    reviewStatus: "adult-review-required",
  });
}

for (const word of trickyWords.words) {
  assets.push({
    id: word.audioId,
    kind: "word",
    text: word.text,
    path: `audio/words/${word.id.slice("word.".length)}.wav`,
    reviewStatus: "generated",
  });
}

assets.sort((left, right) => left.id.localeCompare(right.id, "en", { numeric: true }));
for (const asset of assets) {
  if (existingById.get(asset.id)?.reviewStatus === "adult-reviewed") asset.reviewStatus = "adult-reviewed";
}
await writeFile(outputUrl, `${JSON.stringify(assets, null, 2)}\n`);
console.log(`Wrote ${assets.length} audio asset definitions.`);
