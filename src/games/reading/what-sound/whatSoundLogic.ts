import { getLettersByIds, kindergartenLetters, type LetterContent } from "../../../content";
import { buildUniqueChoices, pickOne, type RandomSource } from "../shared/quizLogic";

export interface WhatSoundQuestion {
  correct: LetterContent;
  choices: LetterContent[];
}

export function createWhatSoundQuestion(
  focusIds: readonly string[],
  random: RandomSource = Math.random,
  letters: readonly LetterContent[] = kindergartenLetters,
): WhatSoundQuestion {
  const practicePool = focusIds.length ? getLettersByIds(focusIds).filter((letter) => letters.some((item) => item.id === letter.id)) : [...letters];
  const correct = pickOne(practicePool.length ? practicePool : letters, random);
  return { correct, choices: buildUniqueChoices(correct, [], letters, 4, random) };
}
