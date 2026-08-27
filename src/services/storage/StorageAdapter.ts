import type { WeddingWorkspace } from "../../types/wedding";

/**
 * Storage is fully abstracted behind this interface so the UI never talks to
 * localStorage/IndexedDB directly. Today it's backed by LocalStorageAdapter.
 * A future Firebase/Supabase adapter can implement the same interface without
 * any change to components, pages, or the WeddingContext.
 */
export interface StorageAdapter {
  saveWedding(workspace: WeddingWorkspace): Promise<void>;
  loadWedding(): Promise<WeddingWorkspace | null>;
  exportWedding(): Promise<string>; // returns a JSON string
  importWedding(json: string): Promise<WeddingWorkspace>;
  clearWedding(): Promise<void>;
}
