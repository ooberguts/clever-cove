import { kindergartenLetters } from "../../../content";
import type { LetterContent } from "../../../content";
import { buildUniqueChoices, pickOne, type RandomSource } from "../shared/quizLogic";
import { letterSoundKey } from "../shared/soundEquivalence";

export interface LetterSoundQuestion {
  correct: LetterContent;
  choices: LetterContent[];
}

export function getLetterPracticePool(
  focusIds: readonly string[],
  letters: readonly LetterContent[] = kindergartenLetters,
): LetterContent[] {
  if (focusIds.length === 0) return [...letters];
  const focusSet = new Set(focusIds);
  const focused = letters.filter((letter) => focusSet.has(letter.id));
  return focused.length > 0 ? focused : [...letters];
}

export function createLetterSoundQuestion(
  focusIds: readonly string[],
  random: RandomSource = Math.random,
  letters: readonly LetterContent[] = kindergartenLetters,
): LetterSoundQuestion {
  const practicePool = getLetterPracticePool(focusIds, letters);
  const correct = pickOne(practicePool, random);
  const choices = buildUniqueChoices(correct, [], letters, 4, random, letterSoundKey);
  return { correct, choices };
}
