import alphabetData from "./alphabet.json";
import numberRange from "./numbers.json";
import trickyWordData from "./tricky-words.json";
import type {
  KindergartenContentPack,
  LetterContent,
  NumberContent,
  TrickyWordContent,
  TrickyWordDistractorGroup,
  TrickyWordGroup,
} from "../types";

export const SUPPORTED_COUNTING_MAXIMUMS = numberRange.supportedPracticeMaximums as ReadonlyArray<25 | 50 | 100>;

export const kindergartenNumbers: NumberContent[] = Array.from(
  { length: numberRange.maximum - numberRange.minimum + 1 },
  (_, index) => {
    const value = numberRange.minimum + index;
    return {
      id: `number.${value}`,
      value,
      display: String(value),
      audioId: `number.${value}`,
    };
  },
);

export const kindergartenLetters = alphabetData as LetterContent[];
export const kindergartenTrickyWords = trickyWordData.words as TrickyWordContent[];
export const kindergartenTrickyWordGroups = trickyWordData.groups as TrickyWordGroup[];
export const kindergartenTrickyWordDistractorGroups = trickyWordData.distractorGroups as TrickyWordDistractorGroup[];

export const kindergartenContentPack: KindergartenContentPack = {
  id: "content.kindergarten.core",
  numbers: kindergartenNumbers,
  letters: kindergartenLetters,
  trickyWords: kindergartenTrickyWords,
  trickyWordGroups: kindergartenTrickyWordGroups,
  trickyWordDistractorGroups: kindergartenTrickyWordDistractorGroups,
};

const numbersById = new Map(kindergartenNumbers.map((item) => [item.id, item]));
const lettersById = new Map(kindergartenLetters.map((item) => [item.id, item]));
const trickyWordsById = new Map(kindergartenTrickyWords.map((item) => [item.id, item]));
const trickyWordGroupsById = new Map(kindergartenTrickyWordGroups.map((item) => [item.id, item]));

export function getNumberContent(id: string): NumberContent | undefined {
  return numbersById.get(id as NumberContent["id"]);
}

export function getNumbersThrough(maximum: 25 | 50 | 100): NumberContent[] {
  return kindergartenNumbers.filter((item) => item.value <= maximum);
}

export function getLetterContent(id: string): LetterContent | undefined {
  return lettersById.get(id as LetterContent["id"]);
}

export function getLettersByIds(ids?: readonly string[]): LetterContent[] {
  if (!ids?.length) return [...kindergartenLetters];
  const selected = ids
    .map((id) => getLetterContent(id))
    .filter((item): item is LetterContent => Boolean(item))
    .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index);
  return selected.length ? selected : [...kindergartenLetters];
}

export function getTrickyWordContent(id: string): TrickyWordContent | undefined {
  return trickyWordsById.get(id as TrickyWordContent["id"]);
}

export function getTrickyWordsByGroupId(groupId?: string): TrickyWordContent[] {
  if (!groupId || groupId === "all") return [...kindergartenTrickyWords];
  const group = trickyWordGroupsById.get(groupId as TrickyWordGroup["id"]);
  return group ? group.wordIds.map((id) => trickyWordsById.get(id)).filter((item): item is TrickyWordContent => Boolean(item)) : [];
}

export function getCuratedDistractorIds(wordId: string): string[] {
  return kindergartenTrickyWordDistractorGroups
    .filter((group) => group.wordIds.includes(wordId as TrickyWordContent["id"]))
    .flatMap((group) => group.wordIds)
    .filter((id, index, ids) => id !== wordId && ids.indexOf(id) === index);
}
