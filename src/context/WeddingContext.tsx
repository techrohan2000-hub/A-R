import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type {
  BudgetSummary,
  GuestSummary,
  ShoppingSummary,
  TaskSummary,
  TimelineMilestone,
  VendorSummary,
  Wedding,
  WeddingEventSummary,
  WeddingWorkspace,
} from "../types/wedding";
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

  // Tasks
  addTask: (task: Omit<TaskSummary, "id">) => Promise<void>;
  updateTask: (id: string, task: Omit<TaskSummary, "id">) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Guests
  addGuest: (guest: Omit<GuestSummary, "id">) => Promise<void>;
  updateGuest: (id: string, guest: Omit<GuestSummary, "id">) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;

  // Vendors
  addVendor: (vendor: Omit<VendorSummary, "id">) => Promise<void>;
  updateVendor: (id: string, vendor: Omit<VendorSummary, "id">) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;

  // Shopping
  addShoppingItem: (item: Omit<ShoppingSummary, "id">) => Promise<void>;
  updateShoppingItem: (id: string, item: Omit<ShoppingSummary, "id">) => Promise<void>;
  deleteShoppingItem: (id: string) => Promise<void>;

  // Budget
  addBudgetItem: (item: Omit<BudgetSummary, "id">) => Promise<void>;
  updateBudgetItem: (id: string, item: Omit<BudgetSummary, "id">) => Promise<void>;
  deleteBudgetItem: (id: string) => Promise<void>;

  // Events & Rituals
  addEvent: (event: Omit<WeddingEventSummary, "id">) => Promise<void>;
  updateEvent: (id: string, event: Omit<WeddingEventSummary, "id">) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Timeline
  addMilestone: (milestone: Omit<TimelineMilestone, "id">) => Promise<void>;
  updateMilestone: (id: string, milestone: Omit<TimelineMilestone, "id">) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
}

export const WeddingContext = createContext<WeddingContextValue | undefined>(undefined);

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

const emptyWorkspace: WeddingWorkspace = {
  wedding: emptyWedding,
  tasks: [],
  budget: [],
  guests: [],
  vendors: [],
  shopping: [],
  milestones: [],
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WeddingWorkspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await storage.loadWedding();
      if (saved) {
        setWorkspace(saved);
      } else {
        // Brand-new visitor: start blank. Sample data is opt-in from Settings.
        await storage.saveWedding(emptyWorkspace);
        setWorkspace(emptyWorkspace);
      }
      setIsLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: WeddingWorkspace) => {
    setWorkspace(next);
    await storage.saveWedding(next);
  }, []);

  // Helper to safely mutate the current workspace, falling back to blank if
  // somehow not yet loaded (shouldn't happen once isLoading is false).
  const withWorkspace = useCallback(
    async (mutate: (ws: WeddingWorkspace) => WeddingWorkspace) => {
      setWorkspace((current) => {
        const base = current ?? emptyWorkspace;
        const next = mutate(base);
        storage.saveWedding(next);
        return next;
      });
    },
    []
  );

  const saveWedding = useCallback(
    async (wedding: Wedding) => {
      await withWorkspace((ws) => ({ ...ws, wedding }));
    },
    [withWorkspace]
  );

  const completeOnboarding = useCallback(
    async (wedding: Wedding) => {
      await withWorkspace((ws) => ({
        ...ws,
        wedding: { ...wedding, isSampleData: false, onboardingComplete: true },
      }));
    },
    [withWorkspace]
  );

  const startFresh = useCallback(async () => {
    await persist(emptyWorkspace);
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
    await storage.saveWedding(emptyWorkspace);
    setWorkspace(emptyWorkspace);
  }, []);

  // ---- Tasks ----
  const addTask = useCallback(
    async (task: Omit<TaskSummary, "id">) => {
      await withWorkspace((ws) => ({ ...ws, tasks: [...ws.tasks, { ...task, id: makeId("task") }] }));
    },
    [withWorkspace]
  );
  const updateTask = useCallback(
    async (id: string, task: Omit<TaskSummary, "id">) => {
      await withWorkspace((ws) => ({
        ...ws,
        tasks: ws.tasks.map((t) => (t.id === id ? { ...task, id } : t)),
      }));
    },
    [withWorkspace]
  );
  const deleteTask = useCallback(
    async (id: string) => {
      await withWorkspace((ws) => ({ ...ws, tasks: ws.tasks.filter((t) => t.id !== id) }));
    },
    [withWorkspace]
  );

  // ---- Guests ----
  const addGuest = useCallback(
    async (guest: Omit<GuestSummary, "id">) => {
      await withWorkspace((ws) => ({ ...ws, guests: [...ws.guests, { ...guest, id: makeId("guest") }] }));
    },
    [withWorkspace]
  );
  const updateGuest = useCallback(
    async (id: string, guest: Omit<GuestSummary, "id">) => {
      await withWorkspace((ws) => ({
        ...ws,
        guests: ws.guests.map((g) => (g.id === id ? { ...guest, id } : g)),
      }));
    },
    [withWorkspace]
  );
  const deleteGuest = useCallback(
    async (id: string) => {
      await withWorkspace((ws) => ({ ...ws, guests: ws.guests.filter((g) => g.id !== id) }));
    },
    [withWorkspace]
  );

  // ---- Vendors ----
  const addVendor = useCallback(
    async (vendor: Omit<VendorSummary, "id">) => {
      await withWorkspace((ws) => ({ ...ws, vendors: [...ws.vendors, { ...vendor, id: makeId("vendor") }] }));
    },
    [withWorkspace]
  );
  const updateVendor = useCallback(
    async (id: string, vendor: Omit<VendorSummary, "id">) => {
      await withWorkspace((ws) => ({
        ...ws,
        vendors: ws.vendors.map((v) => (v.id === id ? { ...vendor, id } : v)),
      }));
    },
    [withWorkspace]
  );
  const deleteVendor = useCallback(
    async (id: string) => {
      await withWorkspace((ws) => ({ ...ws, vendors: ws.vendors.filter((v) => v.id !== id) }));
    },
    [withWorkspace]
  );

  // ---- Shopping ----
  const addShoppingItem = useCallback(
    async (item: Omit<ShoppingSummary, "id">) => {
      await withWorkspace((ws) => ({ ...ws, shopping: [...ws.shopping, { ...item, id: makeId("shop") }] }));
    },
    [withWorkspace]
  );
  const updateShoppingItem = useCallback(
    async (id: string, item: Omit<ShoppingSummary, "id">) => {
      await withWorkspace((ws) => ({
        ...ws,
        shopping: ws.shopping.map((s) => (s.id === id ? { ...item, id } : s)),
      }));
    },
    [withWorkspace]
  );
  const deleteShoppingItem = useCallback(
    async (id: string) => {
      await withWorkspace((ws) => ({ ...ws, shopping: ws.shopping.filter((s) => s.id !== id) }));
    },
    [withWorkspace]
  );

  // ---- Budget ----
  const addBudgetItem = useCallback(
    async (item: Omit<BudgetSummary, "id">) => {
      await withWorkspace((ws) => ({ ...ws, budget: [...ws.budget, { ...item, id: makeId("budget") }] }));
    },
    [withWorkspace]
  );
  const updateBudgetItem = useCallback(
    async (id: string, item: Omit<BudgetSummary, "id">) => {
      await withWorkspace((ws) => ({
        ...ws,
        budget: ws.budget.map((b) => (b.id === id ? { ...item, id } : b)),
      }));
    },
    [withWorkspace]
  );
  const deleteBudgetItem = useCallback(
    async (id: string) => {
      await withWorkspace((ws) => ({ ...ws, budget: ws.budget.filter((b) => b.id !== id) }));
    },
    [withWorkspace]
  );

  // ---- Events & Rituals ----
  const addEvent = useCallback(
    async (event: Omit<WeddingEventSummary, "id">) => {
      await withWorkspace((ws) => ({
        ...ws,
        wedding: { ...ws.wedding, events: [...ws.wedding.events, { ...event, id: makeId("event") }] },
      }));
    },
    [withWorkspace]
  );
  const updateEvent = useCallback(
    async (id: string, event: Omit<WeddingEventSummary, "id">) => {
      await withWorkspace((ws) => ({
        ...ws,
        wedding: {
          ...ws.wedding,
          events: ws.wedding.events.map((e) => (e.id === id ? { ...event, id } : e)),
        },
      }));
    },
    [withWorkspace]
  );
  const deleteEvent = useCallback(
    async (id: string) => {
      await withWorkspace((ws) => ({
        ...ws,
        wedding: { ...ws.wedding, events: ws.wedding.events.filter((e) => e.id !== id) },
      }));
    },
    [withWorkspace]
  );

  // ---- Timeline ----
  const addMilestone = useCallback(
    async (milestone: Omit<TimelineMilestone, "id">) => {
      await withWorkspace((ws) => ({
        ...ws,
        milestones: [...ws.milestones, { ...milestone, id: makeId("milestone") }],
      }));
    },
    [withWorkspace]
  );
  const updateMilestone = useCallback(
    async (id: string, milestone: Omit<TimelineMilestone, "id">) => {
      await withWorkspace((ws) => ({
        ...ws,
        milestones: ws.milestones.map((m) => (m.id === id ? { ...milestone, id } : m)),
      }));
    },
    [withWorkspace]
  );
  const deleteMilestone = useCallback(
    async (id: string) => {
      await withWorkspace((ws) => ({ ...ws, milestones: ws.milestones.filter((m) => m.id !== id) }));
    },
    [withWorkspace]
  );

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
    addTask,
    updateTask,
    deleteTask,
    addGuest,
    updateGuest,
    deleteGuest,
    addVendor,
    updateVendor,
    deleteVendor,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    addEvent,
    updateEvent,
    deleteEvent,
    addMilestone,
    updateMilestone,
    deleteMilestone,
  };

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
}
