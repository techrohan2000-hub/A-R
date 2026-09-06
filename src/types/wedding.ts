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
  time?: string;
  venue?: string;
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

export type AppLanguage = "en" | "mr";

export interface Wedding {
  id: string;
  couple: Couple;
  tradition: TraditionSetup;
  planning: PlanningPreferences;
  events: WeddingEventSummary[];
  family: FamilyMember[];
  onboardingComplete: boolean;
  uiLanguage?: AppLanguage;
  createdAt: string;
  updatedAt: string;
}

export type Priority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "not-started" | "in-progress" | "waiting" | "completed" | "cancelled";

// Lightweight task shape used by the dashboard and task module.
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
  id: string;
  category: string;
  estimated: number;
  paid: number;
}

export type GuestMealPreference = "veg";

export interface GuestSummary {
  id: string;
  name: string;
  side: FamilySide;
  phone?: string;
  email?: string;
  rsvp: "not-contacted" | "invited" | "maybe" | "confirmed" | "declined";
  accommodationRequired: boolean;
  relation?: string;
  partySize?: number;
  mealPreference?: GuestMealPreference;
  outstation?: boolean;
  notes?: string;
}

export type InvitationLanguage = AppLanguage;
export type InvitationStyle = "warm" | "traditional" | "festive" | "poetic";

export type InvitationChannel = "whatsapp" | "email" | "sms";
export type InvitationStatus = "draft" | "opened" | "sent";

export interface InvitationRecord {
  id: string;
  guestId: string;
  eventId: string;
  channel: InvitationChannel;
  message: string;
  status: InvitationStatus;
  createdAt: string;
  openedAt?: string;
  sentAt?: string;
}

export interface ReminderPreferences {
  enabled: boolean;
  eventLeadDays: number;
  taskLeadDays: number;
  milestoneLeadDays: number;
  vendorLeadDays: number;
  rsvpFollowUpDays: number;
  quietHoursEnabled: boolean;
  invitationSignature: string;
  rsvpText: string;
  invitationMessageEn: string;
  invitationMessageMr: string;
}

export interface NotificationState {
  id: string;
  readAt?: string;
  dismissedAt?: string;
  snoozedUntil?: string;
}

export interface ActivityRecord {
  id: string;
  type: "invitation" | "notification" | "settings";
  message: string;
  createdAt: string;
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

export interface TimelineMilestone {
  id: string;
  title: string;
  date: string; // ISO date
  notes?: string;
  completed: boolean;
}

export interface PlannerItem {
  id: string;
  section: string;
  title: string;
  category: string;
  contact: string;
  date: string;
  status: string;
  amount: number;
  notes: string;
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
  milestones: TimelineMilestone[];
  plannerItems: PlannerItem[];
  invitations: InvitationRecord[];
  notificationStates: NotificationState[];
  reminderPreferences: ReminderPreferences;
  activity: ActivityRecord[];
}
