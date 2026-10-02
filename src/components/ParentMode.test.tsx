import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { LearnerProfile } from "../domain/models";
import type { AppServices } from "../services";
import { createTestServices } from "../test/testServices";
import { ParentMode } from "./ParentMode";

function ParentModeHarness({ services, initialLearners }: { services: AppServices; initialLearners: LearnerProfile[] }) {
  const [learners, setLearners] = useState(initialLearners);
  return <ParentMode services={services} learners={learners} onRefresh={() => setLearners(services.profiles.list())} onExit={vi.fn()} />;
}

describe("Parent Mode learner editing", () => {
  it("updates the selected learner's display name and grade without changing the selection", async () => {
    const { services } = await createTestServices();
    await services.profiles.create("Avery", "K");
    const jordan = await services.profiles.create("Jordan", "1");
    const update = vi.spyOn(services.profiles, "update");
    const user = userEvent.setup();
    render(<ParentModeHarness services={services} initialLearners={services.profiles.list()} />);

    await user.click(screen.getByRole("button", { name: /Jordan Grade 1/ }));
    await user.click(screen.getByRole("button", { name: "Edit learner" }));
    const nameInput = screen.getByLabelText("Display name", { selector: "#edit-learner-name" });
    await user.clear(nameInput);
    await user.type(nameInput, "Jordy");
    await user.selectOptions(screen.getByLabelText("School grade", { selector: "#edit-learner-grade" }), "K");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(update).toHaveBeenCalledWith(jordan.id, "Jordy", "K");
    expect(await screen.findByRole("heading", { name: "Jordy" })).toBeInTheDocument();
    expect(screen.getByText("Jordy’s profile was updated.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Jordy Grade K/ })).toHaveClass("active");
  });

  it("cancels an edit without changing the learner", async () => {
    const { services } = await createTestServices();
    await services.profiles.create("Avery", "K");
    const update = vi.spyOn(services.profiles, "update");
    const user = userEvent.setup();
    render(<ParentModeHarness services={services} initialLearners={services.profiles.list()} />);

    await user.click(screen.getByRole("button", { name: "Edit learner" }));
    const editCard = screen.getByRole("heading", { name: "Edit learner" }).closest("article");
    if (!editCard) throw new Error("Edit learner card was not rendered.");
    const nameInput = within(editCard).getByLabelText("Display name");
    await user.clear(nameInput);
    await user.type(nameInput, "Changed");
    await user.click(within(editCard).getByRole("button", { name: "Cancel" }));

    expect(update).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "Edit learner" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Avery" })).toBeInTheDocument();
  });
});

describe("Parent Mode Kindergarten settings", () => {
  it("stores the counting range, letter focus, and tricky-word term per learner", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Maya", "K");
    const user = userEvent.setup();
    render(<ParentModeHarness services={services} initialLearners={services.profiles.list()} />);

    await user.selectOptions(screen.getByLabelText("Counting practice maximum"), "50");
    await screen.findByText("Counting practice now goes to 50.");
    await user.click(screen.getByRole("button", { name: "Add letter M" }));
    await screen.findByText("1 focus letter selected.");
    await user.selectOptions(screen.getByLabelText("Tricky word group"), "tricky.term-3");
    await screen.findByText("Tricky Word Match will use Term 3.");

    expect(services.learningPreferences.get(learner.id)).toEqual({
      countingMaximum: 50,
      letterFocusIds: ["letter.m"],
      trickyWordGroup: "tricky.term-3",
    });
  });
});

describe("Parent Mode progress reports", () => {
  it("shows the selected learner's game activity and focus areas on a separate tab", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Maya", "K");
    await services.profiles.create("Noah", "K");
    await services.progress.startSession(learner.id, "reading.letter-sound-match");
    await services.progress.startSession(learner.id, "reading.letter-sound-match");
    await services.progress.recordLearningAttempt(learner.id, "reading.letter-sound-match", "reading.letter-sound-correspondence", "letter.m", false);
    await services.progress.recordLearningAttempt(learner.id, "reading.letter-sound-match", "reading.letter-sound-correspondence", "letter.m", false);
    await services.progress.recordLearningAttempt(learner.id, "reading.letter-sound-match", "reading.letter-sound-correspondence", "letter.m", true);
    const user = userEvent.setup();
    render(<ParentModeHarness services={services} initialLearners={services.profiles.list()} />);

    await user.click(screen.getByRole("tab", { name: "Progress report" }));
    expect(screen.getByRole("tab", { name: "Progress report" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("What Maya plays")).toBeInTheDocument();
    expect(screen.getByText("2", { selector: ".report-metric strong" })).toBeInTheDocument();
    expect(screen.getByText("Letter Mm")).toBeInTheDocument();
    expect(screen.getByText("Most played")).toBeInTheDocument();
    expect(screen.getByText("More practice")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Noah Grade K/ }));
    expect(screen.getByText("What Noah plays")).toBeInTheDocument();
    expect(screen.getByText("No practice recorded yet")).toBeInTheDocument();
  });
});
