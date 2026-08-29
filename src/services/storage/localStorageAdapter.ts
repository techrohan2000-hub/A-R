import type { Wedding, WeddingWorkspace } from "../../types/wedding";
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

export function normalizeWorkspace(workspace: WeddingWorkspace): WeddingWorkspace {
  const now = new Date().toISOString();
  const wedding = workspace.wedding as Partial<Wedding>;
  const couple: Record<string, unknown> = isRecord(wedding.couple) ? wedding.couple : {};
  const tradition: Record<string, unknown> = isRecord(wedding.tradition) ? wedding.tradition : {};
  const planning: Record<string, unknown> = isRecord(wedding.planning) ? wedding.planning : {};

  return {
    ...workspace,
    wedding: {
      ...wedding,
      id: typeof wedding.id === "string" ? wedding.id : "new-wedding",
      isSampleData: wedding.isSampleData === true,
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
      createdAt: typeof wedding.createdAt === "string" ? wedding.createdAt : now,
      updatedAt: typeof wedding.updatedAt === "string" ? wedding.updatedAt : now,
    },
    tasks: Array.isArray(workspace.tasks) ? workspace.tasks : [],
    budget: Array.isArray(workspace.budget) ? workspace.budget : [],
    guests: Array.isArray(workspace.guests) ? workspace.guests : [],
    vendors: Array.isArray(workspace.vendors) ? workspace.vendors : [],
    shopping: Array.isArray(workspace.shopping) ? workspace.shopping : [],
    milestones: Array.isArray(workspace.milestones) ? workspace.milestones : [],
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
