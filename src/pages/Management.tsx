import { Activity, CalendarClock, CircleDollarSign, MailCheck, Store, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/common/Card";
import { useWedding } from "../hooks/useWedding";
import { formatINR } from "../utils/formatters";

export function Management() {
  const { workspace } = useWedding();
  const navigate = useNavigate();
  if (!workspace) return null;

  const today = new Date().toISOString().slice(0, 10);
  const overdueTasks = workspace.tasks.filter((task) => task.dueDate < today && !["completed", "cancelled"].includes(task.status));
  const upcomingEvents = workspace.wedding.events.filter((event) => event.enabled && event.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const sentGuests = new Set(workspace.invitations.filter((entry) => entry.status === "sent").map((entry) => entry.guestId));
  const awaitingRsvp = workspace.guests.filter((guest) => ["invited", "maybe"].includes(guest.rsvp));
  const budgetEstimated = workspace.budget.reduce((sum, item) => sum + item.estimated, 0);
  const budgetPaid = workspace.budget.reduce((sum, item) => sum + item.paid, 0);
  const vendorDue = workspace.vendors.reduce((sum, vendor) => sum + Math.max(0, vendor.totalAmount - vendor.paidAmount), 0);

  const cards = [
    { label: "Overdue tasks", value: overdueTasks.length.toString(), detail: overdueTasks[0]?.title || "Nothing overdue", icon: CalendarClock, path: "/tasks" },
    { label: "Invitations sent", value: `${sentGuests.size}/${workspace.guests.length}`, detail: `${awaitingRsvp.length} awaiting RSVP`, icon: MailCheck, path: "/invitations" },
    { label: "Guest responses", value: workspace.guests.filter((guest) => guest.rsvp === "confirmed").length.toString(), detail: "Confirmed guests/groups", icon: Users, path: "/guests" },
    { label: "Vendor balance", value: formatINR(vendorDue), detail: `${workspace.vendors.filter((vendor) => vendor.paidAmount < vendor.totalAmount).length} vendors unpaid`, icon: Store, path: "/vendors" },
    { label: "Budget paid", value: formatINR(budgetPaid), detail: `of ${formatINR(budgetEstimated)} planned`, icon: CircleDollarSign, path: "/budget" },
    { label: "Next event", value: upcomingEvents[0]?.name || "None", detail: upcomingEvents[0]?.date || "Add an event", icon: Activity, path: "/events-rituals" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gold-soft/70 bg-gradient-to-br from-white via-cream-soft to-peach/35 p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Shared command center</p>
        <h2 className="mt-1 text-xl text-maroon-deep sm:text-2xl">Site management</h2>
        <p className="mt-2 text-sm text-charcoal-soft">Review what needs attention across planning, guests, invitations, vendors, and budget.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={() => navigate(item.path)} className="text-left">
              <Card className="h-full transition hover:-translate-y-0.5 hover:border-gold-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-soft">{item.label}</p>
                    <p className="mt-2 font-data text-2xl font-semibold text-maroon-deep">{item.value}</p>
                    <p className="mt-1 text-xs text-charcoal-soft">{item.detail}</p>
                  </div>
                  <span className="rounded-xl bg-peach/40 p-2.5 text-maroon"><Icon size={19} /></span>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-lg text-maroon-deep">Needs attention</h3>
          <div className="space-y-2">
            {overdueTasks.slice(0, 5).map((task) => (
              <button key={task.id} onClick={() => navigate("/tasks")} className="block w-full rounded-xl bg-red-50 p-3 text-left">
                <span className="block text-sm font-medium text-red-900">{task.title}</span>
                <span className="text-xs text-red-700">Due {task.dueDate} · {task.responsible}</span>
              </button>
            ))}
            {!overdueTasks.length && <p className="py-6 text-center text-sm text-charcoal-soft">No overdue tasks.</p>}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-lg text-maroon-deep">Recent activity</h3>
          <div className="space-y-3">
            {workspace.activity.slice(0, 8).map((entry) => (
              <div key={entry.id} className="border-b border-beige/70 pb-3 last:border-0">
                <p className="text-sm text-charcoal">{entry.message}</p>
                <p className="mt-0.5 text-xs text-charcoal-soft">{new Date(entry.createdAt).toLocaleString("en-IN")}</p>
              </div>
            ))}
            {!workspace.activity.length && <p className="py-6 text-center text-sm text-charcoal-soft">Activity appears after invitations and settings changes.</p>}
          </div>
        </Card>
      </div>

      <Card className="border-[#e3c7c7] bg-[#fdf5f5]">
        <p className="text-sm text-charcoal-soft"><strong className="text-maroon-deep">Shared access:</strong> this management page has no login or roles. Anyone who can access the shared workspace can view and change its data.</p>
      </Card>
    </div>
  );
}
