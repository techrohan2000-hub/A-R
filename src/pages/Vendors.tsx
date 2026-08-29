import { useState } from "react";
import { Plus, Pencil, Trash2, Store } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import type { VendorSummary } from "../types/wedding";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Field } from "../components/common/Field";
import { ProgressBar } from "../components/common/ProgressBar";
import { formatINR } from "../utils/formatters";
import { formatPrettyDate } from "../utils/dateUtils";

type FormState = Omit<VendorSummary, "id">;

const emptyForm: FormState = {
  name: "",
  category: "",
  status: "researching",
  totalAmount: 0,
  paidAmount: 0,
  dueDate: "",
};

const statusLabels: Record<VendorSummary["status"], string> = {
  researching: "Researching",
  contacted: "Contacted",
  "quote-received": "Quote Received",
  negotiating: "Negotiating",
  shortlisted: "Shortlisted",
  booked: "Booked",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusStyles: Record<VendorSummary["status"], string> = {
  researching: "bg-beige text-charcoal-soft",
  contacted: "bg-beige text-charcoal-soft",
  "quote-received": "bg-peach/60 text-maroon-deep",
  negotiating: "bg-[#f6e3d3] text-[#8a4a1f]",
  shortlisted: "bg-[#f6e3d3] text-[#8a4a1f]",
  booked: "bg-[#e3ecd9] text-[#3f6b2c]",
  completed: "bg-[#e3ecd9] text-[#3f6b2c]",
  cancelled: "bg-[#f6dede] text-[#a13030]",
};

export function Vendors() {
  const { workspace, addVendor, updateVendor, deleteVendor } = useWedding();
  const [editing, setEditing] = useState<VendorSummary | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!workspace) return null;
  const vendors = workspace.vendors;

  const openAdd = () => {
    setForm(emptyForm);
    setIsAdding(true);
  };
  const openEdit = (vendor: VendorSummary) => {
    setForm({ ...vendor });
    setEditing(vendor);
  };
  const closeModal = () => {
    setIsAdding(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    const cleaned = { ...form, dueDate: form.dueDate || undefined };
    if (editing) {
      await updateVendor(editing.id, cleaned);
    } else {
      await addVendor(cleaned);
    }
    closeModal();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-charcoal-soft">{vendors.length} vendor{vendors.length === 1 ? "" : "s"}</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-full bg-maroon px-4 py-2 text-sm font-medium text-cream transition hover:bg-maroon-deep"
        >
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      {vendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendors added yet"
          description="Track caterers, decorators, photographers, priests and more — with payments."
          actionLabel="+ Add First Vendor"
          onAction={openAdd}
        />
      ) : (
        <div className="stagger-fade space-y-3">
          {vendors.map((vendor) => {
            const remaining = Math.max(vendor.totalAmount - vendor.paidAmount, 0);
            const pct = vendor.totalAmount > 0 ? (vendor.paidAmount / vendor.totalAmount) * 100 : 0;
            return (
              <Card key={vendor.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-charcoal">{vendor.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[vendor.status]}`}>
                        {statusLabels[vendor.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-charcoal-soft">{vendor.category}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => openEdit(vendor)}
                      aria-label={`Edit ${vendor.name}`}
                      className="rounded-full p-2 text-charcoal-soft hover:bg-peach/40 hover:text-maroon-deep"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(vendor.id)}
                      aria-label={`Delete ${vendor.name}`}
                      className="rounded-full p-2 text-charcoal-soft hover:bg-[#fdf0f0] hover:text-[#c85a5a]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {vendor.totalAmount > 0 && (
                  <div className="mt-3">
                    <ProgressBar value={pct} label={`${formatINR(vendor.paidAmount)} of ${formatINR(vendor.totalAmount)} paid`} />
                    <p className="mt-1.5 text-xs text-charcoal-soft">
                      Remaining {formatINR(remaining)}
                      {vendor.dueDate ? ` · Due ${formatPrettyDate(vendor.dueDate)}` : ""}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {(isAdding || editing) && (
        <Modal title={editing ? "Edit Vendor" : "Add Vendor"} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Vendor Name">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Category">
              <input
                className="input"
                placeholder="e.g. Caterer, Photographer, Priest"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as VendorSummary["status"] })}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Total Amount (₹)">
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: Number(e.target.value) })}
                />
              </Field>
              <Field label="Paid So Far (₹)">
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={form.paidAmount}
                  onChange={(e) => setForm({ ...form, paidAmount: Number(e.target.value) })}
                />
              </Field>
            </div>
            <Field label="Next Payment Due Date (optional)">
              <input
                type="date"
                className="input"
                value={form.dueDate ?? ""}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </Field>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim()}
              className="w-full rounded-full bg-maroon py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep disabled:opacity-50"
            >
              {editing ? "Save Changes" : "Add Vendor"}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete this vendor?"
          description="This can't be undone."
          onCancel={() => setDeleteId(null)}
          onConfirm={async () => {
            await deleteVendor(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}
