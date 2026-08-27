import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Upload, RotateCcw, Trash2, ShieldAlert, Pencil } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import { Card } from "../components/common/Card";

export function Settings() {
  const { workspace, exportBackup, importBackup, resetAllData, loadSampleData, startFresh } = useWedding();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | "reset" | "fresh">(null);

  if (!workspace) return null;
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
        <h2 className="mb-1 text-lg text-maroon-deep">Backup &amp; Restore</h2>
        <p className="mb-4 text-sm text-charcoal-soft">
          Your entire plan is stored locally in this browser. Export a backup regularly, especially before
          clearing your browser data.
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
          This app stores your wedding data locally in your browser only — it is not a secure, multi-user cloud
          database. Don't upload sensitive documents (ID proofs, contracts with signatures, bank details) here;
          keep those in a private, trusted location instead.
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
            onClick={() => loadSampleData()}
            className="flex items-center gap-2 rounded-full border border-beige px-4 py-2.5 text-sm font-medium text-charcoal-soft transition hover:bg-cream-soft"
          >
            <RotateCcw size={16} /> Reload Sample Data
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-cream p-6">
            <h3 className="mb-2 text-lg text-maroon-deep">Are you sure?</h3>
            <p className="mb-5 text-sm text-charcoal-soft">
              {confirmAction === "reset"
                ? "This permanently deletes all wedding data stored in this browser and cannot be undone. Consider exporting a backup first."
                : "This clears the current plan and starts a brand-new blank wedding. Consider exporting a backup first."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-charcoal-soft"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmAction === "reset") await resetAllData();
                  if (confirmAction === "fresh") await startFresh();
                  setConfirmAction(null);
                }}
                className="rounded-full bg-[#c85a5a] px-4 py-2 text-sm font-medium text-white"
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
