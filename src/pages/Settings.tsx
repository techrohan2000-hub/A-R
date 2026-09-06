import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Download, Upload, RotateCcw, Trash2, ShieldAlert, Pencil, Cloud, HardDrive } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import { Card } from "../components/common/Card";
import { isFirebaseConfigured } from "../services/firebase";

export function Settings() {
  const { workspace, exportBackup, importBackup, resetAllData, startFresh, saveReminderPreferences } = useWedding();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | "reset" | "fresh">(null);
  const [preferences, setPreferences] = useState(() => workspace?.reminderPreferences);

  if (!workspace) return null;
  const reminderPreferences = preferences ?? workspace.reminderPreferences;
  const { couple, tradition, planning } = workspace.wedding;

  const handleExport = async () => {
    const json = await exportBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded.");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importBackup(text);
      setMessage("Backup imported successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Import failed.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg text-maroon-deep">Wedding Details</h2>
          <button
            onClick={() => navigate("/setup")}
            className="flex items-center gap-1.5 rounded-full border border-maroon px-3.5 py-1.5 text-xs font-medium text-maroon transition hover:bg-peach/40"
          >
            <Pencil size={13} /> Edit
          </button>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-charcoal-soft">Couple</dt>
            <dd className="font-medium">{couple.groomName} &amp; {couple.brideName}</dd>
          </div>
          <div>
            <dt className="text-charcoal-soft">Wedding Date</dt>
            <dd className="font-medium">{couple.weddingDate || "Not set"}</dd>
          </div>
          <div>
            <dt className="text-charcoal-soft">Venue</dt>
            <dd className="font-medium">{couple.weddingVenue || "Not set"}, {couple.city}</dd>
          </div>
          <div>
            <dt className="text-charcoal-soft">Tradition</dt>
            <dd className="font-medium">{tradition.region} · {tradition.familyTradition}</dd>
          </div>
          <div>
            <dt className="text-charcoal-soft">Budget</dt>
            <dd className="font-medium">₹{planning.totalBudget.toLocaleString("en-IN")}</dd>
          </div>
          <div>
            <dt className="text-charcoal-soft">Expected Guests</dt>
            <dd className="font-medium">{planning.expectedGuestCount}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-1 flex items-center gap-2 text-lg text-maroon-deep">
          <Bell size={18} /> Reminders &amp; Invitations
        </h2>
        <p className="mb-4 text-sm text-charcoal-soft">
          Reminders are calculated when this website is open. Invitation buttons open your phone or email app for free; they do not send automatically.
        </p>
        <label className="mb-4 flex items-center gap-2.5 text-sm font-medium text-charcoal">
          <input
            type="checkbox"
            checked={reminderPreferences.enabled}
            onChange={(event) => setPreferences({ ...reminderPreferences, enabled: event.target.checked })}
            className="h-4 w-4 accent-maroon"
          />
          Enable in-app reminders
        </label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["eventLeadDays", "Event notice (days)"],
            ["taskLeadDays", "Task notice (days)"],
            ["milestoneLeadDays", "Milestone notice (days)"],
            ["vendorLeadDays", "Vendor payment notice (days)"],
            ["rsvpFollowUpDays", "RSVP follow-up after (days)"],
          ] as const).map(([key, label]) => (
            <label key={key} className="text-sm text-charcoal-soft">
              {label}
              <input
                type="number"
                min={0}
                max={90}
                className="input mt-1"
                value={reminderPreferences[key]}
                onChange={(event) => setPreferences({ ...reminderPreferences, [key]: Math.max(0, Number(event.target.value)) })}
              />
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-charcoal-soft">
            RSVP line
            <input className="input mt-1" value={reminderPreferences.rsvpText} onChange={(event) => setPreferences({ ...reminderPreferences, rsvpText: event.target.value })} />
          </label>
          <label className="text-sm text-charcoal-soft">
            Invitation signature
            <input className="input mt-1" value={reminderPreferences.invitationSignature} onChange={(event) => setPreferences({ ...reminderPreferences, invitationSignature: event.target.value })} />
          </label>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="text-sm text-charcoal-soft">
            Default English invitation
            <textarea
              rows={8}
              className="input mt-1 resize-y"
              value={reminderPreferences.invitationMessageEn ?? ""}
              onChange={(event) => setPreferences({ ...reminderPreferences, invitationMessageEn: event.target.value })}
              placeholder="Leave blank to use the selected invitation mood."
            />
          </label>
          <label className="text-sm text-charcoal-soft">
            Default Marathi invitation / मराठी निमंत्रण
            <textarea
              rows={8}
              className="input mt-1 resize-y font-marathi"
              value={reminderPreferences.invitationMessageMr ?? ""}
              onChange={(event) => setPreferences({ ...reminderPreferences, invitationMessageMr: event.target.value })}
              placeholder="मूड निवडल्यावर येणारा मसुदा वापरण्यासाठी रिकामे ठेवा."
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-charcoal-soft">
          Use {"{guestName}"}, {"{groomName}"}, {"{brideName}"}, {"{event}"}, {"{dateLine}"} and {"{venueLine}"} so every guest gets a personal message.
        </p>
        <label className="mt-4 flex items-center gap-2.5 text-sm text-charcoal-soft">
          <input
            type="checkbox"
            checked={reminderPreferences.quietHoursEnabled}
            onChange={(event) => setPreferences({ ...reminderPreferences, quietHoursEnabled: event.target.checked })}
            className="h-4 w-4 accent-maroon"
          />
          Hide the unread badge between 10 PM and 8 AM
        </label>
        <button
          onClick={async () => {
            await saveReminderPreferences(reminderPreferences);
            setMessage("Reminder settings saved.");
          }}
          className="mt-4 rounded-full bg-maroon px-4 py-2.5 text-sm font-medium text-cream hover:bg-maroon-deep"
        >
          Save reminder settings
        </button>
      </Card>

      <Card>
        <h2 className="mb-1 flex items-center gap-2 text-lg text-maroon-deep">
          {isFirebaseConfigured ? <Cloud size={18} /> : <HardDrive size={18} />}
          Data Sync
        </h2>
        <p className="text-sm text-charcoal-soft">
          {isFirebaseConfigured
            ? "Firebase sync is configured. Changes are cached in this browser first and synchronized to the shared wedding workspace."
            : "Firebase is not configured in this build. Changes are safely stored in this browser, but they will not appear on other devices until the Firebase environment values are added and the app is redeployed."}
        </p>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg text-maroon-deep">Backup &amp; Restore</h2>
        <p className="mb-4 text-sm text-charcoal-soft">
          A local copy of your plan is kept in this browser even when cloud sync is active. Export a backup
          regularly, especially before clearing browser data.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-full bg-maroon px-4 py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep"
          >
            <Download size={16} /> Export Backup (JSON)
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 rounded-full border border-maroon px-4 py-2.5 text-sm font-medium text-maroon transition hover:bg-peach/40"
          >
            <Upload size={16} /> Import Backup
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
        </div>
        {message && <p className="mt-3 text-sm text-charcoal-soft">{message}</p>}
      </Card>

      <Card className="border-[#e3c7c7] bg-[#fdf5f5]">
        <h2 className="mb-1 flex items-center gap-2 text-lg text-maroon-deep">
          <ShieldAlert size={18} /> Data &amp; Privacy
        </h2>
        <p className="text-sm text-charcoal-soft">
          The current Firebase workspace is shared and has no user login. Anyone granted access by your Firestore
          rules can read or change it. Don't store ID proofs, signed contracts, bank details, or other sensitive
          information here.
        </p>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg text-maroon-deep">Reset</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setConfirmAction("fresh")}
            className="flex items-center gap-2 rounded-full border border-beige px-4 py-2.5 text-sm font-medium text-charcoal-soft transition hover:bg-cream-soft"
          >
            <RotateCcw size={16} /> Start Fresh (blank wedding)
          </button>
          <button
            onClick={() => setConfirmAction("reset")}
            className="flex items-center gap-2 rounded-full border border-[#c85a5a] px-4 py-2.5 text-sm font-medium text-[#c85a5a] transition hover:bg-[#fdf0f0]"
          >
            <Trash2 size={16} /> Delete All Wedding Data
          </button>
        </div>
      </Card>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-end bg-charcoal/40 sm:items-center sm:p-4">
          <div
            className="anim-sheet w-full max-w-sm rounded-t-3xl bg-cream p-6 sm:mx-auto sm:rounded-2xl sm:animate-none"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <h3 className="mb-2 text-lg text-maroon-deep">Are you sure?</h3>
            <p className="mb-5 text-sm text-charcoal-soft">
              {confirmAction === "reset"
                ? "This permanently deletes all wedding data stored in this browser and cannot be undone. Consider exporting a backup first."
                : "This clears the current plan and starts a brand-new blank wedding. Consider exporting a backup first."}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="min-h-11 rounded-full px-4 py-2.5 text-sm font-medium text-charcoal-soft"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmAction === "reset") await resetAllData();
                  if (confirmAction === "fresh") await startFresh();
                  setConfirmAction(null);
                }}
                className="min-h-11 rounded-full bg-[#c85a5a] px-4 py-2.5 text-sm font-medium text-white"
              >
                Yes, continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
