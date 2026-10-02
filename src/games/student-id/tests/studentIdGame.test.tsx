import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StudentIdGame } from "../StudentIdGame";
import { appendDigit, KEYPAD_KEYS } from "../studentIdLogic";
import { STUDENT_ID_GAME_ID } from "../manifest";
import { createTestServices } from "../../../test/testServices";

describe("Student ID game mechanics", () => {
  it("uses the exact real-world keypad order", () => {
    expect(KEYPAD_KEYS).toEqual(["7", "8", "9", "4", "5", "6", "1", "2", "3", "CLEAR", "0", "ENTER"]);
  });

  it("appends digits and ignores non-digits", () => {
    expect(appendDigit(appendDigit("", "7"), "2")).toBe("72");
    expect(appendDigit("72", "x")).toBe("72");
  });

  it("enforces the 12-digit maximum", () => {
    expect(appendDigit("123456789012", "3")).toBe("123456789012");
  });

  async function renderConfiguredGame() {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Maya", "4");
    await services.privateValues.set(learner.id, "private.student_id", "7890");
    const user = userEvent.setup();
    render(<StudentIdGame learner={learner} services={services} onExit={vi.fn()} />);
    return { services, learner, user };
  }

  it("renders every keypad control in manifest order", async () => {
    await renderConfiguredGame();
    const buttons = screen.getAllByRole("button").slice(1);
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(KEYPAD_KEYS);
  });

  it("shows entered digits and CLEAR resets the full input", async () => {
    const { user } = await renderConfiguredGame();
    await user.click(screen.getByRole("button", { name: "Number 7" }));
    await user.click(screen.getByRole("button", { name: "Number 8" }));
    expect(screen.getByText("78")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear all digits" }));
    expect(screen.getByText("Your numbers will appear here")).toBeInTheDocument();
  });

  it("supports physical number keys and Backspace clears the attempt", async () => {
    const { user } = await renderConfiguredGame();
    await user.keyboard("1234567890123");
    expect(screen.getByText("123456789012")).toBeInTheDocument();
    expect(screen.getByText("12/12")).toBeInTheDocument();
    await user.keyboard("{Backspace}");
    expect(screen.getByText("Your numbers will appear here")).toBeInTheDocument();
  });

  it("accepts the configured ID and increments safe success progress", async () => {
    const { user, services, learner } = await renderConfiguredGame();
    for (const digit of ["7", "8", "9", "0"]) await user.click(screen.getByRole("button", { name: `Number ${digit}` }));
    await user.click(screen.getByRole("button", { name: "Submit student ID" }));
    expect(await screen.findByText("Correct! Nice job!")).toBeInTheDocument();
    expect(services.progress.get(learner.id, STUDENT_ID_GAME_ID)).toMatchObject({ attempts: 1, successes: 1, completedRounds: 1 });
  });

  it("rejects an incorrect ID without revealing the expected value", async () => {
    const { user, services, learner } = await renderConfiguredGame();
    for (const digit of ["1", "2", "3"]) await user.click(screen.getByRole("button", { name: `Number ${digit}` }));
    await user.click(screen.getByRole("button", { name: "Submit student ID" }));
    expect(await screen.findByText("Not quite. Try again.")).toBeInTheDocument();
    expect(screen.queryByText("7890")).not.toBeInTheDocument();
    expect(services.progress.get(learner.id, STUDENT_ID_GAME_ID)).toMatchObject({ attempts: 1, successes: 0, completedRounds: 0 });
  });
});
