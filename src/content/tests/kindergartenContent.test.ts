import { describe, expect, it } from "vitest";
import { pathToFileURL } from "node:url";
import {
  audioAssetManifest,
  getCuratedDistractorIds,
  getLettersByIds,
  getNumbersThrough,
  getTrickyWordsByGroupId,
  kindergartenLetters,
  kindergartenNumbers,
  kindergartenTrickyWordGroups,
  kindergartenTrickyWords,
} from "..";
import { loadContentFromDisk, validateContent } from "../../../scripts/content-validation.mjs";

const workspaceUrl = pathToFileURL(`${process.cwd()}/`);

describe("Kindergarten learning content", () => {
  it("defines numbers 1 through 100 with resolvable local audio", () => {
    const audioIds = new Set(audioAssetManifest.map((asset) => asset.id));
    expect(kindergartenNumbers).toHaveLength(100);
    expect(kindergartenNumbers[0]).toMatchObject({ id: "number.1", value: 1 });
    expect(kindergartenNumbers[99]).toMatchObject({ id: "number.100", value: 100 });
    expect(kindergartenNumbers.every((number) => audioIds.has(number.audioId))).toBe(true);
    expect(getNumbersThrough(25)).toHaveLength(25);
    expect(getNumbersThrough(50)).toHaveLength(50);
    expect(getNumbersThrough(100)).toHaveLength(100);
  });

  it("defines A-Z with letter-name and replaceable phoneme references", () => {
    const audioIds = new Set(audioAssetManifest.map((asset) => asset.id));
    expect(kindergartenLetters).toHaveLength(26);
    expect(kindergartenLetters.map((letter) => letter.uppercase).join("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    expect(kindergartenLetters.every((letter) => audioIds.has(letter.letterNameAudioId) && audioIds.has(letter.phonemeAudioId))).toBe(true);
    expect(getLettersByIds(["letter.a", "letter.m"]).map((letter) => letter.id)).toEqual(["letter.a", "letter.m"]);
    expect(getLettersByIds(["letter.a", "letter.a"]).map((letter) => letter.id)).toEqual(["letter.a"]);
    expect(getLettersByIds([])).toHaveLength(26);
    expect(getLettersByIds(["letter.not-real"])).toHaveLength(26);
  });

  it("preserves every supplied tricky-word term and capitalization", () => {
    expect(kindergartenTrickyWords).toHaveLength(62);
    expect(kindergartenTrickyWordGroups.map((group) => group.wordIds.length)).toEqual([14, 16, 20, 12]);
    expect(getTrickyWordsByGroupId("tricky.term-3")).toHaveLength(20);
    expect(getTrickyWordsByGroupId("all")).toHaveLength(62);
    expect(kindergartenTrickyWords.find((word) => word.id === "word.I")?.text).toBe("I");
    expect(getCuratedDistractorIds("word.where")).toEqual(expect.arrayContaining(["word.were", "word.there", "word.what", "word.which"]));
  });

  it("passes the development-time validator", async () => {
    expect(validateContent(await loadContentFromDisk(workspaceUrl))).toEqual([]);
  });

  it("reports nonexistent and duplicate distractor references", async () => {
    const content = structuredClone(await loadContentFromDisk(workspaceUrl));
    content.trickyWords.distractorGroups[0].wordIds = ["word.where", "word.where", "word.not-real"];
    const errors = validateContent(content);
    expect(errors.some((error) => error.includes("Duplicate distractor"))).toBe(true);
    expect(errors).toContain("tricky.distractors.where-were-there references nonexistent distractor word.not-real");
  });

  it("reports malformed ranges, duplicate IDs, and missing audio references", async () => {
    const content = structuredClone(await loadContentFromDisk(workspaceUrl));
    content.numberRange.maximum = 0;
    content.letters[1].id = content.letters[0].id;
    content.letters[0].phonemeAudioId = "phoneme.not-real";
    const errors = validateContent(content);
    expect(errors.some((error) => error.startsWith("Number range must"))).toBe(true);
    expect(errors).toContain("Duplicate content ID: letter.a");
    expect(errors).toContain("letter.a references missing audio ID phoneme.not-real");
  });
});
