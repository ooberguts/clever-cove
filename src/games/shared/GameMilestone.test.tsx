import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GameGoalProgress, GameMilestoneDialog } from "./GameMilestone";
import { correctsTowardMilestone } from "./useGameMilestone";

describe("game milestone", () => {
  it("carries saved successes toward each group of ten", () => {
    expect(correctsTowardMilestone(0)).toBe(0);
    expect(correctsTowardMilestone(9)).toBe(9);
    expect(correctsTowardMilestone(10)).toBe(0);
    expect(correctsTowardMilestone(27)).toBe(7);
  });

  it("renders an accessible progress bar", () => {
    render(<GameGoalProgress corrects={6} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "6");
    expect(screen.getByText("6 / 10 correct")).toBeInTheDocument();
  });

  it("offers both next-step choices at the celebration", async () => {
    const user = userEvent.setup();
    const keepPlaying = vi.fn();
    const chooseGame = vi.fn();
    render(<GameMilestoneDialog open learnerName="Maya" onKeepPlaying={keepPlaying} onChooseGame={chooseGame} />);
    expect(screen.getByRole("dialog", { name: "Amazing work, Maya!" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /keep playing/i }));
    expect(keepPlaying).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: /choose a new game/i }));
    expect(chooseGame).toHaveBeenCalledOnce();
  });
});
