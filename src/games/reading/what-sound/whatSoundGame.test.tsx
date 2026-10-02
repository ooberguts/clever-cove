import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { kindergartenLetters } from "../../../content";
import { createTestServices } from "../../../test/testServices";
import { WhatSoundGame } from "./WhatSoundGame";
import { createWhatSoundQuestion } from "./whatSoundLogic";
import { WHAT_SOUND_GAME_ID, WHAT_SOUND_SKILL_ID } from "./manifest";

afterEach(() => vi.restoreAllMocks());

describe("What Sound question logic", () => {
  it("shows a focused letter and four unique spoken sound choices", () => {
    const question = createWhatSoundQuestion(["letter.g"], () => 0);
    expect(question.correct.id).toBe("letter.g");
    expect(question.choices).toHaveLength(4);
    expect(new Set(question.choices.map((choice) => choice.id))).toHaveLength(4);
    expect(question.choices).toContainEqual(expect.objectContaining({ phonemeAudioId: "phoneme.g" }));
  });

  it("supports the complete alphabet when no focus letters are selected", () => {
    const questions = kindergartenLetters.map((_, index) => createWhatSoundQuestion([], () => (index + 0.5) / 26));
    expect(new Set(questions.map((question) => question.correct.id))).toHaveLength(26);
  });
});

describe("What Sound game", () => {
  it("separates the letter name from its phoneme and records safe progress", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Maya", "K");
    await services.learningPreferences.setLetterFocusIds(learner.id, ["letter.g"]);
    const play = vi.spyOn(services.audio, "play").mockResolvedValue(true);
    const user = userEvent.setup();
    render(<WhatSoundGame learner={learner} services={services} onExit={vi.fn()} />);

    await waitFor(() => expect(play).toHaveBeenCalledWith("letter.g.name"));
    expect(screen.getByLabelText("Uppercase G, lowercase g")).toHaveTextContent("Gg");
    await user.click(screen.getByRole("button", { name: "Hear its name: G" }));
    expect(play).toHaveBeenCalledWith("letter.g.name");

    const soundCards = within(screen.getByLabelText("Sound choices")).getAllByRole("article");
    const correctIndex = createWhatSoundQuestion(["letter.g"], () => 0).choices.findIndex((choice) => choice.id === "letter.g");
    expect(soundCards).toHaveLength(4);

    for (let index = 0; index < soundCards.length; index += 1) {
      await user.click(within(soundCards[index]).getByRole("button", { name: `Hear sound ${index + 1}` }));
    }
    expect(play.mock.calls.some(([id]) => id === "phoneme.g")).toBe(true);

    await user.click(within(soundCards[correctIndex]).getByRole("button", { name: `Choose sound ${correctIndex + 1}` }));

    expect(await screen.findByText("Yes! G makes that sound!")).toBeInTheDocument();
    await waitFor(() => expect(services.progress.getLearning(learner.id)).toContainEqual(expect.objectContaining({
      skillId: WHAT_SOUND_SKILL_ID,
      contentId: "letter.g",
      attempts: 1,
      correct: 1,
    })));
    expect(services.progress.get(learner.id, WHAT_SOUND_GAME_ID)).toMatchObject({ sessions: 1, successes: 1 });
  });
});
