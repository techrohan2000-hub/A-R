import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { Wedding, WeddingWorkspace } from "../types/wedding";
import { storage } from "../services/storage";
import { sampleWorkspace } from "../data/sampleWedding";

interface WeddingContextValue {
  workspace: WeddingWorkspace | null;
  isLoading: boolean;
  isSampleData: boolean;
  saveWedding: (wedding: Wedding) => Promise<void>;
  completeOnboarding: (wedding: Wedding) => Promise<void>;
  startFresh: () => Promise<void>;
  loadSampleData: () => Promise<void>;
  exportBackup: () => Promise<string>;
  importBackup: (json: string) => Promise<void>;
  resetAllData: () => Promise<void>;
}

export const WeddingContext = createContext<WeddingContextValue | undefined>(undefined);

function repairSampleWorkspace(saved: WeddingWorkspace): WeddingWorkspace {
  if (!saved.wedding.isSampleData) return saved;

  const savedPhoto = saved.wedding.couple.couplePhotoUrl;
  const samplePhoto = sampleWorkspace.wedding.couple.couplePhotoUrl;
  const needsPhotoRepair =
    !savedPhoto || savedPhoto.includes("/assets/couple/") || savedPhoto.endsWith("rohan-aishwarya.jpg");

  if (!needsPhotoRepair) return saved;

  return {
    ...saved,
    wedding: {
      ...saved.wedding,
      couple: {
        ...saved.wedding.couple,
        couplePhotoUrl: samplePhoto,
      },
    },
  };
}

const emptyWedding: Wedding = {
  id: "new-wedding",
  isSampleData: false,
  couple: {
    groomName: "",
    brideName: "",
    weddingDate: "",
    weddingTime: "",
    weddingVenue: "",
    city: "",
  },
  tradition: {
    region: "",
    familyTradition: "custom",
    language: "",
    foodPreference: "vegetarian",
  },
  planning: {
    currency: "INR",
    totalBudget: 0,
    expectedGuestCount: 0,
    planningStartDate: new Date().toISOString().slice(0, 10),
  },
  events: [],
  family: [],
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WeddingWorkspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await storage.loadWedding();
      if (saved) {
        const repaired = repairSampleWorkspace(saved);
        if (repaired !== saved) {
          await storage.saveWedding(repaired);
        }
        setWorkspace(repaired);
      } else {
        // First-ever visit: show sample data so the app never looks empty.
        await storage.saveWedding(sampleWorkspace);
        setWorkspace(sampleWorkspace);
      }
      setIsLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: WeddingWorkspace) => {
    setWorkspace(next);
    await storage.saveWedding(next);
  }, []);

  const saveWedding = useCallback(
    async (wedding: Wedding) => {
      const base = workspace ?? sampleWorkspace;
      await persist({ ...base, wedding });
    },
    [workspace, persist]
  );

  const completeOnboarding = useCallback(
    async (wedding: Wedding) => {
      const base = workspace ?? sampleWorkspace;
      await persist({
        ...base,
        wedding: { ...wedding, isSampleData: false, onboardingComplete: true },
      });
    },
    [workspace, persist]
  );

  const startFresh = useCallback(async () => {
    await persist({
      wedding: emptyWedding,
      tasks: [],
      budget: [],
      guests: [],
      vendors: [],
      shopping: [],
    });
  }, [persist]);

  const loadSampleData = useCallback(async () => {
    await persist(sampleWorkspace);
  }, [persist]);

  const exportBackup = useCallback(async () => storage.exportWedding(), []);

  const importBackup = useCallback(async (json: string) => {
    const imported = await storage.importWedding(json);
    setWorkspace(imported);
  }, []);

  const resetAllData = useCallback(async () => {
    await storage.clearWedding();
    setWorkspace(null);
    await storage.saveWedding(sampleWorkspace);
    setWorkspace(sampleWorkspace);
  }, []);

  const value: WeddingContextValue = {
    workspace,
    isLoading,
    isSampleData: workspace?.wedding.isSampleData ?? false,
    saveWedding,
    completeOnboarding,
    startFresh,
    loadSampleData,
    exportBackup,
    importBackup,
    resetAllData,
  };

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
}
