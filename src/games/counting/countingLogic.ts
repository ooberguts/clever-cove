import type { NumberContent } from "../../content";
import { kindergartenNumbers } from "../../content";

export type RandomSource = () => number;

export interface SequenceQuestion {
  kind: "sequence";
  sequence: [NumberContent, NumberContent, NumberContent];
  answer: NumberContent;
  choices: NumberContent[];
}

export interface ListeningQuestion {
  kind: "listening";
  answer: NumberContent;
  choices: NumberContent[];
}

function randomIndex(length: number, random: RandomSource): number {
  return Math.min(length - 1, Math.floor(random() * length));
}

function shuffled<T>(items: readonly T[], random: RandomSource): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function numberByValue(value: number): NumberContent {
  const number = kindergartenNumbers.find((item) => item.value === value);
  if (!number) throw new Error(`Number content is missing for ${value}.`);
  return number;
}

export function buildNumberChoices(
  correctValue: number,
  maximum: 25 | 50 | 100,
  count = 3,
  random: RandomSource = Math.random,
): NumberContent[] {
  if (correctValue < 1 || correctValue > maximum) {
    throw new Error("The correct number must be inside the configured range.");
  }
  if (count < 2 || count > maximum) throw new Error("Choose a valid number of answers.");

  const reversed = Number(String(correctValue).split("").reverse().join(""));
  const isUsefulReversal = String(reversed).length === String(correctValue).length;
  const nearbyOffsets = shuffled([-1, 1, -2, 2, -3, 3, -5, 5, -10, 10], random);
  const candidates = [
    ...(reversed !== correctValue && isUsefulReversal ? [reversed] : []),
    ...nearbyOffsets.map((offset) => correctValue + offset),
    ...shuffled(
      Array.from({ length: maximum }, (_, index) => index + 1),
      random,
    ),
  ];

  const chosenValues = [correctValue];
  for (const candidate of candidates) {
    if (candidate >= 1 && candidate <= maximum && !chosenValues.includes(candidate)) {
      chosenValues.push(candidate);
    }
    if (chosenValues.length === count) break;
  }

  return shuffled(chosenValues.map(numberByValue), random);
}

export function createSequenceQuestion(
  maximum: 25 | 50 | 100,
  random: RandomSource = Math.random,
): SequenceQuestion {
  const start = 1 + randomIndex(maximum - 3, random);
  const answerValue = start + 3;
  return {
    kind: "sequence",
    sequence: [numberByValue(start), numberByValue(start + 1), numberByValue(start + 2)],
    answer: numberByValue(answerValue),
    choices: buildNumberChoices(answerValue, maximum, 3, random),
  };
}

export function createListeningQuestion(
  maximum: 25 | 50 | 100,
  random: RandomSource = Math.random,
): ListeningQuestion {
  const answerValue = 1 + randomIndex(maximum, random);
  return {
    kind: "listening",
    answer: numberByValue(answerValue),
    choices: buildNumberChoices(answerValue, maximum, 3, random),
  };
}
