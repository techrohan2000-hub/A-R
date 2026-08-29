import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// These come from Vite env vars (VITE_ prefix required) so the same code
// works locally (.env.local) and in the GitHub Actions build (repo secrets).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export const isFirebaseConfigured = requiredConfig.every(
  (value): value is string => typeof value === "string" && value.trim().length > 0
);

// A missing deployment secret must not prevent the rest of the application
// from starting. The storage adapter falls back to its local cache until all
// required Firebase values are available.
export const db: Firestore | null = isFirebaseConfigured
  ? getFirestore(getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;
