import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createTestServices } from "../test/testServices";
import { ChildDashboard } from "./ChildDashboard";

describe("Child dashboard learning pack", () => {
  it("shows all five ready games for a Kindergarten learner and launches the chosen game", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Maya", "K");
    await services.privateValues.set(learner.id, "private.student_id", "2468");
    const onLaunch = vi.fn();
    const user = userEvent.setup();
    render(<ChildDashboard learners={[services.profiles.get(learner.id)!]} activeLearnerId={learner.id} services={services} onSelectLearner={vi.fn()} onLaunch={onLaunch} />);

    expect(screen.getByText("5 games ready")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Counting Practice" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Letter Sound Match" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What Sound?" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tricky Word Match" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Student ID Practice" })).toBeInTheDocument();

    const countingCard = screen.getByRole("heading", { name: "Counting Practice" }).closest("article");
    await user.click(within(countingCard!).getByRole("button", { name: "Practice now" }));
    expect(onLaunch).toHaveBeenCalledWith("math.counting-practice");
  });

  it("keeps the Kindergarten pack scoped to grade K", async () => {
    const { services } = await createTestServices();
    const learner = await services.profiles.create("Jordan", "2");
    render(<ChildDashboard learners={[learner]} activeLearnerId={learner.id} services={services} onSelectLearner={vi.fn()} onLaunch={vi.fn()} />);
    expect(screen.getByText("1 game ready")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Counting Practice" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Student ID Practice" })).toBeInTheDocument();
  });
});
