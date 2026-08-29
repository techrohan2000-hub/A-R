import { useState } from "react";
import { Plus, Pencil, Trash2, ListChecks } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import type { Priority, TaskStatus, TaskSummary } from "../types/wedding";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Field } from "../components/common/Field";
import { dueLabel, formatPrettyDate } from "../utils/dateUtils";

type FormState = Omit<TaskSummary, "id">;

const emptyForm: FormState = {
  title: "",
  category: "",
  responsible: "",
  dueDate: new Date().toISOString().slice(0, 10),
  priority: "medium",
  status: "not-started",
};

const priorityStyles: Record<Priority, string> = {
  critical: "bg-[#f6dede] text-[#a13030]",
  high: "bg-[#f6e3d3] text-[#8a4a1f]",
  medium: "bg-peach/60 text-maroon-deep",
  low: "bg-beige text-charcoal-soft",
};

const statusLabels: Record<TaskStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  waiting: "Waiting",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function Tasks() {
  const { workspace, addTask, updateTask, deleteTask } = useWedding();
  const [editing, setEditing] = useState<TaskSummary | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!workspace) return null;
  const tasks = [...workspace.tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const openAdd = () => {
    setForm(emptyForm);
    setIsAdding(true);
  };
  const openEdit = (task: TaskSummary) => {
    setForm({ ...task });
    setEditing(task);
  };
  const closeModal = () => {
    setIsAdding(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    if (editing) {
      await updateTask(editing.id, form);
    } else {
      await addTask(form);
    }
    closeModal();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-charcoal-soft">{tasks.length} task{tasks.length === 1 ? "" : "s"}</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-full bg-maroon px-4 py-2 text-sm font-medium text-cream transition hover:bg-maroon-deep"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks added yet"
          description="Add everything from booking a caterer to picking up outfits before the wedding."
          actionLabel="+ Add First Task"
          onAction={openAdd}
        />
      ) : (
        <div className="stagger-fade space-y-3">
          {tasks.map((task) => {
            const due = dueLabel(task.dueDate);
            return (
              <Card key={task.id} className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-charcoal">{task.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-charcoal-soft">
                    {task.category} · {task.responsible} · Due {formatPrettyDate(task.dueDate)}
                    {due === "overdue" && task.status !== "completed" && (
                      <span className="ml-1.5 font-medium text-[#a13030]">Overdue</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-charcoal-soft/70">
                    {statusLabels[task.status]}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => openEdit(task)}
                    aria-label={`Edit ${task.title}`}
                    className="rounded-full p-2 text-charcoal-soft hover:bg-peach/40 hover:text-maroon-deep"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(task.id)}
                    aria-label={`Delete ${task.title}`}
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
        <Modal title={editing ? "Edit Task" : "Add Task"} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Task Title">
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Category">
              <input
                className="input"
                placeholder="e.g. Shopping, Vendors, Invitations"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Field>
            <Field label="Responsible Person">
              <input
                className="input"
                value={form.responsible}
                onChange={(e) => setForm({ ...form, responsible: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Due Date">
                <input
                  type="date"
                  className="input"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </Field>
              <Field label="Priority">
                <select
                  className="input"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </Field>
            </div>
            <Field label="Status">
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <button
              onClick={handleSubmit}
              disabled={!form.title.trim()}
              className="w-full rounded-full bg-maroon py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep disabled:opacity-50"
            >
              {editing ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete this task?"
          description="This can't be undone."
          onCancel={() => setDeleteId(null)}
          onConfirm={async () => {
            await deleteTask(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}
