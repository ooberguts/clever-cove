export type RandomSource = () => number;

export function pickOne<T>(items: readonly T[], random: RandomSource = Math.random): T {
  if (items.length === 0) throw new Error("A quiz needs at least one practice item.");
  const index = Math.min(items.length - 1, Math.floor(random() * items.length));
  return items[index];
}

export function shuffled<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.min(index, Math.floor(random() * (index + 1)));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

/** Builds a unique set containing the correct item exactly once. */
export function buildUniqueChoices<T extends { id: string }>(
  correct: T,
  preferredDistractors: readonly T[],
  fallbackDistractors: readonly T[],
  choiceCount = 4,
  random: RandomSource = Math.random,
  equivalenceKey: (item: T) => string = (item) => item.id,
): T[] {
  const unique = new Map<string, T>();
  const usedEquivalenceKeys = new Set([equivalenceKey(correct)]);
  for (const item of [...preferredDistractors, ...shuffled(fallbackDistractors, random)]) {
    const key = equivalenceKey(item);
    if (item.id !== correct.id && !usedEquivalenceKeys.has(key)) {
      unique.set(item.id, item);
      usedEquivalenceKeys.add(key);
    }
  }

  const distractors = [...unique.values()].slice(0, Math.max(0, choiceCount - 1));
  return shuffled([correct, ...distractors], random);
}
