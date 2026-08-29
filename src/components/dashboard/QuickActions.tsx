import { ListPlus, UserPlus, Wallet, ShoppingBag, Store, CalendarPlus, Flame, StickyNote, GanttChartSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";

const actions = [
  { label: "Add Task", icon: ListPlus, path: "/tasks" },
  { label: "Add Guest", icon: UserPlus, path: "/guests" },
  { label: "Add Expense", icon: Wallet, path: "/budget" },
  { label: "Add Shopping", icon: ShoppingBag, path: "/shopping" },
  { label: "Add Vendor", icon: Store, path: "/vendors" },
  { label: "Add Event", icon: CalendarPlus, path: "/events-rituals" },
  { label: "Add Milestone", icon: GanttChartSquare, path: "/timeline" },
  { label: "Add Ritual", icon: Flame, path: "/events-rituals" },
  { label: "Add Note", icon: StickyNote, path: "/notes" },
];

export function QuickActions() {
  const navigate = useNavigate();
  return (
    <Card>
      <h2 className="mb-4 text-lg text-maroon-deep">Quick Add</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-2 rounded-xl border border-beige bg-cream-soft/50 px-3 py-4 text-center transition hover:border-gold-soft hover:bg-peach/40"
          >
            <Icon size={20} className="text-maroon" strokeWidth={1.75} />
            <span className="text-xs font-medium text-charcoal-soft">{label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
