import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  kindergartenTrickyWordGroups,
  kindergartenTrickyWords,
} from "../../../content";
import { createTestServices } from "../../../test/testServices";
import { TrickyWordMatchGame } from "./TrickyWordMatchGame";
import {
  createTrickyWordQuestion,
  getCuratedDistractors,
  getTrickyWordPracticePool,
} from "./trickyWordLogic";
import { TRICKY_WORD_MATCH_GAME_ID, TRICKY_WORD_SKILL_ID } from "./manifest";

afterEach(() => vi.restoreAllMocks());

describe("Tricky Word Match content and question logic", () => {
  it("loads every supplied word, preserves I, and provides centralized audio IDs", () => {
    expect(kindergartenTrickyWords).toHaveLength(62);
    expect(kindergartenTrickyWordGroups.map((group) => group.wordIds.length)).toEqual([14, 16, 20, 12]);
    expect(kindergartenTrickyWords.find((word) => word.id === "word.I")).toMatchObject({ text: "I", audioId: "word.I" });
    for (const word of kindergartenTrickyWords) expect(word.audioId).toBe(word.id);
  });

  it("filters each term and supports all words", () => {
    for (const group of kindergartenTrickyWordGroups) {
      expect(getTrickyWordPracticePool(group.id).map((word) => word.id)).toEqual(group.wordIds);
    }
    expect(getTrickyWordPracticePool("all")).toHaveLength(62);
    expect(getTrickyWordPracticePool("not-real")).toHaveLength(62);
  });

  it("resolves curated confusing words from content data", () => {
    expect(getCuratedDistractors("word.where").map((word) => word.id)).toEqual([
      "word.were",
      "word.there",
      "word.what",
      "word.which",
    ]);
    expect(getCuratedDistractors("word.to").map((word) => word.id)).toEqual(["word.two"]);
  });

  it("includes one correct answer, no duplicates, and valid curated distractors", () => {
    const question = createTrickyWordQuestion("tricky.term-4", () => 0);
    const ids = question.choices.map((word) => word.id);
    expect(question.correct.id).toBe("word.where");
    expect(ids).toHaveLength(4);
    expect(new Set(ids)).toHaveLength(4);
    expect(ids.filter((id) => id === "word.where")).toHaveLength(1);
    expect(ids).toEqual(expect.arrayContaining(["word.were", "word.there"]));
    expect(ids.every((id) => kindergartenTrickyWords.some((word) => word.id === id))).toBe(true);
  });
});

describe("Tricky Word Match game", () => {
  it("plays centralized word audio, allows a gentle retry, and records stable IDs", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Noah", "K");
    await services.learningPreferences.setTrickyWordGroup(learner.id, "tricky.term-1");
    const play = vi.spyOn(services.audio, "play").mockResolvedValue(true);
    const user = userEvent.setup();
    render(<TrickyWordMatchGame learner={learner} services={services} onExit={vi.fn()} />);

    await waitFor(() => expect(play).toHaveBeenCalledWith("word.am"));
    await user.click(screen.getByRole("button", { name: "Hear the Question" }));
    expect(play).toHaveBeenCalledWith("prompt.reading.tricky-word-match");
    await user.click(screen.getByRole("button", { name: "Replay spoken word" }));
    expect(play).toHaveBeenCalledTimes(3);

    const choices = within(screen.getByLabelText("Word choices")).getAllByRole("button");
    const wrong = choices.find((button) => button.getAttribute("aria-label") !== "am");
    expect(wrong).toBeDefined();
    await user.click(wrong!);
    expect(await screen.findByText("Nice try! Hear the word again and choose another one.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "am" }));
    expect(await screen.findByText("You found it! Wonderful reading!")).toBeInTheDocument();
    await waitFor(() => {
      expect(services.progress.getLearning(learner.id)).toContainEqual(expect.objectContaining({
        skillId: TRICKY_WORD_SKILL_ID,
        contentId: "word.am",
        attempts: 2,
        correct: 1,
      }));
      expect(services.progress.get(learner.id, TRICKY_WORD_MATCH_GAME_ID)).toMatchObject({
        sessions: 1,
        attempts: 2,
        successes: 1,
      });
    });
  });
});
