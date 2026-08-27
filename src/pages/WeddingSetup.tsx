import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import type { Couple, FoodPreference, PlanningPreferences, Tradition, TraditionSetup } from "../types/wedding";
import { Card } from "../components/common/Card";

const traditions: { value: Tradition; label: string }[] = [
  { value: "maharashtrian", label: "Maharashtrian" },
  { value: "tamil-iyer", label: "Tamil Iyer" },
  { value: "tamil-iyengar", label: "Tamil Iyengar" },
  { value: "telugu", label: "Telugu" },
  { value: "kannada", label: "Kannada" },
  { value: "north-indian", label: "North Indian" },
  { value: "bengali", label: "Bengali" },
  { value: "gujarati", label: "Gujarati" },
  { value: "konkani", label: "Konkani" },
  { value: "custom", label: "Other / Custom" },
];

const steps = ["Couple Details", "Tradition", "Planning Preferences"] as const;

export function WeddingSetup() {
  const { workspace, completeOnboarding } = useWedding();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [couple, setCouple] = useState<Couple>(
    workspace?.wedding.couple ?? {
      groomName: "",
      brideName: "",
      weddingDate: "",
      weddingTime: "",
      weddingVenue: "",
      city: "",
      hashtag: "",
    }
  );

  const [tradition, setTradition] = useState<TraditionSetup>(
    workspace?.wedding.tradition ?? {
      region: "",
      familyTradition: "custom",
      language: "",
      foodPreference: "vegetarian",
    }
  );

  const [planning, setPlanning] = useState<PlanningPreferences>(
    workspace?.wedding.planning ?? {
      currency: "INR",
      totalBudget: 0,
      expectedGuestCount: 0,
      planningStartDate: new Date().toISOString().slice(0, 10),
    }
  );

  const canProceedFromStep1 = couple.groomName.trim() && couple.brideName.trim() && couple.weddingDate;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCouple((c) => ({ ...c, couplePhotoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

  const handleFinish = async () => {
    const base = workspace?.wedding;
    await completeOnboarding({
      id: base?.id ?? crypto.randomUUID(),
      isSampleData: false,
      couple,
      tradition,
      planning,
      events: base?.events ?? [],
      family: base?.family ?? [],
      onboardingComplete: true,
      createdAt: base?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl text-maroon-deep">Wedding Tradition Setup</h1>
        <p className="mt-1 text-sm text-charcoal-soft">
          Tell us the basics. Every ritual and custom stays fully editable later — nothing here is locked in.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                i <= step ? "bg-maroon text-cream" : "bg-beige text-charcoal-soft"
              }`}
            >
              {i + 1}
            </div>
            <span className={`hidden text-xs sm:block ${i <= step ? "text-maroon-deep" : "text-charcoal-soft"}`}>
              {label}
            </span>
            {i < steps.length - 1 && <div className="h-px flex-1 bg-beige" />}
          </div>
        ))}
      </div>

      <Card>
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <div className="h-full w-full overflow-hidden rounded-full border-2 border-gold-soft bg-cream-soft">
                  {couple.couplePhotoUrl ? (
                    <img src={couple.couplePhotoUrl} alt="Couple" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-xl text-maroon">
                      {initials(couple.groomName)}
                      <span className="mx-0.5 text-charcoal-soft/50">&amp;</span>
                      {initials(couple.brideName)}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="couple-photo-upload"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-maroon text-cream shadow-md transition hover:bg-maroon-deep"
                  aria-label="Upload couple photo"
                >
                  <Camera size={13} />
                </label>
                <input
                  id="couple-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
              </div>
              <div className="text-sm">
                <p className="font-medium text-charcoal">Couple Photo</p>
                <p className="text-charcoal-soft">This appears on your dashboard's countdown. Optional — a monogram is shown until you add one.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Groom's Name">
                <input
                  className="input"
                  value={couple.groomName}
                  onChange={(e) => setCouple({ ...couple, groomName: e.target.value })}
                />
              </Field>
              <Field label="Bride's Name">
                <input
                  className="input"
                  value={couple.brideName}
                  onChange={(e) => setCouple({ ...couple, brideName: e.target.value })}
                />
              </Field>
              <Field label="Wedding Date">
                <input
                  type="date"
                  className="input"
                  value={couple.weddingDate}
                  onChange={(e) => setCouple({ ...couple, weddingDate: e.target.value })}
                />
              </Field>
              <Field label="Wedding Time">
                <input
                  type="time"
                  className="input"
                  value={couple.weddingTime}
                  onChange={(e) => setCouple({ ...couple, weddingTime: e.target.value })}
                />
              </Field>
              <Field label="Venue">
                <input
                  className="input"
                  value={couple.weddingVenue}
                  onChange={(e) => setCouple({ ...couple, weddingVenue: e.target.value })}
                />
              </Field>
              <Field label="City">
                <input
                  className="input"
                  value={couple.city}
                  onChange={(e) => setCouple({ ...couple, city: e.target.value })}
                />
              </Field>
              <Field label="Wedding Hashtag (optional)">
                <input
                  className="input"
                  placeholder="#NameWedsName"
                  value={couple.hashtag}
                  onChange={(e) => setCouple({ ...couple, hashtag: e.target.value })}
                />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Region / State">
              <input
                className="input"
                value={tradition.region}
                onChange={(e) => setTradition({ ...tradition, region: e.target.value })}
              />
            </Field>
            <Field label="Family Tradition">
              <select
                className="input"
                value={tradition.familyTradition}
                onChange={(e) => setTradition({ ...tradition, familyTradition: e.target.value as Tradition })}
              >
                {traditions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Community / Sub-community (optional)">
              <input
                className="input"
                value={tradition.communityNote ?? ""}
                onChange={(e) => setTradition({ ...tradition, communityNote: e.target.value })}
              />
            </Field>
            <Field label="Preferred Language">
              <input
                className="input"
                value={tradition.language}
                onChange={(e) => setTradition({ ...tradition, language: e.target.value })}
              />
            </Field>
            <Field label="Bride's Family Customs (optional)">
              <textarea
                className="input"
                rows={2}
                value={tradition.brideFamilyCustoms ?? ""}
                onChange={(e) => setTradition({ ...tradition, brideFamilyCustoms: e.target.value })}
              />
            </Field>
            <Field label="Groom's Family Customs (optional)">
              <textarea
                className="input"
                rows={2}
                value={tradition.groomFamilyCustoms ?? ""}
                onChange={(e) => setTradition({ ...tradition, groomFamilyCustoms: e.target.value })}
              />
            </Field>
            <Field label="Food Preference">
              <select
                className="input"
                value={tradition.foodPreference}
                onChange={(e) => setTradition({ ...tradition, foodPreference: e.target.value as FoodPreference })}
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-vegetarian</option>
                <option value="mixed">Mixed</option>
              </select>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Total Budget (₹)">
              <input
                type="number"
                min={0}
                className="input"
                value={planning.totalBudget}
                onChange={(e) => setPlanning({ ...planning, totalBudget: Number(e.target.value) })}
              />
            </Field>
            <Field label="Expected Guest Count">
              <input
                type="number"
                min={0}
                className="input"
                value={planning.expectedGuestCount}
                onChange={(e) => setPlanning({ ...planning, expectedGuestCount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Planning Start Date">
              <input
                type="date"
                className="input"
                value={planning.planningStartDate}
                onChange={(e) => setPlanning({ ...planning, planningStartDate: e.target.value })}
              />
            </Field>
            <Field label="Engagement Date (optional)">
              <input
                type="date"
                className="input"
                value={planning.engagementDate ?? ""}
                onChange={(e) => setPlanning({ ...planning, engagementDate: e.target.value })}
              />
            </Field>
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-charcoal-soft disabled:opacity-0"
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && !canProceedFromStep1}
            className="rounded-full bg-maroon px-6 py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="rounded-full bg-maroon px-6 py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep"
          >
            Save &amp; Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-charcoal-soft">{label}</span>
      {children}
    </label>
  );
}
