import {
  kindergartenTrickyWordDistractorGroups,
  kindergartenTrickyWordGroups,
  kindergartenTrickyWords,
} from "../../../content";
import type { TrickyWordContent, TrickyWordDistractorGroup, TrickyWordGroup } from "../../../content";
import { buildUniqueChoices, pickOne, type RandomSource } from "../shared/quizLogic";

export interface TrickyWordQuestion {
  correct: TrickyWordContent;
  choices: TrickyWordContent[];
}

export function getTrickyWordPracticePool(
  groupId: string,
  words: readonly TrickyWordContent[] = kindergartenTrickyWords,
  groups: readonly TrickyWordGroup[] = kindergartenTrickyWordGroups,
): TrickyWordContent[] {
  if (groupId === "all") return [...words];
  const group = groups.find((item) => item.id === groupId);
  if (!group) return [...words];
  const allowedIds = new Set(group.wordIds);
  const selected = words.filter((word) => allowedIds.has(word.id));
  return selected.length > 0 ? selected : [...words];
}

export function getCuratedDistractors(
  correctId: string,
  words: readonly TrickyWordContent[] = kindergartenTrickyWords,
  distractorGroups: readonly TrickyWordDistractorGroup[] = kindergartenTrickyWordDistractorGroups,
): TrickyWordContent[] {
  const wordById = new Map(words.map((word) => [word.id, word]));
  const ids = distractorGroups
    .filter((group) => group.wordIds.includes(correctId as TrickyWordContent["id"]))
    .flatMap((group) => group.wordIds)
    .filter((id) => id !== correctId);
  return [...new Set(ids)].map((id) => wordById.get(id)).filter((word): word is TrickyWordContent => Boolean(word));
}

export function createTrickyWordQuestion(
  groupId: string,
  random: RandomSource = Math.random,
  words: readonly TrickyWordContent[] = kindergartenTrickyWords,
  groups: readonly TrickyWordGroup[] = kindergartenTrickyWordGroups,
  distractorGroups: readonly TrickyWordDistractorGroup[] = kindergartenTrickyWordDistractorGroups,
): TrickyWordQuestion {
  const practicePool = getTrickyWordPracticePool(groupId, words, groups);
  const correct = pickOne(practicePool, random);
  const curated = getCuratedDistractors(correct.id, words, distractorGroups);
  const fallback = [...practicePool, ...words];
  const choices = buildUniqueChoices(correct, curated, fallback, 4, random);
  return { correct, choices };
}
