import { describe, expect, it } from "vitest";
import type { WeddingWorkspace } from "../types/wedding";
import { buildComposerUrl, buildInvitationMessage, normalizePhone } from "./invitations";
import { deriveNotifications, visibleNotifications } from "./notifications";
import { pickPreferredWorkspace, workspaceHasWeddingData } from "./storage/localStorageAdapter";

const workspace: WeddingWorkspace = {
  wedding: {
    id: "w1",
    couple: { groomName: "Rohan", brideName: "Asha", weddingDate: "2026-09-20", weddingTime: "10:00", weddingVenue: "Hall", city: "Pune" },
    tradition: { region: "", familyTradition: "custom", language: "English", foodPreference: "vegetarian" },
    planning: { currency: "INR", totalBudget: 0, expectedGuestCount: 1, planningStartDate: "2026-01-01" },
    events: [{ id: "e1", name: "Wedding", date: "2026-09-10", enabled: true }],
    family: [],
    onboardingComplete: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  tasks: [{ id: "t1", title: "Call vendor", category: "Vendor", responsible: "Rohan", dueDate: "2026-09-03", priority: "high", status: "not-started" }],
  budget: [],
  guests: [],
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

describe("invitation helpers", () => {
  it("normalizes Indian phone numbers and safely encodes composer text", () => {
    expect(normalizePhone("98765 43210")).toBe("919876543210");
    const url = buildComposerUrl("whatsapp", { phone: "98765 43210" }, "Hello & welcome", "Invite");
    expect(url).toBe("https://wa.me/919876543210?text=Hello%20%26%20welcome");
  });

  it("builds an event invitation with fallback venue", () => {
    const message = buildInvitationMessage({
      guestName: "Joshi Family",
      groomName: "Rohan",
      brideName: "Asha",
      event: workspace.wedding.events[0],
      defaultVenue: "Main Hall",
      city: "Pune",
      rsvpText: "Please RSVP.",
      signature: "The family",
    });
    expect(message).toContain("Dear Joshi Family");
    expect(message).toContain("Venue: Main Hall, Pune");
  });

  it("builds a Marathi invitation without mixing English", () => {
    const marathi = buildInvitationMessage({
      guestName: "Joshi Family",
      groomName: "Rohan",
      brideName: "Asha",
      event: workspace.wedding.events[0],
      defaultVenue: "Main Hall",
      city: "Pune",
      rsvpText: "Please RSVP.",
      signature: "The family",
      language: "mr",
      style: "traditional",
    });
    expect(marathi).toContain("प्रिय Joshi Family");
    expect(marathi).toContain("शुभ विवाह निमंत्रण");
    expect(marathi).toContain("स्थळ: Main Hall, Pune");
    expect(marathi).not.toContain("You're invited");
  });

  it("fills an edited default template for every guest name", () => {
    const message = buildInvitationMessage({
      guestName: "Joshi Family",
      groomName: "Rohan",
      brideName: "Asha",
      event: workspace.wedding.events[0],
      defaultVenue: "Main Hall",
      city: "Pune",
      rsvpText: "Please RSVP.",
      signature: "The family",
      language: "en",
      customTemplateEn: "Dear {guestName},\nJoin {groomName} & {brideName} for {event}.",
    });
    expect(message).toBe("Dear Joshi Family,\nJoin Rohan & Asha for Wedding.");
  });
});

describe("reminder engine", () => {
  it("derives and orders upcoming task and event reminders", () => {
    const notices = deriveNotifications(workspace, new Date("2026-09-01T12:00:00"));
    expect(notices.map((notice) => notice.kind)).toEqual(["task", "event"]);
    expect(notices[0].body).toBe("Due in 2 days");
  });

  it("hides dismissed and currently snoozed reminders", () => {
    const notices = deriveNotifications(workspace, new Date("2026-09-01T12:00:00"));
    const visible = visibleNotifications(notices, [
      { id: notices[0].id, dismissedAt: "2026-09-01T12:00:00.000Z" },
      { id: notices[1].id, snoozedUntil: "2026-09-03T12:00:00.000Z" },
    ], new Date("2026-09-01T12:00:00"));
    expect(visible).toHaveLength(0);
  });
});

describe("workspace sync preference", () => {
  const empty: WeddingWorkspace = {
    ...workspace,
    wedding: {
      ...workspace.wedding,
      couple: { groomName: "", brideName: "", weddingDate: "", weddingTime: "", weddingVenue: "", city: "" },
      events: [],
      onboardingComplete: false,
      updatedAt: "2026-09-06T12:00:00.000Z",
    },
    tasks: [],
  };

  it("keeps a real local plan when the cloud copy is empty", () => {
    expect(workspaceHasWeddingData(workspace)).toBe(true);
    expect(workspaceHasWeddingData(empty)).toBe(false);
    expect(pickPreferredWorkspace(workspace, empty)).toBe(workspace);
  });

  it("does not let a missing cloud copy erase local data", () => {
    expect(pickPreferredWorkspace(workspace, null)).toBe(workspace);
  });
});
