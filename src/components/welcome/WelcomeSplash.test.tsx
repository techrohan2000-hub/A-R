// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WelcomeSplash } from "./WelcomeSplash";

vi.mock("../../hooks/useWedding", () => ({
  useWedding: () => ({ workspace: null, saveWedding: vi.fn() }),
}));

describe("WelcomeSplash", () => {
  beforeEach(() => {
    cleanup();
  });

  it("welcomes Rohan and Aishwarya and can be skipped", () => {
    render(<WelcomeSplash groomName="Rohan" brideName="Aishwarya" />);
    expect(screen.getByRole("dialog", { name: /Rohan & Aishwarya/ })).toBeTruthy();
    expect(screen.getByText(/Soft lights, warm hearts/)).toBeTruthy();
    expect(screen.getAllByText(/Two hearts, one mandap/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Skip welcome" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
