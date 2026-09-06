import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type {
  ActivityRecord,
  BudgetSummary,
  GuestSummary,
  InvitationRecord,
  NotificationState,
  PlannerItem,
  ReminderPreferences,
  ShoppingSummary,
  TaskSummary,
  TimelineMilestone,
  VendorSummary,
  Wedding,
  WeddingEventSummary,
  WeddingWorkspace,
} from "../types/wedding";
import { storage } from "../services/storage";
import { workspaceHasWeddingData } from "../services/storage/localStorageAdapter";

interface WeddingContextValue {
  workspace: WeddingWorkspace | null;
  isLoading: boolean;
  saveWedding: (wedding: Wedding) => Promise<void>;
  completeOnboarding: (wedding: Wedding) => Promise<void>;
  startFresh: () => Promise<void>;
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

  // Remaining planner modules
  addPlannerItem: (item: Omit<PlannerItem, "id">) => Promise<void>;
  updatePlannerItem: (id: string, item: Omit<PlannerItem, "id">) => Promise<void>;
  deletePlannerItem: (id: string) => Promise<void>;

  // Invitations, reminders and activity
  addInvitation: (invitation: Omit<InvitationRecord, "id" | "createdAt">) => Promise<void>;
  updateNotificationState: (id: string, state: Partial<Omit<NotificationState, "id">>) => Promise<void>;
  saveReminderPreferences: (preferences: ReminderPreferences) => Promise<void>;
}

export const WeddingContext = createContext<WeddingContextValue | undefined>(undefined);

const emptyWedding: Wedding = {
  id: "new-wedding",
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
  uiLanguage: "en",
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
  plannerItems: [],
  invitations: [],
  notificationStates: [],
  reminderPreferences: {
    enabled: true,
    eventLeadDays: 14,
    taskLeadDays: 7,
    milestoneLeadDays: 14,
    vendorLeadDays: 7,
    rsvpFollowUpDays: 7,
    quietHoursEnabled: false,
    invitationSignature: "With warm regards, the wedding family",
    rsvpText: "Please let us know if you can join us.",
    invitationMessageEn: "",
    invitationMessageMr: "",
  },
  activity: [],
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WeddingWorkspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const workspaceRef = useRef<WeddingWorkspace | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const saved = await storage.loadWedding();
        if (cancelled) return;

        const initial = saved ?? emptyWorkspace;
        workspaceRef.current = initial;
        setWorkspace(initial);
        if (cancelled) return;

        // If the adapter supports real-time sync (e.g. Firebase), subscribe so
        // changes made by other users/devices show up here automatically.
        if (storage.subscribeWedding) {
          unsubscribe = storage.subscribeWedding((incoming) => {
            if (cancelled) return;
            if (!incoming || !workspaceHasWeddingData(incoming)) {
              if (workspaceHasWeddingData(workspaceRef.current)) return;
              workspaceRef.current = emptyWorkspace;
              setWorkspace(emptyWorkspace);
              return;
            }
            workspaceRef.current = incoming;
            setWorkspace(incoming);
          });
        }
      } catch (error) {
        // Storage failures should never leave every route rendering `null`.
        console.error("Wedding workspace initialization failed:", error);
        if (!cancelled) {
          workspaceRef.current = emptyWorkspace;
          setWorkspace(emptyWorkspace);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const persist = useCallback(async (next: WeddingWorkspace) => {
    workspaceRef.current = next;
    setWorkspace(next);
    await storage.saveWedding(next);
  }, []);

  // Keep mutations outside React's state updater. Updaters can run more than
  // once in Strict Mode, so persistence inside one can duplicate writes and
  // the old implementation returned before the write had actually finished.
  const withWorkspace = useCallback(
    async (mutate: (ws: WeddingWorkspace) => WeddingWorkspace) => {
      const next = mutate(workspaceRef.current ?? emptyWorkspace);
      workspaceRef.current = next;
      setWorkspace(next);
      await storage.saveWedding(next);
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
        wedding: { ...wedding, onboardingComplete: true },
      }));
    },
    [withWorkspace]
  );

  const startFresh = useCallback(async () => {
    await persist(emptyWorkspace);
  }, [persist]);

  const exportBackup = useCallback(async () => storage.exportWedding(), []);

  const importBackup = useCallback(async (json: string) => {
    const imported = await storage.importWedding(json);
    workspaceRef.current = imported;
    setWorkspace(imported);
  }, []);

  const resetAllData = useCallback(async () => {
    await storage.clearWedding();
    await storage.saveWedding(emptyWorkspace);
    workspaceRef.current = emptyWorkspace;
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

  // ---- Invitations, outfits, jewellery, food, venue, decoration,
  // photography, travel, gifts, documents, wedding day, family and notes ----
  const addPlannerItem = useCallback(
    async (item: Omit<PlannerItem, "id">) => {
      await withWorkspace((ws) => ({
        ...ws,
        plannerItems: [...ws.plannerItems, { ...item, id: makeId(item.section) }],
      }));
    },
    [withWorkspace]
  );
  const updatePlannerItem = useCallback(
    async (id: string, item: Omit<PlannerItem, "id">) => {
      await withWorkspace((ws) => ({
        ...ws,
        plannerItems: ws.plannerItems.map((entry) => (entry.id === id ? { ...item, id } : entry)),
      }));
    },
    [withWorkspace]
  );
  const deletePlannerItem = useCallback(
    async (id: string) => {
      await withWorkspace((ws) => ({
        ...ws,
        plannerItems: ws.plannerItems.filter((entry) => entry.id !== id),
      }));
    },
    [withWorkspace]
  );

  const addInvitation = useCallback(
    async (invitation: Omit<InvitationRecord, "id" | "createdAt">) => {
      const now = new Date().toISOString();
      await withWorkspace((ws) => {
        const guest = ws.guests.find((entry) => entry.id === invitation.guestId);
        const activity: ActivityRecord = {
          id: makeId("activity"),
          type: "invitation",
          message: `${invitation.status === "sent" ? "Sent" : "Opened"} ${invitation.channel} invitation for ${guest?.name ?? "guest"}`,
          createdAt: now,
        };
        return {
          ...ws,
          invitations: [...ws.invitations, { ...invitation, id: makeId("invitation"), createdAt: now }],
          guests: invitation.status === "sent"
            ? ws.guests.map((entry) => entry.id === invitation.guestId && entry.rsvp === "not-contacted"
              ? { ...entry, rsvp: "invited" as const }
              : entry)
            : ws.guests,
          activity: [activity, ...ws.activity].slice(0, 100),
        };
      });
    },
    [withWorkspace]
  );

  const updateNotificationState = useCallback(
    async (id: string, state: Partial<Omit<NotificationState, "id">>) => {
      await withWorkspace((ws) => {
        const existing = ws.notificationStates.find((entry) => entry.id === id);
        const next = existing
          ? ws.notificationStates.map((entry) => entry.id === id ? { ...entry, ...state } : entry)
          : [...ws.notificationStates, { id, ...state }];
        return { ...ws, notificationStates: next };
      });
    },
    [withWorkspace]
  );

  const saveReminderPreferences = useCallback(
    async (preferences: ReminderPreferences) => {
      await withWorkspace((ws) => ({
        ...ws,
        reminderPreferences: preferences,
        activity: [{
          id: makeId("activity"),
          type: "settings" as const,
          message: "Updated reminder and invitation settings",
          createdAt: new Date().toISOString(),
        }, ...ws.activity].slice(0, 100),
      }));
    },
    [withWorkspace]
  );

  const value: WeddingContextValue = {
    workspace,
    isLoading,
    saveWedding,
    completeOnboarding,
    startFresh,
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
    addPlannerItem,
    updatePlannerItem,
    deletePlannerItem,
    addInvitation,
    updateNotificationState,
    saveReminderPreferences,
  };

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
}
