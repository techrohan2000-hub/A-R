import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, GanttChartSquare, Check } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import type { TimelineMilestone } from "../types/wedding";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Field } from "../components/common/Field";
import { daysUntil, formatPrettyDate } from "../utils/dateUtils";

type FormState = Omit<TimelineMilestone, "id">;

const emptyForm: FormState = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
  completed: false,
};

type BucketKey = "overdue" | "thisWeek" | "thisMonth" | "later" | "done";

const bucketMeta: Record<BucketKey, { label: string; dot: string }> = {
  overdue: { label: "Overdue", dot: "bg-[#c85a5a]" },
  thisWeek: { label: "This Week", dot: "bg-maroon" },
  thisMonth: { label: "This Month", dot: "bg-gold" },
  later: { label: "Later", dot: "bg-charcoal-soft" },
  done: { label: "Completed", dot: "bg-[#3f6b2c]" },
};

function bucketOf(m: TimelineMilestone): BucketKey {
  if (m.completed) return "done";
  const d = daysUntil(m.date);
  if (d < 0) return "overdue";
  if (d <= 7) return "thisWeek";
  if (d <= 31) return "thisMonth";
  return "later";
}

export function Timeline() {
  const { workspace, addMilestone, updateMilestone, deleteMilestone } = useWedding();
  const [editing, setEditing] = useState<TimelineMilestone | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    if (!workspace) return null;
    const sorted = [...workspace.milestones].sort((a, b) => a.date.localeCompare(b.date));
    const buckets: Record<BucketKey, TimelineMilestone[]> = {
      overdue: [],
      thisWeek: [],
      thisMonth: [],
      later: [],
      done: [],
    };
    sorted.forEach((m) => buckets[bucketOf(m)].push(m));
    return buckets;
  }, [workspace]);

  if (!workspace || !grouped) return null;

  const openAdd = () => {
    setForm(emptyForm);
    setIsAdding(true);
  };
  const openEdit = (m: TimelineMilestone) => {
    setForm({ ...m });
    setEditing(m);
  };
  const closeModal = () => {
    setIsAdding(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    if (editing) {
      await updateMilestone(editing.id, form);
    } else {
      await addMilestone(form);
    }
    closeModal();
  };

  const toggleComplete = async (m: TimelineMilestone) => {
    await updateMilestone(m.id, { ...m, completed: !m.completed });
  };

  const orderedBuckets: BucketKey[] = ["overdue", "thisWeek", "thisMonth", "later", "done"];
  const total = workspace.milestones.length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-charcoal-soft">{total} milestone{total === 1 ? "" : "s"} on your timeline</p>
        <button
          onClick={openAdd}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-maroon px-4 py-2 text-sm font-medium text-cream transition hover:bg-maroon-deep"
        >
          <Plus size={16} /> <span className="sm:hidden">Add</span><span className="hidden sm:inline">Add Milestone</span>
        </button>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={GanttChartSquare}
          title="No timeline milestones yet"
          description="Add key dates like booking a venue, sending invites, or collecting outfits — this app will sort them into Overdue, This Week, This Month and Later automatically."
          actionLabel="+ Add First Milestone"
          onAction={openAdd}
        />
      ) : (
        <div className="space-y-8">
          {orderedBuckets.map((key) => {
            const items = grouped[key];
            if (items.length === 0) return null;
            const meta = bucketMeta[key];
            return (
              <div key={key}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  <h2 className="text-sm font-medium uppercase tracking-wide text-charcoal-soft">{meta.label}</h2>
                  <span className="text-xs text-charcoal-soft/60">({items.length})</span>
                </div>

                <div className="stagger-fade relative space-y-3 border-l-2 border-beige pl-5">
                  {items.map((m) => (
                    <Card
                      key={m.id}
                      className={`relative flex items-start justify-between gap-4 ${m.completed ? "opacity-60" : ""}`}
                    >
                      <span
                        className={`absolute -left-[27px] top-6 h-3 w-3 rounded-full ring-4 ring-cream ${meta.dot}`}
                        aria-hidden="true"
                      />
                      <button
                        onClick={() => toggleComplete(m)}
                        aria-label={m.completed ? `Mark ${m.title} incomplete` : `Mark ${m.title} complete`}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          m.completed ? "border-[#3f6b2c] bg-[#3f6b2c] text-white" : "border-beige text-transparent"
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium text-charcoal ${m.completed ? "line-through" : ""}`}>{m.title}</p>
                        <p className="mt-0.5 text-sm text-charcoal-soft">{formatPrettyDate(m.date)}</p>
                        {m.notes && <p className="mt-1 text-sm text-charcoal-soft/80">{m.notes}</p>}
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <button
                          onClick={() => openEdit(m)}
                          aria-label={`Edit ${m.title}`}
                          className="rounded-full p-2 text-charcoal-soft hover:bg-peach/40 hover:text-maroon-deep"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(m.id)}
                          aria-label={`Delete ${m.title}`}
                          className="rounded-full p-2 text-charcoal-soft hover:bg-[#fdf0f0] hover:text-[#c85a5a]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(isAdding || editing) && (
        <Modal title={editing ? "Edit Milestone" : "Add Milestone"} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Title">
              <input
                className="input"
                placeholder="e.g. Book venue, Send invitations"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>
            <Field label="Date">
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="Notes (optional)">
              <textarea
                className="input"
                rows={2}
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.completed}
                onChange={(e) => setForm({ ...form, completed: e.target.checked })}
                className="h-4 w-4 rounded border-beige accent-maroon"
              />
              <span className="text-charcoal-soft">Already completed</span>
            </label>
            <button
              onClick={handleSubmit}
              disabled={!form.title.trim()}
              className="w-full rounded-full bg-maroon py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep disabled:opacity-50"
            >
              {editing ? "Save Changes" : "Add Milestone"}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete this milestone?"
          description="This can't be undone."
          onCancel={() => setDeleteId(null)}
          onConfirm={async () => {
            await deleteMilestone(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}
