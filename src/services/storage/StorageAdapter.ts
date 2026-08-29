import type { WeddingWorkspace } from "../../types/wedding";

/**
 * Storage is fully abstracted behind this interface so the UI never talks to
 * localStorage or Firestore directly. FirebaseAdapter provides local-first
 * persistence and optional real-time cloud synchronization.
 */
export interface StorageAdapter {
  saveWedding(workspace: WeddingWorkspace): Promise<void>;
  loadWedding(): Promise<WeddingWorkspace | null>;
  exportWedding(): Promise<string>; // returns a JSON string
  importWedding(json: string): Promise<WeddingWorkspace>;
  clearWedding(): Promise<void>;
  subscribeWedding?: (onChange: (workspace: WeddingWorkspace | null) => void) => () => void;
}
