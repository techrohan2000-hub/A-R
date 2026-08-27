// Core data model for the wedding planner.
// Phase 1 defines the shapes needed for setup, dashboard and navigation.
// Later phases will extend this file with Task, Guest, ShoppingItem, Vendor, etc.

export type FamilySide = "bride" | "groom" | "both";

export type Tradition =
  | "maharashtrian"
  | "tamil-iyer"
  | "tamil-iyengar"
  | "telugu"
  | "kannada"
  | "north-indian"
  | "bengali"
  | "gujarati"
  | "konkani"
  | "custom";

export type FoodPreference = "vegetarian" | "non-vegetarian" | "mixed";

export interface Couple {
  groomName: string;
  brideName: string;
  couplePhotoUrl?: string;
  weddingDate: string; // ISO date, e.g. "2026-11-15"
  weddingTime: string; // "08:30"
  weddingVenue: string;
  city: string;
  hashtag?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string; // e.g. "Father", "Grandmother", "Cousin"
  side: FamilySide;
  phone?: string;
  email?: string;
  isCoordinator?: boolean;
  notes?: string;
}

export interface WeddingEventSummary {
  id: string;
  name: string;
  date: string; // ISO date
  enabled: boolean;
  isCustom?: boolean;
}

export interface TraditionSetup {
  region: string;
  familyTradition: Tradition;
  communityNote?: string;
  brideFamilyCustoms?: string;
  groomFamilyCustoms?: string;
  language: string;
  foodPreference: FoodPreference;
}

export interface PlanningPreferences {
  currency: "INR";
  totalBudget: number;
  expectedGuestCount: number;
  planningStartDate: string; // ISO date
  engagementDate?: string;
}

export interface Wedding {
  id: string;
  isSampleData: boolean;
  couple: Couple;
  tradition: TraditionSetup;
  planning: PlanningPreferences;
  events: WeddingEventSummary[];
  family: FamilyMember[];
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Priority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "not-started" | "in-progress" | "waiting" | "completed" | "cancelled";

// Lightweight task shape used to compute Phase-1 dashboard stats from sample data.
// The full Task Management module (Phase 2) will expand this.
export interface TaskSummary {
  id: string;
  title: string;
  category: string;
  responsible: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
}

export interface BudgetSummary {
  category: string;
  estimated: number;
  paid: number;
}

export interface GuestSummary {
  id: string;
  name: string;
  side: FamilySide;
  rsvp: "not-contacted" | "invited" | "maybe" | "confirmed" | "declined";
  accommodationRequired: boolean;
}

export interface VendorSummary {
  id: string;
  name: string;
  category: string;
  status:
    | "researching"
    | "contacted"
    | "quote-received"
    | "negotiating"
    | "shortlisted"
    | "booked"
    | "completed"
    | "cancelled";
  totalAmount: number;
  paidAmount: number;
  dueDate?: string;
}

export interface ShoppingSummary {
  id: string;
  item: string;
  forWhom: string;
  purchased: boolean;
  packed: boolean;
}

// Bundle of Phase-1 sample records, kept separate from the core Wedding record
// so future phases can persist each domain independently.
export interface WeddingWorkspace {
  wedding: Wedding;
  tasks: TaskSummary[];
  budget: BudgetSummary[];
  guests: GuestSummary[];
  vendors: VendorSummary[];
  shopping: ShoppingSummary[];
}
