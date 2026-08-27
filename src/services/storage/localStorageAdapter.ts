import type { WeddingWorkspace } from "../../types/wedding";
import type { StorageAdapter } from "./StorageAdapter";

const STORAGE_KEY = "wedding-planner:workspace:v1";

function isValidWorkspace(value: unknown): value is WeddingWorkspace {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Boolean(v.wedding && typeof v.wedding === "object");
}

export class LocalStorageAdapter implements StorageAdapter {
  async saveWedding(workspace: WeddingWorkspace): Promise<void> {
    const payload: WeddingWorkspace = {
      ...workspace,
      wedding: { ...workspace.wedding, updatedAt: new Date().toISOString() },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  async loadWedding(): Promise<WeddingWorkspace | null> {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return isValidWorkspace(parsed) ? parsed : null;
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  }

  async clearWedding(): Promise<void> {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
