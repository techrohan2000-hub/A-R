import { LocalStorageAdapter } from "./localStorageAdapter";
import type { StorageAdapter } from "./StorageAdapter";

// Single place to swap in a future backend (Firebase/Supabase) — everything
// else in the app imports `storage` from here and never touches the adapter
// class directly.
export const storage: StorageAdapter = new LocalStorageAdapter();

export type { StorageAdapter };
