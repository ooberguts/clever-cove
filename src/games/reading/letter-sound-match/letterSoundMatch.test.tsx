import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { kindergartenLetters } from "../../../content";
import { createTestServices } from "../../../test/testServices";
import { LetterSoundMatchGame } from "./LetterSoundMatchGame";
import { createLetterSoundQuestion, getLetterPracticePool } from "./letterSoundLogic";
import { LETTER_SOUND_MATCH_GAME_ID, LETTER_SOUND_SKILL_ID } from "./manifest";

afterEach(() => vi.restoreAllMocks());

describe("Letter Sound Match content and question logic", () => {
  it("loads complete A-Z content with uppercase, lowercase, and replaceable phoneme IDs", () => {
    expect(kindergartenLetters).toHaveLength(26);
    expect(kindergartenLetters.map((letter) => letter.uppercase).join("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    for (const letter of kindergartenLetters) {
      expect(letter.lowercase).toHaveLength(1);
      expect(letter.display).toBe(`${letter.uppercase}${letter.lowercase}`);
      expect(letter.phonemeAudioId).toBe(`phoneme.${letter.lowercase}`);
    }
  });

  it("uses valid focus letters and falls back to the full alphabet for an empty or invalid set", () => {
    expect(getLetterPracticePool(["letter.a", "letter.m"]).map((letter) => letter.id)).toEqual(["letter.a", "letter.m"]);
    expect(getLetterPracticePool([])).toHaveLength(26);
    expect(getLetterPracticePool(["letter.not-real"])).toHaveLength(26);
  });

  it("includes the correct letter exactly once and never duplicates choices", () => {
    for (let index = 0; index < 26; index += 1) {
      const question = createLetterSoundQuestion([], () => index / 26);
      const ids = question.choices.map((letter) => letter.id);
      expect(ids).toHaveLength(4);
      expect(new Set(ids)).toHaveLength(4);
      expect(ids.filter((id) => id === question.correct.id)).toHaveLength(1);
    }
  });
});

describe("Letter Sound Match game", () => {
  it("plays centralized phoneme audio, gently retries, and records content-level progress", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Maya", "K");
    await services.learningPreferences.setLetterFocusIds(learner.id, ["letter.m"]);
    const play = vi.spyOn(services.audio, "play").mockResolvedValue(true);
    const user = userEvent.setup();
    render(<LetterSoundMatchGame learner={learner} services={services} onExit={vi.fn()} />);

    await waitFor(() => expect(play).toHaveBeenCalledWith("phoneme.m"));
    await user.click(screen.getByRole("button", { name: "Hear the Question" }));
    expect(play).toHaveBeenCalledWith("prompt.reading.letter-sound-match");
    await user.click(screen.getByRole("button", { name: "Replay letter sound" }));
    expect(play).toHaveBeenCalledTimes(3);

    const choices = within(screen.getByLabelText("Letter choices")).getAllByRole("button");
    const wrong = choices.find((button) => !button.getAttribute("aria-label")?.startsWith("Letter M,"));
    expect(wrong).toBeDefined();
    await user.click(wrong!);
    expect(await screen.findByText("Good try! Listen again and choose another letter.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Letter M, lowercase m" }));
    expect(await screen.findByText("That’s right! Great listening!")).toBeInTheDocument();
    await waitFor(() => {
      expect(services.progress.getLearning(learner.id)).toContainEqual(expect.objectContaining({
        skillId: LETTER_SOUND_SKILL_ID,
        contentId: "letter.m",
        attempts: 2,
        correct: 1,
      }));
      expect(services.progress.get(learner.id, LETTER_SOUND_MATCH_GAME_ID)).toMatchObject({
        sessions: 1,
        attempts: 2,
        successes: 1,
      });
    });
  });
});
