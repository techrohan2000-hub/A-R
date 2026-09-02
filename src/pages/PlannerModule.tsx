import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { CalendarDays, IndianRupee, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import { navItems } from "../routes/navConfig";
import type { PlannerItem } from "../types/wedding";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Field } from "../components/common/Field";
import { formatINR } from "../utils/formatters";
import { formatPrettyDate } from "../utils/dateUtils";

type FormState = Omit<PlannerItem, "id">;

interface ModuleConfig {
  singular: string;
  description: string;
  titleLabel: string;
  categoryLabel: string;
  contactLabel?: string;
  dateLabel?: string;
  amountLabel?: string;
  statuses: string[];
}

const configs: Record<string, ModuleConfig> = {
  invitations: { singular: "Invitation", description: "Track designs, printing, digital cards and delivery.", titleLabel: "Invitation / batch", categoryLabel: "Format", contactLabel: "Printer / recipient group", dateLabel: "Send by", amountLabel: "Cost", statuses: ["Draft", "In design", "Ordered", "Sent"] },
  outfits: { singular: "Outfit", description: "Keep every look, fitting and pickup organized.", titleLabel: "Outfit", categoryLabel: "For whom / function", contactLabel: "Designer / owner", dateLabel: "Ready by", amountLabel: "Cost", statuses: ["Idea", "Shortlisted", "Ordered", "Ready"] },
  jewellery: { singular: "Jewellery item", description: "Plan jewellery, accessories, trials and safekeeping.", titleLabel: "Jewellery item", categoryLabel: "For whom / function", contactLabel: "Jeweller / custodian", dateLabel: "Ready by", amountLabel: "Value", statuses: ["Considering", "Ordered", "Ready", "Packed"] },
  food: { singular: "Menu item", description: "Build menus and manage tastings with your caterer.", titleLabel: "Menu / dish", categoryLabel: "Function / course", contactLabel: "Caterer", dateLabel: "Finalize by", amountLabel: "Cost", statuses: ["Idea", "Tasting", "Approved", "Confirmed"] },
  venue: { singular: "Venue item", description: "Compare spaces, visits, bookings and venue requirements.", titleLabel: "Venue / requirement", categoryLabel: "Function / area", contactLabel: "Venue contact", dateLabel: "Visit / due date", amountLabel: "Cost", statuses: ["Researching", "Visited", "Shortlisted", "Booked"] },
  decoration: { singular: "Decoration item", description: "Shape the visual story for every wedding function.", titleLabel: "Decor element", categoryLabel: "Function / area", contactLabel: "Decorator", dateLabel: "Finalize by", amountLabel: "Cost", statuses: ["Idea", "Quoted", "Approved", "Ready"] },
  photography: { singular: "Photography item", description: "Plan teams, shot lists, albums and deliverables.", titleLabel: "Shoot / deliverable", categoryLabel: "Function / style", contactLabel: "Photographer", dateLabel: "Due date", amountLabel: "Cost", statuses: ["Planned", "Booked", "Captured", "Delivered"] },
  travel: { singular: "Travel plan", description: "Coordinate journeys, rooms and guest arrivals.", titleLabel: "Trip / stay", categoryLabel: "Travel type / guest group", contactLabel: "Booking / contact", dateLabel: "Travel date", amountLabel: "Cost", statuses: ["Planning", "Reserved", "Confirmed", "Completed"] },
  gifts: { singular: "Gift", description: "Track family gifts, return gifts and distribution.", titleLabel: "Gift", categoryLabel: "Recipient / occasion", contactLabel: "Supplier / owner", dateLabel: "Needed by", amountLabel: "Cost", statuses: ["Idea", "Ordered", "Received", "Given"] },
  documents: { singular: "Document", description: "Keep a safe index of important wedding paperwork.", titleLabel: "Document", categoryLabel: "Type", contactLabel: "Owner / storage location", dateLabel: "Due / expiry date", statuses: ["Needed", "Requested", "Ready", "Filed"] },
  "wedding-day": { singular: "Wedding-day item", description: "Run the big day from one calm, shared checklist.", titleLabel: "Action / checkpoint", categoryLabel: "Function / area", contactLabel: "Responsible person", dateLabel: "Date", statuses: ["Planned", "Ready", "In progress", "Done"] },
  family: { singular: "Family member", description: "Organize roles, contacts and family responsibilities.", titleLabel: "Name", categoryLabel: "Relation / side", contactLabel: "Phone / email", statuses: ["Member", "Coordinator", "VIP", "Unavailable"] },
  notes: { singular: "Note", description: "Capture decisions, ideas and reminders before they get lost.", titleLabel: "Note title", categoryLabel: "Topic", statuses: ["Active", "Important", "Resolved", "Archived"] },
};

function emptyForm(section: string, config: ModuleConfig): FormState {
  return {
    section,
    title: "",
    category: "",
    contact: "",
    date: "",
    status: config.statuses[0],
    amount: 0,
    notes: "",
  };
}

export function PlannerModule() {
  const location = useLocation();
  const section = location.pathname.replace(/^\//, "");
  const config = configs[section];
  const navItem = navItems.find((item) => item.path === location.pathname);
  const Icon = navItem?.icon ?? CalendarDays;
  const { workspace, addPlannerItem, updatePlannerItem, deletePlannerItem } = useWedding();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [form, setForm] = useState<FormState>(() => emptyForm(section, config));
  const [editing, setEditing] = useState<PlannerItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const items = useMemo(() => {
    if (!workspace) return [];
    const normalizedQuery = query.trim().toLowerCase();
    return workspace.plannerItems
      .filter((item) => item.section === section)
      .filter((item) => status === "All" || item.status === status)
      .filter((item) =>
        !normalizedQuery ||
        [item.title, item.category, item.contact, item.notes].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        )
      )
      .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  }, [workspace, section, query, status]);

  if (!workspace || !config) return null;

  const allItems = workspace.plannerItems.filter((item) => item.section === section);
  const openAdd = () => {
    setForm(emptyForm(section, config));
    setEditing(null);
    setIsAdding(true);
  };
  const openEdit = (item: PlannerItem) => {
    setForm({ ...item });
    setEditing(item);
  };
  const closeModal = () => {
    setEditing(null);
    setIsAdding(false);
  };
  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    if (editing) await updatePlannerItem(editing.id, form);
    else await addPlannerItem(form);
    closeModal();
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-gold-soft/70 bg-gradient-to-br from-white/90 via-cream-soft to-peach/35 p-5 shadow-[0_18px_50px_-32px_rgba(74,20,32,0.45)] sm:p-8">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border border-gold-soft/40" />
        <div className="absolute -right-4 top-6 h-24 w-24 rounded-full border border-maroon/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-maroon text-cream shadow-lg shadow-maroon/15">
              <Icon size={22} strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Wedding planning</p>
              <h2 className="mt-1 text-xl text-maroon-deep sm:text-2xl">{navItem?.label}</h2>
              <p className="mt-1 max-w-xl text-sm text-charcoal-soft">{config.description}</p>
            </div>
          </div>
          <button onClick={openAdd} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-cream shadow-md shadow-maroon/15 transition hover:bg-maroon-deep lg:hover:-translate-y-0.5">
            <Plus size={17} /> Add {config.singular}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-charcoal-soft">Total</p>
          <p className="mt-1 font-data text-2xl font-semibold text-maroon-deep">{allItems.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-charcoal-soft">Completed</p>
          <p className="mt-1 font-data text-2xl font-semibold text-maroon-deep">
            {allItems.filter((item) => ["Sent", "Ready", "Packed", "Confirmed", "Booked", "Delivered", "Completed", "Given", "Filed", "Done", "Resolved"].includes(item.status)).length}
          </p>
        </Card>
        <Card className="col-span-2 p-4">
          <p className="text-xs uppercase tracking-wide text-charcoal-soft">Planned value</p>
          <p className="mt-1 font-data text-2xl font-semibold text-maroon-deep">
            {formatINR(allItems.reduce((sum, item) => sum + item.amount, 0))}
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-beige bg-white/55 p-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3 py-2">
          <Search size={16} className="text-charcoal-soft" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${navItem?.label.toLowerCase()}…`} className="w-full bg-transparent text-base outline-none placeholder:text-charcoal-soft/60 sm:text-sm" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="input sm:w-44">
          <option>All</option>
          {config.statuses.map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={allItems.length ? "No matching items" : `No ${navItem?.label.toLowerCase()} yet`}
          description={allItems.length ? "Try a different search or status filter." : config.description}
          actionLabel={allItems.length ? undefined : `Add first ${config.singular.toLowerCase()}`}
          onAction={allItems.length ? undefined : openAdd}
        />
      ) : (
        <div className="stagger-fade grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold-soft to-maroon/70" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="rounded-full bg-peach/45 px-2.5 py-1 text-[11px] font-semibold text-maroon-deep">{item.status}</span>
                  <h3 className="mt-3 truncate text-xl text-maroon-deep">{item.title}</h3>
                  {item.category && <p className="mt-1 text-sm text-charcoal-soft">{item.category}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => openEdit(item)} aria-label={`Edit ${item.title}`} className="rounded-full p-2 text-charcoal-soft transition hover:bg-peach/50 hover:text-maroon"><Pencil size={16} /></button>
                  <button onClick={() => setDeleteId(item.id)} aria-label={`Delete ${item.title}`} className="rounded-full p-2 text-charcoal-soft transition hover:bg-red-50 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-beige/70 pt-3 text-xs text-charcoal-soft">
                {item.date && <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {formatPrettyDate(item.date)}</span>}
                {item.amount > 0 && <span className="flex items-center gap-1.5"><IndianRupee size={14} /> {formatINR(item.amount)}</span>}
                {item.contact && <span>{item.contact}</span>}
              </div>
              {item.notes && <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">{item.notes}</p>}
            </Card>
          ))}
        </div>
      )}

      {(isAdding || editing) && (
        <Modal title={editing ? `Edit ${config.singular}` : `Add ${config.singular}`} onClose={closeModal}>
          <div className="space-y-4">
            <Field label={config.titleLabel}>
              <input autoFocus className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={config.categoryLabel}>
                <input className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
              </Field>
              <Field label="Status">
                <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  {config.statuses.map((option) => <option key={option}>{option}</option>)}
                </select>
              </Field>
            </div>
            {(config.contactLabel || config.dateLabel) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {config.contactLabel && <Field label={config.contactLabel}><input className="input" value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} /></Field>}
                {config.dateLabel && <Field label={config.dateLabel}><input type="date" className="input" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></Field>}
              </div>
            )}
            {config.amountLabel && <Field label={`${config.amountLabel} (₹)`}><input type="number" min={0} className="input" value={form.amount} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} /></Field>}
            <Field label="Notes">
              <textarea rows={3} className="input resize-none" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </Field>
            <button disabled={!form.title.trim()} onClick={handleSubmit} className="w-full rounded-full bg-maroon py-2.5 text-sm font-semibold text-cream transition hover:bg-maroon-deep disabled:cursor-not-allowed disabled:opacity-50">
              {editing ? "Save changes" : `Add ${config.singular.toLowerCase()}`}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title={`Delete this ${config.singular.toLowerCase()}?`}
          description="This cannot be undone."
          onCancel={() => setDeleteId(null)}
          onConfirm={async () => {
            await deletePlannerItem(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}
