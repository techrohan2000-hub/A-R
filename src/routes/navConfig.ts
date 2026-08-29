import {
  LayoutDashboard,
  GanttChartSquare,
  Flame,
  ListChecks,
  Users,
  ShoppingBag,
  Store,
  Wallet,
  Mail,
  Shirt,
  Gem,
  UtensilsCrossed,
  Building2,
  Sparkles,
  Camera,
  Plane,
  Gift,
  FileText,
  PartyPopper,
  Users2,
  StickyNote,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  // Phase remains useful for grouping the original delivery roadmap.
  phase: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

// Bottom nav (mobile) shows only the first 5 — the rest live behind "More".
export const primaryMobileCount = 5;

export const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, phase: 1 },
  { path: "/timeline", label: "Timeline", icon: GanttChartSquare, phase: 2 },
  { path: "/events-rituals", label: "Events & Rituals", icon: Flame, phase: 2 },
  { path: "/tasks", label: "Tasks", icon: ListChecks, phase: 2 },
  { path: "/guests", label: "Guests", icon: Users, phase: 3 },
  { path: "/shopping", label: "Shopping", icon: ShoppingBag, phase: 4 },
  { path: "/vendors", label: "Vendors", icon: Store, phase: 5 },
  { path: "/budget", label: "Budget", icon: Wallet, phase: 6 },
  { path: "/invitations", label: "Invitations", icon: Mail, phase: 3 },
  { path: "/outfits", label: "Outfits", icon: Shirt, phase: 4 },
  { path: "/jewellery", label: "Jewellery", icon: Gem, phase: 4 },
  { path: "/food", label: "Food", icon: UtensilsCrossed, phase: 5 },
  { path: "/venue", label: "Venue", icon: Building2, phase: 5 },
  { path: "/decoration", label: "Decoration", icon: Sparkles, phase: 5 },
  { path: "/photography", label: "Photography", icon: Camera, phase: 5 },
  { path: "/travel", label: "Travel & Stay", icon: Plane, phase: 3 },
  { path: "/gifts", label: "Gifts", icon: Gift, phase: 4 },
  { path: "/documents", label: "Documents", icon: FileText, phase: 7 },
  { path: "/wedding-day", label: "Wedding Day", icon: PartyPopper, phase: 7 },
  { path: "/family", label: "Family", icon: Users2, phase: 3 },
  { path: "/notes", label: "Notes", icon: StickyNote, phase: 7 },
  { path: "/settings", label: "Settings", icon: Settings, phase: 1 },
];
