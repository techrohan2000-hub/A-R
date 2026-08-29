import { FirebaseAdapter } from "./firebaseAdapter";
import type { StorageAdapter } from "./StorageAdapter";

// Single place to swap the backend — everything else in the app imports
// `storage` from here and never touches the adapter class directly.
// Now backed by Firestore so edits made by one user sync live to everyone
// else using the app.
export const storage: StorageAdapter = new FirebaseAdapter();

export type { StorageAdapter };
