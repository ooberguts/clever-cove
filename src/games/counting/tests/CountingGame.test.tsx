import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { LearnerProfile } from "../../../domain/models";
import { CountingGame } from "../CountingGame";
import { COUNTING_GAME_ID, COUNTING_SKILL_IDS } from "../manifest";

const learner: LearnerProfile = {
  id: "learner-counting",
  displayName: "Mia",
  grade: "K",
  createdAt: "2026-10-01T00:00:00.000Z",
  schemaVersion: 2,
  progress: {},
  learningProgress: {},
  preferences: {
    countingMaximum: 25,
    letterFocusIds: [],
    trickyWordGroup: "tricky.term-1",
  },
  gameConfigurationRefs: [],
};

function makeServices() {
  return {
    audio: { play: vi.fn().mockResolvedValue(true) },
    learningPreferences: { get: vi.fn(() => learner.preferences) },
    progress: {
      startSession: vi.fn().mockResolvedValue(undefined),
      recordLearningAttempt: vi.fn().mockResolvedValue(undefined),
      recordPracticeCompletion: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe("CountingGame", () => {
  it("starts one session and records a listening answer with stable IDs", async () => {
    const user = userEvent.setup();
    const services = makeServices();
    render(<CountingGame learner={learner} services={services} onExit={vi.fn()} />);

    await waitFor(() => expect(services.progress.startSession).toHaveBeenCalledWith(learner.id, COUNTING_GAME_ID));
    await user.click(screen.getByRole("button", { name: /hear the number/i }));
    await waitFor(() => expect(services.audio.play).toHaveBeenCalled());

    const spokenId = services.audio.play.mock.calls[0][0] as string;
    const spokenValue = spokenId.replace("number.", "");
    await user.click(screen.getByRole("button", { name: `Number ${spokenValue}` }));

    await waitFor(() => expect(services.progress.recordLearningAttempt).toHaveBeenCalledWith(
      learner.id,
      COUNTING_GAME_ID,
      COUNTING_SKILL_IDS.recognition,
      spokenId,
      true,
    ));
    expect(screen.getByText(new RegExp(`Yes! It’s ${spokenValue}!`))).toBeInTheDocument();
  });

  it("records count-along completion only after counting in order", async () => {
    const user = userEvent.setup();
    const services = makeServices();
    render(<CountingGame learner={learner} services={services} onExit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /count along/i }));
    for (let value = 1; value <= 25; value += 1) {
      await user.click(screen.getByRole("button", { name: new RegExp(`^Number ${value}(?:, counted)?$`) }));
    }

    await waitFor(() => expect(services.progress.recordPracticeCompletion).toHaveBeenCalledWith(
      learner.id,
      COUNTING_GAME_ID,
    ));
    expect(screen.getByText("You counted to 25! Wonderful!")).toBeInTheDocument();
  });
});
