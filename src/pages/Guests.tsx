import { useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import type { FamilySide, GuestSummary } from "../types/wedding";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Field } from "../components/common/Field";

type FormState = Omit<GuestSummary, "id">;

const emptyForm: FormState = {
  name: "",
  side: "both",
  rsvp: "not-contacted",
  accommodationRequired: false,
};

const rsvpStyles: Record<GuestSummary["rsvp"], string> = {
  "not-contacted": "bg-beige text-charcoal-soft",
  invited: "bg-peach/60 text-maroon-deep",
  maybe: "bg-[#f6e3d3] text-[#8a4a1f]",
  confirmed: "bg-[#e3ecd9] text-[#3f6b2c]",
  declined: "bg-[#f6dede] text-[#a13030]",
};

const rsvpLabels: Record<GuestSummary["rsvp"], string> = {
  "not-contacted": "Not contacted",
  invited: "Invited",
  maybe: "Maybe",
  confirmed: "Confirmed",
  declined: "Declined",
};

const sideLabels: Record<FamilySide, string> = { bride: "Bride Side", groom: "Groom Side", both: "Both Sides" };

export function Guests() {
  const { workspace, addGuest, updateGuest, deleteGuest } = useWedding();
  const [editing, setEditing] = useState<GuestSummary | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | FamilySide>("all");

  if (!workspace) return null;
  const guests = workspace.guests.filter((g) => filter === "all" || g.side === filter);

  const openAdd = () => {
    setForm(emptyForm);
    setIsAdding(true);
  };
  const openEdit = (guest: GuestSummary) => {
    setForm({ ...guest });
    setEditing(guest);
  };
  const closeModal = () => {
    setIsAdding(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await updateGuest(editing.id, form);
    } else {
      await addGuest(form);
    }
    closeModal();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(["all", "bride", "groom", "both"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === f ? "bg-maroon text-cream" : "bg-cream-soft text-charcoal-soft hover:bg-peach/40"
              }`}
            >
              {f === "all" ? "All Guests" : sideLabels[f]}
            </button>
          ))}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-full bg-maroon px-4 py-2 text-sm font-medium text-cream transition hover:bg-maroon-deep"
        >
          <Plus size={16} /> Add Guest
        </button>
      </div>

      {guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No guests added yet"
          description="Build your guest list to track RSVPs and accommodation needs."
          actionLabel="+ Add First Guest"
          onAction={openAdd}
        />
      ) : (
        <div className="stagger-fade space-y-3">
          {guests.map((guest) => (
            <Card key={guest.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-charcoal">{guest.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${rsvpStyles[guest.rsvp]}`}>
                    {rsvpLabels[guest.rsvp]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-charcoal-soft">
                  {sideLabels[guest.side]}
                  {guest.accommodationRequired ? " · Needs accommodation" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => openEdit(guest)}
                  aria-label={`Edit ${guest.name}`}
                  className="rounded-full p-2 text-charcoal-soft hover:bg-peach/40 hover:text-maroon-deep"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(guest.id)}
                  aria-label={`Delete ${guest.name}`}
                  className="rounded-full p-2 text-charcoal-soft hover:bg-[#fdf0f0] hover:text-[#c85a5a]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(isAdding || editing) && (
        <Modal title={editing ? "Edit Guest" : "Add Guest"} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Guest / Family Name">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Side">
              <select
                className="input"
                value={form.side}
                onChange={(e) => setForm({ ...form, side: e.target.value as FamilySide })}
              >
                <option value="bride">Bride Side</option>
                <option value="groom">Groom Side</option>
                <option value="both">Both Sides</option>
              </select>
            </Field>
            <Field label="RSVP Status">
              <select
                className="input"
                value={form.rsvp}
                onChange={(e) => setForm({ ...form, rsvp: e.target.value as GuestSummary["rsvp"] })}
              >
                {Object.entries(rsvpLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.accommodationRequired}
                onChange={(e) => setForm({ ...form, accommodationRequired: e.target.checked })}
                className="h-4 w-4 rounded border-beige accent-maroon"
              />
              <span className="text-charcoal-soft">Needs accommodation</span>
            </label>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim()}
              className="w-full rounded-full bg-maroon py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep disabled:opacity-50"
            >
              {editing ? "Save Changes" : "Add Guest"}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete this guest?"
          description="This can't be undone."
          onCancel={() => setDeleteId(null)}
          onConfirm={async () => {
            await deleteGuest(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}
