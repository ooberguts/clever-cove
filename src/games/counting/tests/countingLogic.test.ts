import { describe, expect, it } from "vitest";
import { buildNumberChoices, createListeningQuestion, createSequenceQuestion } from "../countingLogic";

const randomValues = [0, 0.001, 0.12, 0.49, 0.75, 0.999];

describe("counting question logic", () => {
  it.each([25, 50, 100] as const)("builds valid sequence questions through %i", (maximum) => {
    for (const value of randomValues) {
      const question = createSequenceQuestion(maximum, () => value);
      const choiceValues = question.choices.map((choice) => choice.value);

      expect(question.sequence.map((item) => item.value)).toEqual([
        question.answer.value - 3,
        question.answer.value - 2,
        question.answer.value - 1,
      ]);
      expect(question.answer.value).toBeGreaterThanOrEqual(4);
      expect(question.answer.value).toBeLessThanOrEqual(maximum);
      expect(choiceValues).toContain(question.answer.value);
      expect(new Set(choiceValues)).toHaveLength(3);
      expect(choiceValues.every((choice) => choice >= 1 && choice <= maximum)).toBe(true);
    }
  });

  it.each([25, 50, 100] as const)("builds valid listening questions through %i", (maximum) => {
    for (const value of randomValues) {
      const question = createListeningQuestion(maximum, () => value);
      const choiceValues = question.choices.map((choice) => choice.value);

      expect(question.answer.id).toBe(`number.${question.answer.value}`);
      expect(question.answer.audioId).toBe(`number.${question.answer.value}`);
      expect(choiceValues).toContain(question.answer.value);
      expect(new Set(choiceValues)).toHaveLength(3);
      expect(choiceValues.every((choice) => choice >= 1 && choice <= maximum)).toBe(true);
    }
  });

  it("uses nearby in-range choices at the lower and upper bounds", () => {
    for (const correct of [1, 25] as const) {
      const choices = buildNumberChoices(correct, 25, 3, () => 0).map((choice) => choice.value);
      expect(choices).toContain(correct);
      expect(new Set(choices)).toHaveLength(3);
      expect(choices.every((choice) => choice >= 1 && choice <= 25)).toBe(true);
    }
  });
});
