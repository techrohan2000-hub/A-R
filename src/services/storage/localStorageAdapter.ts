import type { GuestMealPreference, GuestSummary, ReminderPreferences, Wedding, WeddingWorkspace } from "../../types/wedding";
import type { StorageAdapter } from "./StorageAdapter";

const STORAGE_KEY = "wedding-planner:workspace:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function isValidWorkspace(value: unknown): value is WeddingWorkspace {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return isRecord(v.wedding);
}

export function isLegacySampleWorkspace(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.wedding)) return false;
  return value.wedding.isSampleData === true;
}

const mealPreferences: GuestMealPreference[] = ["veg", "non-veg", "jain", "other"];

function normalizeGuest(value: unknown): GuestSummary {
  const guest = isRecord(value) ? value : {};
  const rsvp = guest.rsvp;
  const meal = guest.mealPreference;
  return {
    id: typeof guest.id === "string" ? guest.id : "guest",
    name: typeof guest.name === "string" ? guest.name : "",
    side: guest.side === "bride" || guest.side === "groom" ? guest.side : "both",
    ...(typeof guest.phone === "string" ? { phone: guest.phone } : {}),
    ...(typeof guest.email === "string" ? { email: guest.email } : {}),
    rsvp: rsvp === "invited" || rsvp === "maybe" || rsvp === "confirmed" || rsvp === "declined" ? rsvp : "not-contacted",
    accommodationRequired: guest.accommodationRequired === true,
    ...(typeof guest.relation === "string" && guest.relation.trim() ? { relation: guest.relation } : {}),
    partySize: typeof guest.partySize === "number" && guest.partySize > 0 ? Math.round(guest.partySize) : 1,
    mealPreference: typeof meal === "string" && mealPreferences.includes(meal as GuestMealPreference) ? meal as GuestMealPreference : "veg",
    outstation: guest.outstation === true,
    ...(typeof guest.notes === "string" && guest.notes.trim() ? { notes: guest.notes } : {}),
  };
}

export function normalizeWorkspace(workspace: WeddingWorkspace): WeddingWorkspace {
  const now = new Date().toISOString();
  const wedding = workspace.wedding as Partial<Wedding>;
  const couple: Record<string, unknown> = isRecord(wedding.couple) ? wedding.couple : {};
  const tradition: Record<string, unknown> = isRecord(wedding.tradition) ? wedding.tradition : {};
  const planning: Record<string, unknown> = isRecord(wedding.planning) ? wedding.planning : {};
  const saved = workspace as Partial<WeddingWorkspace>;
  const preferenceDefaults: ReminderPreferences = {
    enabled: true,
    eventLeadDays: 14,
    taskLeadDays: 7,
    milestoneLeadDays: 14,
    vendorLeadDays: 7,
    rsvpFollowUpDays: 7,
    quietHoursEnabled: false,
    invitationSignature: "With warm regards, the wedding family",
    rsvpText: "Please let us know if you can join us.",
    invitationMessageEn: "",
    invitationMessageMr: "",
  };
  const preferences: Record<string, unknown> = isRecord(saved.reminderPreferences) ? saved.reminderPreferences : {};

  return {
    ...workspace,
    wedding: {
      id: typeof wedding.id === "string" ? wedding.id : "new-wedding",
      couple: {
        groomName: typeof couple.groomName === "string" ? couple.groomName : "",
        brideName: typeof couple.brideName === "string" ? couple.brideName : "",
        weddingDate: typeof couple.weddingDate === "string" ? couple.weddingDate : "",
        weddingTime: typeof couple.weddingTime === "string" ? couple.weddingTime : "",
        weddingVenue: typeof couple.weddingVenue === "string" ? couple.weddingVenue : "",
        city: typeof couple.city === "string" ? couple.city : "",
        ...(typeof couple.couplePhotoUrl === "string" ? { couplePhotoUrl: couple.couplePhotoUrl } : {}),
        ...(typeof couple.hashtag === "string" ? { hashtag: couple.hashtag } : {}),
      },
      tradition: {
        region: typeof tradition.region === "string" ? tradition.region : "",
        familyTradition:
          typeof tradition.familyTradition === "string" ? tradition.familyTradition as Wedding["tradition"]["familyTradition"] : "custom",
        language: typeof tradition.language === "string" ? tradition.language : "",
        foodPreference:
          typeof tradition.foodPreference === "string" ? tradition.foodPreference as Wedding["tradition"]["foodPreference"] : "vegetarian",
        ...(typeof tradition.communityNote === "string" ? { communityNote: tradition.communityNote } : {}),
        ...(typeof tradition.brideFamilyCustoms === "string" ? { brideFamilyCustoms: tradition.brideFamilyCustoms } : {}),
        ...(typeof tradition.groomFamilyCustoms === "string" ? { groomFamilyCustoms: tradition.groomFamilyCustoms } : {}),
      },
      planning: {
        currency: "INR",
        totalBudget: typeof planning.totalBudget === "number" ? planning.totalBudget : 0,
        expectedGuestCount: typeof planning.expectedGuestCount === "number" ? planning.expectedGuestCount : 0,
        planningStartDate:
          typeof planning.planningStartDate === "string" ? planning.planningStartDate : now.slice(0, 10),
        ...(typeof planning.engagementDate === "string" ? { engagementDate: planning.engagementDate } : {}),
      },
      events: Array.isArray(wedding.events) ? wedding.events : [],
      family: Array.isArray(wedding.family) ? wedding.family : [],
      onboardingComplete: wedding.onboardingComplete === true,
      uiLanguage: wedding.uiLanguage === "mr" ? "mr" : "en",
      createdAt: typeof wedding.createdAt === "string" ? wedding.createdAt : now,
      updatedAt: typeof wedding.updatedAt === "string" ? wedding.updatedAt : now,
    },
    tasks: Array.isArray(workspace.tasks) ? workspace.tasks : [],
    budget: Array.isArray(workspace.budget) ? workspace.budget : [],
    guests: Array.isArray(workspace.guests) ? workspace.guests.map(normalizeGuest) : [],
    vendors: Array.isArray(workspace.vendors) ? workspace.vendors : [],
    shopping: Array.isArray(workspace.shopping) ? workspace.shopping : [],
    milestones: Array.isArray(workspace.milestones) ? workspace.milestones : [],
    plannerItems: Array.isArray(workspace.plannerItems) ? workspace.plannerItems : [],
    invitations: Array.isArray(saved.invitations) ? saved.invitations : [],
    notificationStates: Array.isArray(saved.notificationStates) ? saved.notificationStates : [],
    reminderPreferences: {
      enabled: typeof preferences.enabled === "boolean" ? preferences.enabled : preferenceDefaults.enabled,
      eventLeadDays: typeof preferences.eventLeadDays === "number" ? preferences.eventLeadDays : preferenceDefaults.eventLeadDays,
      taskLeadDays: typeof preferences.taskLeadDays === "number" ? preferences.taskLeadDays : preferenceDefaults.taskLeadDays,
      milestoneLeadDays: typeof preferences.milestoneLeadDays === "number" ? preferences.milestoneLeadDays : preferenceDefaults.milestoneLeadDays,
      vendorLeadDays: typeof preferences.vendorLeadDays === "number" ? preferences.vendorLeadDays : preferenceDefaults.vendorLeadDays,
      rsvpFollowUpDays: typeof preferences.rsvpFollowUpDays === "number" ? preferences.rsvpFollowUpDays : preferenceDefaults.rsvpFollowUpDays,
      quietHoursEnabled: typeof preferences.quietHoursEnabled === "boolean" ? preferences.quietHoursEnabled : preferenceDefaults.quietHoursEnabled,
      invitationSignature: typeof preferences.invitationSignature === "string" ? preferences.invitationSignature : preferenceDefaults.invitationSignature,
      rsvpText: typeof preferences.rsvpText === "string" ? preferences.rsvpText : preferenceDefaults.rsvpText,
      invitationMessageEn: typeof preferences.invitationMessageEn === "string" ? preferences.invitationMessageEn : "",
      invitationMessageMr: typeof preferences.invitationMessageMr === "string" ? preferences.invitationMessageMr : "",
    },
    activity: Array.isArray(saved.activity) ? saved.activity : [],
  };
}

export class LocalStorageAdapter implements StorageAdapter {
  async saveWedding(workspace: WeddingWorkspace): Promise<void> {
    const payload: WeddingWorkspace = {
      ...normalizeWorkspace(workspace),
      wedding: { ...workspace.wedding, updatedAt: new Date().toISOString() },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  async loadWedding(): Promise<WeddingWorkspace | null> {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (isLegacySampleWorkspace(parsed)) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return isValidWorkspace(parsed) ? normalizeWorkspace(parsed) : null;
    } catch {
      return null;
    }
  }

  async exportWedding(): Promise<string> {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("No wedding data to export yet.");
    // Pretty-print so the exported backup is human-readable.
    return JSON.stringify(JSON.parse(raw), null, 2);
  }

  async importWedding(json: string): Promise<WeddingWorkspace> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error("That file isn't valid JSON. Export a fresh backup and try again.");
    }
    if (isLegacySampleWorkspace(parsed)) {
      throw new Error("Sample-data backups are no longer supported. Import a backup containing your real wedding data.");
    }
    if (!isValidWorkspace(parsed)) {
      throw new Error("That file doesn't look like a wedding planner backup.");
    }
    const normalized = normalizeWorkspace(parsed);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  async clearWedding(): Promise<void> {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
