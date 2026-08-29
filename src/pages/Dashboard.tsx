import { useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  ListChecks,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wallet,
  Users,
  Store,
  ShoppingBag,
  GanttChartSquare,
} from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import { Countdown, type FeaturedEvent } from "../components/dashboard/Countdown";
import { StatCard } from "../components/dashboard/StatCard";
import { QuickActions } from "../components/dashboard/QuickActions";
import { InsightsList } from "../components/dashboard/InsightsList";
import { Card } from "../components/common/Card";
import { formatINR } from "../utils/formatters";
import { daysUntil, dueLabel, formatPrettyDate } from "../utils/dateUtils";

export function Dashboard() {
  const { workspace, isSampleData } = useWedding();

  const stats = useMemo(() => {
    if (!workspace) return null;
    const { tasks, budget, guests, vendors, shopping } = workspace;

    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const overdueTasks = tasks.filter((t) => dueLabel(t.dueDate) === "overdue" && t.status !== "completed").length;
    const pendingTasks = tasks.length - completedTasks;

    const totalBudget = workspace.wedding.planning.totalBudget;
    const spent = budget.reduce((sum, b) => sum + b.paid, 0);
    const remaining = Math.max(totalBudget - spent, 0);
    const pendingPayments = budget.reduce((sum, b) => sum + Math.max(b.estimated - b.paid, 0), 0);

    const confirmedGuests = guests.filter((g) => g.rsvp === "confirmed").length;
    const pendingRsvps = guests.filter((g) => g.rsvp === "invited" || g.rsvp === "not-contacted" || g.rsvp === "maybe").length;

    const vendorsBooked = vendors.filter((v) => v.status === "booked" || v.status === "completed").length;
    const vendorsPending = vendors.length - vendorsBooked;

    const shoppingRemaining = shopping.filter((s) => !s.purchased).length;

    const upcomingEvent = [...workspace.wedding.events]
      .filter((e) => e.enabled && daysUntil(e.date) >= 0)
      .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))[0];

    const upcomingVendorPayment = [...vendors]
      .filter((v) => v.dueDate && daysUntil(v.dueDate) >= 0)
      .sort((a, b) => daysUntil(a.dueDate!) - daysUntil(b.dueDate!))[0];

    return {
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalBudget,
      spent,
      remaining,
      pendingPayments,
      guestCount: guests.length,
      confirmedGuests,
      pendingRsvps,
      vendorsBooked,
      vendorsPending,
      shoppingRemaining,
      upcomingEvent,
      upcomingVendorPayment,
    };
  }, [workspace]);

  const insights = useMemo(() => {
    if (!workspace || !stats) return [];
    const list: string[] = [];

    if (stats.overdueTasks > 0) {
      list.push(`⚠️ ${stats.overdueTasks} task${stats.overdueTasks > 1 ? "s are" : " is"} overdue.`);
    }
    if (stats.pendingPayments > 0) {
      list.push(`💰 ${formatINR(stats.pendingPayments)} in payments are still pending.`);
    }
    if (stats.shoppingRemaining > 0) {
      list.push(`🛍️ ${stats.shoppingRemaining} shopping item${stats.shoppingRemaining > 1 ? "s are" : " is"} still pending.`);
    }
    if (stats.pendingRsvps > 0) {
      list.push(`👨‍👩‍👧‍👦 ${stats.pendingRsvps} guest${stats.pendingRsvps > 1 ? "s haven't" : " hasn't"} responded yet.`);
    }
    if (stats.upcomingVendorPayment) {
      const days = daysUntil(stats.upcomingVendorPayment.dueDate!);
      list.push(
        `📸 ${stats.upcomingVendorPayment.name} payment is due in ${days} day${days === 1 ? "" : "s"}.`
      );
    }
    const guestsNeedingStay = workspace.guests.filter((g) => g.accommodationRequired).length;
    if (guestsNeedingStay > 0) {
      list.push(`🏨 ${guestsNeedingStay} guest${guestsNeedingStay > 1 ? " groups" : ""} still need accommodation.`);
    }

    return list.slice(0, 6);
  }, [workspace, stats]);

  if (!workspace || !stats) return null;

  if (!workspace.wedding.onboardingComplete) {
    return <Navigate to="/setup" replace />;
  }

  const { couple } = workspace.wedding;

  // Countdown priority: a fixed wedding date wins; otherwise the nearest
  // enabled upcoming event (e.g. the engagement) becomes the featured date.
  const featured: FeaturedEvent | null = couple.weddingDate
    ? { label: "Wedding", date: couple.weddingDate, time: couple.weddingTime, venue: couple.weddingVenue, city: couple.city }
    : (() => {
        const next = [...workspace.wedding.events]
          .filter((e) => e.enabled && daysUntil(e.date) >= 0)
          .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))[0];
        return next ? { label: next.name, date: next.date } : null;
      })();

  const upcomingMilestones = [...workspace.milestones]
    .filter((m) => !m.completed && daysUntil(m.date) >= 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {isSampleData && (
        <div className="rounded-xl border border-gold-soft bg-peach/30 px-4 py-2.5 text-sm text-maroon-deep">
          You're viewing <strong>sample demo data</strong> for {couple.groomName} &amp; {couple.brideName}. Head to{" "}
          <span className="font-medium underline">Settings</span> to start fresh with your own wedding.
        </div>
      )}

      <Countdown
        featured={featured}
        groomName={couple.groomName}
        brideName={couple.brideName}
        photoUrl={couple.couplePhotoUrl}
      />

      {upcomingMilestones.length > 0 && (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {upcomingMilestones.map((m) => {
            const days = daysUntil(m.date);
            return (
              <Link
                key={m.id}
                to="/timeline"
                className="flex shrink-0 items-center gap-3 rounded-2xl border border-beige bg-white/70 px-4 py-3 transition hover:border-gold-soft hover:bg-peach/30"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-peach/60 text-maroon">
                  <GanttChartSquare size={16} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-charcoal">{m.title}</p>
                  <p className="text-xs text-charcoal-soft">
                    {days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"} away`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="stagger-fade grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={ListChecks} label="Total Tasks" value={String(stats.totalTasks)} />
        <StatCard icon={CheckCircle2} label="Completed" value={String(stats.completedTasks)} tone="success" />
        <StatCard icon={Clock} label="Pending Tasks" value={String(stats.pendingTasks)} />
        <StatCard icon={AlertTriangle} label="Overdue" value={String(stats.overdueTasks)} tone="warning" />

        <StatCard icon={Wallet} label="Total Budget" value={formatINR(stats.totalBudget)} />
        <StatCard icon={Wallet} label="Amount Spent" value={formatINR(stats.spent)} />
        <StatCard icon={Wallet} label="Remaining" value={formatINR(stats.remaining)} tone="success" />
        <StatCard icon={Wallet} label="Pending Payments" value={formatINR(stats.pendingPayments)} tone="warning" />

        <StatCard icon={Users} label="Total Guests" value={String(stats.guestCount)} />
        <StatCard icon={Users} label="Confirmed" value={String(stats.confirmedGuests)} tone="success" />
        <StatCard icon={Users} label="Pending RSVPs" value={String(stats.pendingRsvps)} tone="warning" />
        <StatCard icon={Store} label="Vendors Booked" value={String(stats.vendorsBooked)} tone="success" />

        <StatCard icon={Store} label="Vendors Pending" value={String(stats.vendorsPending)} tone="warning" />
        <StatCard icon={ShoppingBag} label="Shopping Left" value={String(stats.shoppingRemaining)} tone="warning" />
        <StatCard
          icon={Clock}
          label="Upcoming Function"
          value={stats.upcomingEvent ? stats.upcomingEvent.name : "—"}
          sublabel={stats.upcomingEvent ? formatPrettyDate(stats.upcomingEvent.date) : undefined}
        />
        <StatCard
          icon={Wallet}
          label="Upcoming Payment"
          value={stats.upcomingVendorPayment ? stats.upcomingVendorPayment.name : "—"}
          sublabel={stats.upcomingVendorPayment ? formatPrettyDate(stats.upcomingVendorPayment.dueDate!) : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InsightsList insights={insights} />
        <QuickActions />
      </div>

      <Card>
        <h2 className="mb-1 text-lg text-maroon-deep">Wedding Tradition</h2>
        <p className="text-sm text-charcoal-soft">
          {workspace.wedding.tradition.region} · {workspace.wedding.tradition.communityNote || "Custom tradition"} ·{" "}
          {workspace.wedding.tradition.foodPreference === "vegetarian" ? "Vegetarian" : "Mixed"} menu
        </p>
      </Card>
    </div>
  );
}