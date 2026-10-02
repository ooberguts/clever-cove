import { render, screen, within } from "@testing-library/react";
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
    const keypad = screen.getByLabelText("Student ID numeric keypad");
    const buttons = within(keypad).getAllByRole("button");
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(KEYPAD_KEYS);
  });

  it("shows the guided Student ID reference", async () => {
    await renderConfiguredGame();
    expect(screen.getByLabelText("Student ID to practice: 7 8 9 0")).toHaveTextContent("7890");
  });

  it("turns matching digits green and CLEAR resets the full input", async () => {
    const { user } = await renderConfiguredGame();
    await user.click(screen.getByRole("button", { name: "Number 7" }));
    await user.click(screen.getByRole("button", { name: "Number 8" }));
    expect(screen.getByLabelText("Entered digit 1: 7, correct")).toHaveClass("correct");
    expect(screen.getByLabelText("Entered digit 2: 8, correct")).toHaveClass("correct");
    await user.click(screen.getByRole("button", { name: "Clear all digits" }));
    expect(screen.getByText("Tap the first number to begin")).toBeInTheDocument();
  });

  it("marks a wrong digit and highlights CLEAR", async () => {
    const { user } = await renderConfiguredGame();
    await user.click(screen.getByRole("button", { name: "Number 1" }));
    expect(screen.getByLabelText("Entered digit 1: 1, needs clearing")).toHaveClass("incorrect");
    expect(screen.getByRole("button", { name: "Clear all digits" })).toHaveClass("needs-attention");
    expect(screen.getByText("This number needs fixing.")).toBeInTheDocument();
  });

  it("supports physical number keys and Backspace clears the attempt", async () => {
    const { user } = await renderConfiguredGame();
    await user.keyboard("1234567890123");
    expect(screen.getByLabelText("Entered digit 12: 2, needs clearing")).toBeInTheDocument();
    expect(screen.getByText("12/12")).toBeInTheDocument();
    await user.keyboard("{Backspace}");
    expect(screen.getByText("Tap the first number to begin")).toBeInTheDocument();
  });

  it("accepts the configured ID and increments safe success progress", async () => {
    const { user, services, learner } = await renderConfiguredGame();
    for (const digit of ["7", "8", "9", "0"]) await user.click(screen.getByRole("button", { name: `Number ${digit}` }));
    await user.click(screen.getByRole("button", { name: "Submit student ID" }));
    expect(await screen.findByText("Correct! Nice job!")).toBeInTheDocument();
    expect(services.progress.get(learner.id, STUDENT_ID_GAME_ID)).toMatchObject({ attempts: 1, successes: 1, completedRounds: 1 });
  });

  it("keeps an incorrect attempt visible for guided clearing without persisting it", async () => {
    const { user, services, learner } = await renderConfiguredGame();
    for (const digit of ["1", "2", "3"]) await user.click(screen.getByRole("button", { name: `Number ${digit}` }));
    await user.click(screen.getByRole("button", { name: "Submit student ID" }));
    expect(await screen.findByText("Oops! Press CLEAR.")).toBeInTheDocument();
    expect(screen.getByLabelText("Student ID to practice: 7 8 9 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Entered digit 1: 1, needs clearing")).toBeInTheDocument();
    expect(services.progress.get(learner.id, STUDENT_ID_GAME_ID)).toMatchObject({ attempts: 1, successes: 0, completedRounds: 0 });
  });

  it("plays gentle digit tones and a success chime", async () => {
    const { user, services } = await renderConfiguredGame();
    const digitSound = vi.spyOn(services.sounds, "digit");
    const successSound = vi.spyOn(services.sounds, "success");
    for (const digit of ["7", "8", "9", "0"]) await user.click(screen.getByRole("button", { name: `Number ${digit}` }));
    expect(digitSound).toHaveBeenCalledTimes(4);
    expect(digitSound).toHaveBeenCalledWith("correct", false);
    await user.click(screen.getByRole("button", { name: "Submit student ID" }));
    expect(successSound).toHaveBeenCalledWith(false);
  });
});
