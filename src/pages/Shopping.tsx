import { useState } from "react";
import { Plus, Pencil, Trash2, ShoppingBag } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import type { ShoppingSummary } from "../types/wedding";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Field } from "../components/common/Field";

type FormState = Omit<ShoppingSummary, "id">;

const emptyForm: FormState = { item: "", forWhom: "", purchased: false, packed: false };

export function Shopping() {
  const { workspace, addShoppingItem, updateShoppingItem, deleteShoppingItem } = useWedding();
  const [editing, setEditing] = useState<ShoppingSummary | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!workspace) return null;
  const items = workspace.shopping;

  const openAdd = () => {
    setForm(emptyForm);
    setIsAdding(true);
  };
  const openEdit = (item: ShoppingSummary) => {
    setForm({ ...item });
    setEditing(item);
  };
  const closeModal = () => {
    setIsAdding(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.item.trim()) return;
    if (editing) {
      await updateShoppingItem(editing.id, form);
    } else {
      await addShoppingItem(form);
    }
    closeModal();
  };

  const toggle = async (item: ShoppingSummary, field: "purchased" | "packed") => {
    await updateShoppingItem(item.id, { ...item, [field]: !item[field] });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-charcoal-soft">{items.length} item{items.length === 1 ? "" : "s"}</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-full bg-maroon px-4 py-2 text-sm font-medium text-cream transition hover:bg-maroon-deep"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No shopping items added yet"
          description="Track outfits, jewellery, ritual samagri and everything else you need to buy."
          actionLabel="+ Add First Item"
          onAction={openAdd}
        />
      ) : (
        <div className="stagger-fade space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-charcoal">{item.item}</p>
                <p className="mt-1 text-sm text-charcoal-soft">For {item.forWhom || "—"}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={item.purchased}
                      onChange={() => toggle(item, "purchased")}
                      className="h-3.5 w-3.5 rounded border-beige accent-maroon"
                    />
                    <span className="text-charcoal-soft">Purchased</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => toggle(item, "packed")}
                      className="h-3.5 w-3.5 rounded border-beige accent-maroon"
                    />
                    <span className="text-charcoal-soft">Packed</span>
                  </label>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => openEdit(item)}
                  aria-label={`Edit ${item.item}`}
                  className="rounded-full p-2 text-charcoal-soft hover:bg-peach/40 hover:text-maroon-deep"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  aria-label={`Delete ${item.item}`}
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
        <Modal title={editing ? "Edit Shopping Item" : "Add Shopping Item"} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Item">
              <input className="input" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
            </Field>
            <Field label="For Whom">
              <input
                className="input"
                placeholder="e.g. Bride, Groom, Family, Wedding"
                value={form.forWhom}
                onChange={(e) => setForm({ ...form, forWhom: e.target.value })}
              />
            </Field>
            <div className="flex gap-5">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.purchased}
                  onChange={(e) => setForm({ ...form, purchased: e.target.checked })}
                  className="h-4 w-4 rounded border-beige accent-maroon"
                />
                <span className="text-charcoal-soft">Purchased</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.packed}
                  onChange={(e) => setForm({ ...form, packed: e.target.checked })}
                  className="h-4 w-4 rounded border-beige accent-maroon"
                />
                <span className="text-charcoal-soft">Packed</span>
              </label>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!form.item.trim()}
              className="w-full rounded-full bg-maroon py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep disabled:opacity-50"
            >
              {editing ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete this item?"
          description="This can't be undone."
          onCancel={() => setDeleteId(null)}
          onConfirm={async () => {
            await deleteShoppingItem(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}
