import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import type { WeddingWorkspace } from "../../types/wedding";
import type { StorageAdapter } from "./StorageAdapter";

// Everyone who opens the app shares this single document. There's no login
// system yet, so this is intentionally a single shared workspace rather than
// per-user documents — that's what makes "one user updates, everyone else
// sees it" work with zero extra setup.
const WEDDING_DOC_PATH = "weddings/shared";

function isValidWorkspace(value: unknown): value is WeddingWorkspace {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Boolean(v.wedding && typeof v.wedding === "object");
}

function normalizeWorkspace(workspace: WeddingWorkspace): WeddingWorkspace {
  return {
    ...workspace,
    tasks: Array.isArray(workspace.tasks) ? workspace.tasks : [],
    budget: Array.isArray(workspace.budget) ? workspace.budget : [],
    guests: Array.isArray(workspace.guests) ? workspace.guests : [],
    vendors: Array.isArray(workspace.vendors) ? workspace.vendors : [],
    shopping: Array.isArray(workspace.shopping) ? workspace.shopping : [],
    milestones: Array.isArray(workspace.milestones) ? workspace.milestones : [],
  };
}

export class FirebaseAdapter implements StorageAdapter {
  private docRef = doc(db, WEDDING_DOC_PATH);

  async saveWedding(workspace: WeddingWorkspace): Promise<void> {
    const payload: WeddingWorkspace = {
      ...normalizeWorkspace(workspace),
      wedding: { ...workspace.wedding, updatedAt: new Date().toISOString() },
    };
    // merge: true so concurrent writes to different fields don't clobber
    // each other if two people save at nearly the same moment.
    await setDoc(this.docRef, payload, { merge: false });
  }

  async loadWedding(): Promise<WeddingWorkspace | null> {
    const snap = await getDoc(this.docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return isValidWorkspace(data) ? normalizeWorkspace(data) : null;
  }

  async exportWedding(): Promise<string> {
    const snap = await getDoc(this.docRef);
    if (!snap.exists()) throw new Error("No wedding data to export yet.");
    return JSON.stringify(snap.data(), null, 2);
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
    await setDoc(this.docRef, normalized);
    return normalized;
  }

  async clearWedding(): Promise<void> {
    await deleteDoc(this.docRef);
  }

  subscribeWedding(onChange: (workspace: WeddingWorkspace | null) => void): () => void {
    const unsubscribe = onSnapshot(
      this.docRef,
      (snap) => {
        if (!snap.exists()) {
          onChange(null);
          return;
        }
        const data = snap.data();
        onChange(isValidWorkspace(data) ? normalizeWorkspace(data) : null);
      },
      (error) => {
        // Network hiccup / permissions issue — log so it's visible in devtools
        // rather than silently freezing the UI.
        console.error("Wedding data sync error:", error);
      }
    );
    return unsubscribe;
  }
}
