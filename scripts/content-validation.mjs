import { readFile } from "node:fs/promises";

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

export async function loadContentFromDisk(rootUrl = new URL("../", import.meta.url)) {
  return {
    numberRange: await readJson(new URL("src/content/kindergarten/numbers.json", rootUrl)),
    letters: await readJson(new URL("src/content/kindergarten/alphabet.json", rootUrl)),
    trickyWords: await readJson(new URL("src/content/kindergarten/tricky-words.json", rootUrl)),
    audioAssets: await readJson(new URL("src/content/audio-assets.json", rootUrl)),
  };
}

function reportDuplicates(values, label, errors) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) errors.push(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

function requireString(entry, field, context, errors) {
  if (typeof entry?.[field] !== "string" || entry[field].trim() === "") {
    errors.push(`${context} is missing required field ${field}`);
  }
}

export function validateContent({ numberRange, letters, trickyWords, audioAssets }) {
  const errors = [];

  requireString(numberRange, "id", "Number range", errors);
  if (!Number.isInteger(numberRange?.minimum) || !Number.isInteger(numberRange?.maximum) || numberRange.minimum < 1 || numberRange.maximum < numberRange.minimum) {
    errors.push("Number range must contain positive integer minimum/maximum values in ascending order");
  }
  if (!Array.isArray(numberRange?.supportedPracticeMaximums) || numberRange.supportedPracticeMaximums.some((value) => !Number.isInteger(value) || value < numberRange.minimum || value > numberRange.maximum)) {
    errors.push("Supported counting maximums must be integers inside the declared number range");
  } else {
    reportDuplicates(numberRange.supportedPracticeMaximums, "supported counting maximum", errors);
  }

  const hasLetters = Array.isArray(letters);
  const hasTrickyWordCollections = Array.isArray(trickyWords?.words) && Array.isArray(trickyWords?.groups) && Array.isArray(trickyWords?.distractorGroups);
  const hasAudioAssets = Array.isArray(audioAssets);
  if (!hasLetters) {
    errors.push("Alphabet content must be an array");
  }
  if (!hasTrickyWordCollections) {
    errors.push("Tricky-word content must provide words, groups, and distractorGroups arrays");
  }
  if (!hasAudioAssets) {
    errors.push("Audio asset manifest must be an array");
  }
  if (!hasLetters || !hasTrickyWordCollections || !hasAudioAssets) return errors;

  const numberIds = Array.from({ length: numberRange.maximum - numberRange.minimum + 1 }, (_, index) => `number.${numberRange.minimum + index}`);
  const contentIds = [...numberIds, ...letters.map((entry) => entry.id), ...trickyWords.words.map((entry) => entry.id)];
  reportDuplicates(contentIds, "content ID", errors);
  reportDuplicates(audioAssets.map((entry) => entry.id), "audio ID", errors);
  reportDuplicates(audioAssets.map((entry) => entry.path), "audio path", errors);

  const audioIds = new Set(audioAssets.map((entry) => entry.id));
  const wordIds = new Set(trickyWords.words.map((entry) => entry.id));

  for (const entry of letters) {
    const context = entry?.id || "Letter entry";
    for (const field of ["id", "uppercase", "lowercase", "display", "letterNameAudioId", "phonemeAudioId"]) requireString(entry, field, context, errors);
    if (!/^letter\.[a-z]$/.test(entry?.id ?? "")) errors.push(`Malformed letter ID: ${entry?.id ?? "missing"}`);
    if (entry?.uppercase !== entry?.lowercase?.toUpperCase() || entry?.display !== `${entry?.uppercase}${entry?.lowercase}`) errors.push(`${context} has inconsistent uppercase/lowercase display values`);
    if (!audioIds.has(entry?.letterNameAudioId)) errors.push(`${context} references missing audio ID ${entry?.letterNameAudioId}`);
    if (!audioIds.has(entry?.phonemeAudioId)) errors.push(`${context} references missing audio ID ${entry?.phonemeAudioId}`);
    if (entry?.soundGroup !== undefined && (typeof entry.soundGroup !== "string" || !entry.soundGroup.trim())) errors.push(`${context} has an invalid soundGroup`);
  }

  for (const entry of trickyWords.words) {
    const context = entry?.id || "Tricky-word entry";
    for (const field of ["id", "text", "audioId"]) requireString(entry, field, context, errors);
    if (!/^word\.[A-Za-z]+$/.test(entry?.id ?? "")) errors.push(`Malformed tricky-word ID: ${entry?.id ?? "missing"}`);
    if (entry?.audioId !== entry?.id) errors.push(`${context} must use its stable word ID as its audio ID`);
    if (!audioIds.has(entry?.audioId)) errors.push(`${context} references missing audio ID ${entry?.audioId}`);
    if (entry?.homophoneGroup !== undefined && (typeof entry.homophoneGroup !== "string" || !entry.homophoneGroup.trim())) errors.push(`${context} has an invalid homophoneGroup`);
  }

  const groupedWordIds = [];
  reportDuplicates(trickyWords.groups.map((group) => group.id), "tricky-word group ID", errors);
  for (const group of trickyWords.groups) {
    const context = group?.id || "Tricky-word group";
    requireString(group, "id", context, errors);
    requireString(group, "label", context, errors);
    if (!Array.isArray(group?.wordIds) || !group.wordIds.length) {
      errors.push(`${context} must contain wordIds`);
      continue;
    }
    reportDuplicates(group.wordIds, `word reference in ${context}`, errors);
    for (const wordId of group.wordIds) {
      groupedWordIds.push(wordId);
      if (!wordIds.has(wordId)) errors.push(`${context} references nonexistent word ${wordId}`);
    }
  }
  reportDuplicates(groupedWordIds, "word assignment across term groups", errors);
  for (const wordId of wordIds) {
    if (!groupedWordIds.includes(wordId)) errors.push(`${wordId} is not assigned to a term group`);
  }

  reportDuplicates(trickyWords.distractorGroups.map((group) => group.id), "distractor group ID", errors);
  for (const group of trickyWords.distractorGroups) {
    const context = group?.id || "Distractor group";
    requireString(group, "id", context, errors);
    if (!Array.isArray(group?.wordIds) || group.wordIds.length < 2) {
      errors.push(`${context} must contain at least two wordIds`);
      continue;
    }
    reportDuplicates(group.wordIds, `distractor in ${context}`, errors);
    for (const wordId of group.wordIds) {
      if (!wordIds.has(wordId)) errors.push(`${context} references nonexistent distractor ${wordId}`);
    }
  }

  for (const entry of audioAssets) {
    const context = entry?.id || "Audio asset";
    for (const field of ["id", "kind", "text", "path", "reviewStatus"]) requireString(entry, field, context, errors);
    if (!/^audio\//.test(entry?.path ?? "") || !/\.wav$/.test(entry?.path ?? "")) errors.push(`${context} must use a local audio/*.wav path`);
    if (entry?.kind === "phoneme" && entry?.reviewStatus !== "adult-review-required" && entry?.reviewStatus !== "adult-reviewed") {
      errors.push(`${context} phoneme must be marked for adult review or adult-reviewed`);
    }
  }

  for (const numberId of numberIds) {
    if (!audioIds.has(numberId)) errors.push(`${numberId} references missing audio ID ${numberId}`);
  }

  return errors;
}
