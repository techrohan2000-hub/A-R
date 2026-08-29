import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import type { BudgetSummary } from "../types/wedding";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Field } from "../components/common/Field";
import { ProgressBar } from "../components/common/ProgressBar";
import { StatCard } from "../components/dashboard/StatCard";
import { formatINR } from "../utils/formatters";

type FormState = Omit<BudgetSummary, "id">;

const emptyForm: FormState = { category: "", estimated: 0, paid: 0 };

export function Budget() {
  const { workspace, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useWedding();
  const [editing, setEditing] = useState<BudgetSummary | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totals = useMemo(() => {
    if (!workspace) return null;
    const estimated = workspace.budget.reduce((s, b) => s + b.estimated, 0);
    const paid = workspace.budget.reduce((s, b) => s + b.paid, 0);
    return { estimated, paid, pending: Math.max(estimated - paid, 0) };
  }, [workspace]);

  if (!workspace || !totals) return null;
  const items = workspace.budget;

  const openAdd = () => {
    setForm(emptyForm);
    setIsAdding(true);
  };
  const openEdit = (item: BudgetSummary) => {
    setForm({ ...item });
    setEditing(item);
  };
  const closeModal = () => {
    setIsAdding(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.category.trim()) return;
    if (editing) {
      await updateBudgetItem(editing.id, form);
    } else {
      await addBudgetItem(form);
    }
    closeModal();
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Estimated" value={formatINR(totals.estimated)} />
        <StatCard icon={Wallet} label="Paid" value={formatINR(totals.paid)} tone="success" />
        <StatCard icon={Wallet} label="Pending" value={formatINR(totals.pending)} tone="warning" />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-charcoal-soft">{items.length} categor{items.length === 1 ? "y" : "ies"}</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-full bg-maroon px-4 py-2 text-sm font-medium text-cream transition hover:bg-maroon-deep"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budget categories yet"
          description="Add categories like venue, catering, or outfits to start tracking your spending."
          actionLabel="+ Add First Expense"
          onAction={openAdd}
        />
      ) : (
        <div className="stagger-fade space-y-3">
          {items.map((item) => {
            const pct = item.estimated > 0 ? (item.paid / item.estimated) * 100 : 0;
            return (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium text-charcoal">{item.category}</p>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => openEdit(item)}
                      aria-label={`Edit ${item.category}`}
                      className="rounded-full p-2 text-charcoal-soft hover:bg-peach/40 hover:text-maroon-deep"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      aria-label={`Delete ${item.category}`}
                      className="rounded-full p-2 text-charcoal-soft hover:bg-[#fdf0f0] hover:text-[#c85a5a]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={pct} label={`${formatINR(item.paid)} of ${formatINR(item.estimated)}`} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {(isAdding || editing) && (
        <Modal title={editing ? "Edit Expense" : "Add Expense"} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Category">
              <input
                className="input"
                placeholder="e.g. Venue, Catering, Photography"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Estimated (₹)">
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={form.estimated}
                  onChange={(e) => setForm({ ...form, estimated: Number(e.target.value) })}
                />
              </Field>
              <Field label="Paid So Far (₹)">
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={form.paid}
                  onChange={(e) => setForm({ ...form, paid: Number(e.target.value) })}
                />
              </Field>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!form.category.trim()}
              className="w-full rounded-full bg-maroon py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep disabled:opacity-50"
            >
              {editing ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete this category?"
          description="This can't be undone."
          onCancel={() => setDeleteId(null)}
          onConfirm={async () => {
            await deleteBudgetItem(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}
