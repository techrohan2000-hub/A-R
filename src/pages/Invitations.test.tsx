// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WeddingWorkspace } from "../types/wedding";
import { Invitations } from "./Invitations";

const mocks = vi.hoisted(() => ({ addInvitation: vi.fn() }));

const workspace: WeddingWorkspace = {
  wedding: {
    id: "w1",
    couple: { groomName: "Rohan", brideName: "Asha", weddingDate: "2026-09-20", weddingTime: "10:00", weddingVenue: "Main Hall", city: "Pune" },
    tradition: { region: "", familyTradition: "custom", language: "English", foodPreference: "vegetarian" },
    planning: { currency: "INR", totalBudget: 0, expectedGuestCount: 1, planningStartDate: "2026-01-01" },
    events: [{ id: "e1", name: "Wedding", date: "2026-09-20", enabled: true }],
    family: [],
    onboardingComplete: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  tasks: [],
  budget: [],
  guests: [{ id: "g1", name: "Joshi Family", side: "both", phone: "9876543210", email: "joshi@example.com", rsvp: "not-contacted", accommodationRequired: false }],
  vendors: [],
  shopping: [],
  milestones: [],
  plannerItems: [],
  invitations: [],
  notificationStates: [],
  reminderPreferences: {
    enabled: true,
    eventLeadDays: 14,
    taskLeadDays: 7,
    milestoneLeadDays: 14,
    vendorLeadDays: 7,
    rsvpFollowUpDays: 7,
    quietHoursEnabled: false,
    invitationSignature: "The family",
    rsvpText: "Please RSVP.",
    invitationMessageEn: "",
    invitationMessageMr: "",
  },
  activity: [],
};

vi.mock("../hooks/useWedding", () => ({
  useWedding: () => ({ workspace, addInvitation: mocks.addInvitation, saveReminderPreferences: vi.fn() }),
}));

describe("Invitations page", () => {
  beforeEach(() => {
    cleanup();
    mocks.addInvitation.mockReset();
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  it("personalizes and opens a free WhatsApp invitation", async () => {
    render(<Invitations />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Joshi Family" }));
    expect(screen.getAllByText(/Dear Joshi Family/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Open WhatsApp" }));
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining("wa.me/919876543210"), "_blank", "noopener,noreferrer");
    expect(mocks.addInvitation).toHaveBeenCalledWith(expect.objectContaining({ guestId: "g1", eventId: "e1", channel: "whatsapp", status: "opened" }));
  });

  it("sends an edited English default invitation to every selected guest", async () => {
    render(<Invitations />);
    fireEvent.change(screen.getByRole("textbox", { name: "English invitation" }), {
      target: { value: "Dear {guestName}, please come to our wedding." },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Joshi Family" }));
    expect(screen.getByText(/Dear Joshi Family, please come to our wedding/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open WhatsApp" }));
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent("Dear Joshi Family, please come to our wedding.")), "_blank", "noopener,noreferrer");
  });

  it("offers English and Marathi invitation options plus a card image send", () => {
    render(<Invitations />);
    fireEvent.click(screen.getByRole("button", { name: "Language: मराठी" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Joshi Family" }));
    expect(screen.getAllByText(/प्रिय Joshi Family/).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "WhatsApp with card" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download card" })).toBeTruthy();
  });
});
