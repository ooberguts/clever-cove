import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createTestServices } from "../test/testServices";
import { UpdatePanel } from "./UpdatePanel";

describe("Update panel", () => {
  it("shows the installed version and explains browser previews", async () => {
    const { services } = await createTestServices();
    const user = userEvent.setup();
    render(<UpdatePanel updates={services.updates} />);

    expect(screen.getByText(/CleverCove v0\.1\.1/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Check for updates" }));
    expect(await screen.findByText("Open the installed CleverCove app to check.")).toBeInTheDocument();
  });

  it("offers to install an available update and starts installation", async () => {
    const { services } = await createTestServices();
    const install = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(services.updates, "check").mockResolvedValue({ state: "available", version: "0.2.0", install });
    const user = userEvent.setup();
    render(<UpdatePanel updates={services.updates} />);

    await user.click(screen.getByRole("button", { name: "Check for updates" }));
    expect(await screen.findByText("CleverCove 0.2.0 is ready.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Install and restart" }));
    expect(install).toHaveBeenCalledOnce();
    expect(screen.getByText("Installing the update…")).toBeInTheDocument();
  });

  it("keeps retry available after an update check fails", async () => {
    const { services } = await createTestServices();
    vi.spyOn(services.updates, "check").mockRejectedValue(new Error("Update server unavailable."));
    const user = userEvent.setup();
    render(<UpdatePanel updates={services.updates} />);

    await user.click(screen.getByRole("button", { name: "Check for updates" }));
    expect(await screen.findByText("Couldn’t check for updates.")).toBeInTheDocument();
    expect(screen.getByText(/Update server unavailable/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check for updates" })).toBeEnabled();
  });
});
