import { useState } from "react";
import { Plus, Pencil, Trash2, Flame } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import type { WeddingEventSummary } from "../types/wedding";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Field } from "../components/common/Field";
import { formatPrettyDate, daysUntil } from "../utils/dateUtils";

type FormState = Omit<WeddingEventSummary, "id">;

const emptyForm: FormState = {
  name: "",
  date: new Date().toISOString().slice(0, 10),
  enabled: true,
  isCustom: true,
};

export function EventsRituals() {
  const { workspace, addEvent, updateEvent, deleteEvent } = useWedding();
  const [editing, setEditing] = useState<WeddingEventSummary | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!workspace) return null;
  const events = [...workspace.wedding.events].sort((a, b) => a.date.localeCompare(b.date));

  const openAdd = () => {
    setForm(emptyForm);
    setIsAdding(true);
  };
  const openEdit = (event: WeddingEventSummary) => {
    setForm({ ...event });
    setEditing(event);
  };
  const closeModal = () => {
    setIsAdding(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await updateEvent(editing.id, form);
    } else {
      await addEvent(form);
    }
    closeModal();
  };

  const toggleEnabled = async (event: WeddingEventSummary) => {
    await updateEvent(event.id, { name: event.name, date: event.date, enabled: !event.enabled, isCustom: event.isCustom });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-charcoal-soft">{events.length} event{events.length === 1 ? "" : "s"} &amp; rituals</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-full bg-maroon px-4 py-2 text-sm font-medium text-cream transition hover:bg-maroon-deep"
        >
          <Plus size={16} /> Add Event / Ritual
        </button>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="No events or rituals added yet"
          description="Add every function — Haldi, Mehendi, Sangeet, Grah Shanti, the wedding ceremony, and any custom ritual your family follows."
          actionLabel="+ Add First Event"
          onAction={openAdd}
        />
      ) : (
        <div className="stagger-fade space-y-3">
          {events.map((event) => {
            const days = daysUntil(event.date);
            return (
              <Card key={event.id} className={`flex items-center justify-between gap-4 ${!event.enabled ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={event.enabled}
                      onChange={() => toggleEnabled(event)}
                      className="h-4 w-4 rounded border-beige accent-maroon"
                      aria-label={`Enable ${event.name}`}
                    />
                  </label>
                  <div>
                    <p className="font-medium text-charcoal">{event.name}</p>
                    <p className="mt-0.5 text-sm text-charcoal-soft">
                      {formatPrettyDate(event.date)}
                      {event.enabled && days >= 0 ? ` · ${days} day${days === 1 ? "" : "s"} away` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => openEdit(event)}
                    aria-label={`Edit ${event.name}`}
                    className="rounded-full p-2 text-charcoal-soft hover:bg-peach/40 hover:text-maroon-deep"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(event.id)}
                    aria-label={`Delete ${event.name}`}
                    className="rounded-full p-2 text-charcoal-soft hover:bg-[#fdf0f0] hover:text-[#c85a5a]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {(isAdding || editing) && (
        <Modal title={editing ? "Edit Event / Ritual" : "Add Event / Ritual"} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Name">
              <input
                className="input"
                placeholder="e.g. Haldi, Grah Shanti, Reception"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Date">
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="h-4 w-4 rounded border-beige accent-maroon"
              />
              <span className="text-charcoal-soft">Enabled — happening as part of this wedding</span>
            </label>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim()}
              className="w-full rounded-full bg-maroon py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep disabled:opacity-50"
            >
              {editing ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete this event?"
          description="This can't be undone."
          onCancel={() => setDeleteId(null)}
          onConfirm={async () => {
            await deleteEvent(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}
