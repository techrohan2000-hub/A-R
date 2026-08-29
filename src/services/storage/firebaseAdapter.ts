import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import type { WeddingWorkspace } from "../../types/wedding";
import type { StorageAdapter } from "./StorageAdapter";
import { isValidWorkspace, LocalStorageAdapter, normalizeWorkspace } from "./localStorageAdapter";

// Everyone who opens the app shares this single document. There's no login
// system yet, so this is intentionally a single shared workspace rather than
// per-user documents — that's what makes "one user updates, everyone else
// sees it" work with zero extra setup.
const WEDDING_DOC_PATH = "weddings/shared";
const FIREBASE_LOAD_TIMEOUT_MS = 5_000;

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error("Firebase request timed out")),
      milliseconds
    );
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export class FirebaseAdapter implements StorageAdapter {
  private local = new LocalStorageAdapter();
  private docRef = db ? doc(db, WEDDING_DOC_PATH) : null;

  async saveWedding(workspace: WeddingWorkspace): Promise<void> {
    const payload: WeddingWorkspace = {
      ...normalizeWorkspace(workspace),
      wedding: { ...workspace.wedding, updatedAt: new Date().toISOString() },
    };

    // Local-first persistence keeps the UI usable offline and prevents a
    // Firebase configuration/permissions problem from losing the user's edit.
    await this.local.saveWedding(payload);
    if (!this.docRef) return;

    // Do not make form actions wait for a network acknowledgement. Firestore
    // queues writes in order; the local cache remains the immediate source of
    // truth while this request is pending.
    void setDoc(this.docRef, payload).catch((error) => {
      console.error("Wedding data was saved locally but could not sync to Firebase:", error);
    });
  }

  async loadWedding(): Promise<WeddingWorkspace | null> {
    const cached = await this.local.loadWedding();
    if (!this.docRef) return cached;

    try {
      const snap = await withTimeout(getDoc(this.docRef), FIREBASE_LOAD_TIMEOUT_MS);
      if (snap.exists()) {
        const data = snap.data();
        if (isValidWorkspace(data)) {
          const remote = normalizeWorkspace(data);
          await this.local.saveWedding(remote);
          return remote;
        }
      }

      // Migrate data created before Firebase was enabled instead of replacing
      // it with a new empty shared workspace.
      if (cached) {
        await setDoc(this.docRef, cached);
        return cached;
      }
      return null;
    } catch (error) {
      console.error("Could not load Firebase data; using the local cache:", error);
      return cached;
    }
  }

  async exportWedding(): Promise<string> {
    if (this.docRef) {
      try {
        const snap = await getDoc(this.docRef);
        if (snap.exists() && isValidWorkspace(snap.data())) {
          return JSON.stringify(normalizeWorkspace(snap.data() as WeddingWorkspace), null, 2);
        }
      } catch (error) {
        console.error("Could not export from Firebase; using the local cache:", error);
      }
    }
    return this.local.exportWedding();
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
    await this.local.saveWedding(normalized);
    if (this.docRef) {
      void setDoc(this.docRef, normalized).catch((error) => {
        console.error("Backup imported locally but could not sync to Firebase:", error);
      });
    }
    return normalized;
  }

  async clearWedding(): Promise<void> {
    await this.local.clearWedding();
    if (!this.docRef) return;
    void deleteDoc(this.docRef).catch((error) => {
      console.error("Local data was cleared but Firebase could not be cleared:", error);
    });
  }

  subscribeWedding(onChange: (workspace: WeddingWorkspace | null) => void): () => void {
    if (!this.docRef) return () => undefined;

    const unsubscribe = onSnapshot(
      this.docRef,
      (snap) => {
        if (!snap.exists()) {
          void this.local.clearWedding();
          onChange(null);
          return;
        }
        const data = snap.data();
        if (!isValidWorkspace(data)) {
          onChange(null);
          return;
        }
        const workspace = normalizeWorkspace(data);
        void this.local.saveWedding(workspace);
        onChange(workspace);
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
