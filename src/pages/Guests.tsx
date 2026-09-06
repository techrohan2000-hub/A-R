import { useMemo, useState } from "react";
import { BedDouble, Heart, Mail, MapPinned, Pencil, Plus, Search, Trash2, Users, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWedding } from "../hooks/useWedding";
import type { FamilySide, GuestMealPreference, GuestSummary } from "../types/wedding";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Field } from "../components/common/Field";
import { ProgressBar } from "../components/common/ProgressBar";
import { guestHeadcount, guestInitials, sideAccent, sumHeadcount } from "../utils/guests";
import { useI18n } from "../hooks/useI18n";

type FormState = Omit<GuestSummary, "id">;

const emptyForm: FormState = {
  name: "",
  side: "both",
  phone: "",
  email: "",
  rsvp: "not-contacted",
  accommodationRequired: false,
  relation: "",
  partySize: 1,
  mealPreference: "veg",
  outstation: false,
  notes: "",
};

const rsvpStyles: Record<GuestSummary["rsvp"], string> = {
  "not-contacted": "bg-beige text-charcoal-soft",
  invited: "bg-peach/60 text-maroon-deep",
  maybe: "bg-[#f6e3d3] text-[#8a4a1f]",
  confirmed: "bg-[#e3ecd9] text-[#3f6b2c]",
  declined: "bg-[#f6dede] text-[#a13030]",
};

export function Guests() {
  const { workspace, addGuest, updateGuest, deleteGuest } = useWedding();
  const { t } = useI18n();
  const rsvpLabels: Record<GuestSummary["rsvp"], string> = {
    "not-contacted": t("guests.rsvpNotContacted"),
    invited: t("guests.rsvpInvited"),
    maybe: t("guests.rsvpMaybe"),
    confirmed: t("guests.rsvpConfirmed"),
    declined: t("guests.rsvpDeclined"),
  };
  const sideLabels: Record<FamilySide, string> = { bride: t("guests.brideSide"), groom: t("guests.groomSide"), both: t("guests.bothSides") };
  const mealLabels: Record<GuestMealPreference, string> = {
    veg: t("guests.mealVeg"),
    "non-veg": t("guests.mealNonVeg"),
    jain: t("guests.mealJain"),
    other: t("guests.mealOther"),
  };
  const [editing, setEditing] = useState<GuestSummary | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | FamilySide>("all");
  const [rsvpFilter, setRsvpFilter] = useState<"all" | GuestSummary["rsvp"]>("all");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!workspace) return null;
    const guests = workspace.guests;
    const confirmed = guests.filter((guest) => guest.rsvp === "confirmed");
    const awaiting = guests.filter((guest) => guest.rsvp === "invited" || guest.rsvp === "maybe" || guest.rsvp === "not-contacted");
    const expected = workspace.wedding.planning.expectedGuestCount || 0;
    const people = sumHeadcount(guests);
    return {
      households: guests.length,
      people,
      confirmedPeople: sumHeadcount(confirmed),
      awaitingHouseholds: awaiting.length,
      outstation: guests.filter((guest) => guest.outstation).length,
      stay: guests.filter((guest) => guest.accommodationRequired).length,
      expected,
      fill: expected ? Math.min(100, (people / expected) * 100) : 0,
      bride: sumHeadcount(guests.filter((guest) => guest.side === "bride")),
      groom: sumHeadcount(guests.filter((guest) => guest.side === "groom")),
      both: sumHeadcount(guests.filter((guest) => guest.side === "both")),
    };
  }, [workspace]);

  if (!workspace || !stats) return null;

  const guests = workspace.guests
    .filter((g) => filter === "all" || g.side === filter)
    .filter((g) => rsvpFilter === "all" || g.rsvp === rsvpFilter)
    .filter((g) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return [g.name, g.relation, g.phone, g.email, g.notes].filter(Boolean).join(" ").toLowerCase().includes(needle);
    });

  const grouped = (["bride", "groom", "both"] as const)
    .map((side) => ({ side, guests: guests.filter((guest) => guest.side === side) }))
    .filter((group) => group.guests.length);

  const openAdd = () => {
    setForm(emptyForm);
    setIsAdding(true);
  };
  const openEdit = (guest: GuestSummary) => {
    setForm({
      ...emptyForm,
      ...guest,
      partySize: guestHeadcount(guest),
      mealPreference: guest.mealPreference ?? "veg",
    });
    setEditing(guest);
  };
  const closeModal = () => {
    setIsAdding(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    const payload: FormState = {
      ...form,
      name: form.name.trim(),
      partySize: Math.max(1, Number(form.partySize) || 1),
      relation: form.relation?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      email: form.email?.trim() || undefined,
    };
    if (editing) {
      await updateGuest(editing.id, payload);
    } else {
      await addGuest(payload);
    }
    closeModal();
  };

  const setRsvp = async (guest: GuestSummary, rsvp: GuestSummary["rsvp"]) => {
    const { id, ...rest } = guest;
    await updateGuest(id, { ...rest, rsvp });
  };

  const sideTotal = stats.bride + stats.groom + stats.both || 1;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-gold-soft/70 bg-gradient-to-br from-white via-cream-soft to-peach/35 p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{t("guests.kicker")}</p>
        <h2 className="mt-1 text-xl text-maroon-deep sm:text-2xl">{t("guests.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm text-charcoal-soft">{t("guests.intro")}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: t("guests.people"), value: stats.people },
            { label: t("guests.families"), value: stats.households },
            { label: t("guests.coming"), value: stats.confirmedPeople },
            { label: t("guests.awaiting"), value: stats.awaitingHouseholds },
            { label: t("guests.fromAfar"), value: stats.outstation },
            { label: t("guests.needStay"), value: stats.stay },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/70 px-3 py-3 text-center shadow-[0_8px_20px_-16px_rgba(74,20,32,0.45)]">
              <p className="font-data text-2xl font-semibold text-maroon-deep">{item.value}</p>
              <p className="text-[11px] font-medium text-charcoal">{item.label}</p>
            </div>
          ))}
        </div>
        {stats.expected > 0 && (
          <div className="mt-4">
            <ProgressBar value={stats.fill} label={t("guests.expected", { people: stats.people, expected: stats.expected })} />
          </div>
        )}
        {stats.people > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] text-charcoal-soft">
              <span>{t("guests.brideSide")} · {stats.bride}</span>
              <span>{t("guests.both")} · {stats.both}</span>
              <span>{t("guests.groomSide")} · {stats.groom}</span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-beige">
              <div className="bg-maroon" style={{ width: `${(stats.bride / sideTotal) * 100}%` }} />
              <div className="bg-gold" style={{ width: `${(stats.both / sideTotal) * 100}%` }} />
              <div className="bg-[#c4a36a]" style={{ width: `${(stats.groom / sideTotal) * 100}%` }} />
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-4 flex max-w-full gap-1.5 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:px-0">
          {(["all", "bride", "groom", "both"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === f ? "bg-maroon text-cream" : "bg-cream-soft text-charcoal-soft hover:bg-peach/40"
              }`}
            >
              {f === "all" ? t("guests.allGuests") : sideLabels[f]}
            </button>
          ))}
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <label className="relative min-w-0 flex-1 sm:w-52 sm:flex-none">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-soft" />
            <input
              className="input py-2 pl-9 text-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("guests.search")}
            />
          </label>
          <select className="input min-w-0 flex-1 py-2 text-sm sm:flex-none sm:text-xs" value={rsvpFilter} onChange={(event) => setRsvpFilter(event.target.value as typeof rsvpFilter)}>
            <option value="all">{t("guests.allRsvp")}</option>
            {Object.entries(rsvpLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button
            onClick={openAdd}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-maroon px-4 py-2 text-sm font-medium text-cream transition hover:bg-maroon-deep"
          >
            <Plus size={16} /> {t("guests.addGuest")}
          </button>
        </div>
      </div>

      {guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title={workspace.guests.length ? t("guests.emptyFilterTitle") : t("guests.emptyTitle")}
          description={workspace.guests.length ? t("guests.emptyFilterBody") : t("guests.emptyBody")}
          actionLabel={workspace.guests.length ? undefined : t("guests.firstGuest")}
          onAction={workspace.guests.length ? undefined : openAdd}
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <section key={group.side}>
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-lg text-maroon-deep">{sideLabels[group.side]}</h3>
                <p className="text-xs text-charcoal-soft">{t("guests.peopleCount", { count: sumHeadcount(group.guests), families: group.guests.length === 1 ? t("guests.oneFamily") : t("guests.manyFamilies", { count: group.guests.length }) })}</p>
              </div>
              <div className="stagger-fade space-y-3">
                {group.guests.map((guest) => (
                  <Card key={guest.id} className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-cream ${sideAccent[guest.side]}`}>
                        {guestInitials(guest.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-charcoal">{guest.name}</p>
                          {guest.rsvp === "confirmed" && <Heart size={13} className="text-maroon" fill="currentColor" />}
                          <select
                            aria-label={`RSVP for ${guest.name}`}
                            className={`rounded-full border-0 px-2 py-0.5 text-[11px] font-medium ${rsvpStyles[guest.rsvp]}`}
                            value={guest.rsvp}
                            onChange={(event) => setRsvp(guest, event.target.value as GuestSummary["rsvp"])}
                          >
                            {Object.entries(rsvpLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <p className="mt-1 text-sm text-charcoal-soft">
                          {guest.relation ? `${guest.relation} · ` : ""}
                          {guestHeadcount(guest) === 1 ? t("guests.oneGuest") : t("guests.manyGuests", { count: guestHeadcount(guest) })}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-cream-soft px-2 py-0.5 text-[11px] text-charcoal-soft">
                            <Utensils size={11} /> {mealLabels[guest.mealPreference ?? "veg"]}
                          </span>
                          {guest.outstation && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-peach/50 px-2 py-0.5 text-[11px] text-maroon">
                              <MapPinned size={11} /> {t("guests.outstation")}
                            </span>
                          )}
                          {guest.accommodationRequired && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-peach/50 px-2 py-0.5 text-[11px] text-maroon">
                              <BedDouble size={11} /> {t("guests.stayNeeded")}
                            </span>
                          )}
                        </div>
                        {guest.notes && <p className="mt-2 line-clamp-2 text-xs italic text-charcoal-soft">“{guest.notes}”</p>}
                        {(guest.phone || guest.email) && <p className="mt-1 truncate text-xs text-charcoal-soft">{[guest.phone, guest.email].filter(Boolean).join(" · ")}</p>}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        onClick={() => navigate("/invitations")}
                        aria-label={`Invite ${guest.name}`}
                        className="rounded-full p-2 text-charcoal-soft hover:bg-peach/40 hover:text-maroon-deep"
                      >
                        <Mail size={16} />
                      </button>
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
            </section>
          ))}
        </div>
      )}

      {(isAdding || editing) && (
        <Modal title={editing ? t("guests.editGuest") : t("guests.addGuest")} onClose={closeModal}>
          <div className="space-y-4">
            <Field label={t("guests.name")}>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("guests.relation")}>
                <input className="input" value={form.relation || ""} onChange={(e) => setForm({ ...form, relation: e.target.value })} placeholder={t("guests.relationPlaceholder")} />
              </Field>
              <Field label={t("guests.partySize")}>
                <input type="number" min={1} max={30} className="input" value={form.partySize ?? 1} onChange={(e) => setForm({ ...form, partySize: Math.max(1, Number(e.target.value) || 1) })} />
              </Field>
            </div>
            <Field label={t("guests.side")}>
              <select
                className="input"
                value={form.side}
                onChange={(e) => setForm({ ...form, side: e.target.value as FamilySide })}
              >
                <option value="bride">{t("guests.brideSide")}</option>
                <option value="groom">{t("guests.groomSide")}</option>
                <option value="both">{t("guests.bothSides")}</option>
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("guests.phone")}>
                <input type="tel" className="input" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              </Field>
              <Field label={t("guests.email")}>
                <input type="email" className="input" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="family@example.com" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("guests.rsvp")}>
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
              <Field label={t("guests.meal")}>
                <select
                  className="input"
                  value={form.mealPreference ?? "veg"}
                  onChange={(e) => setForm({ ...form, mealPreference: e.target.value as GuestMealPreference })}
                >
                  {Object.entries(mealLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label={t("guests.note")}>
              <textarea rows={2} className="input resize-none" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t("guests.notePlaceholder")} />
            </Field>
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.outstation === true}
                onChange={(e) => setForm({ ...form, outstation: e.target.checked })}
                className="h-4 w-4 rounded border-beige accent-maroon"
              />
              <span className="text-charcoal-soft">{t("guests.fromTown")}</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.accommodationRequired}
                onChange={(e) => setForm({ ...form, accommodationRequired: e.target.checked })}
                className="h-4 w-4 rounded border-beige accent-maroon"
              />
              <span className="text-charcoal-soft">{t("guests.needsStay")}</span>
            </label>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim()}
              className="w-full rounded-full bg-maroon py-2.5 text-sm font-medium text-cream transition hover:bg-maroon-deep disabled:opacity-50"
            >
              {editing ? t("common.saveChanges") : t("guests.addGuest")}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDialog
          title={t("guests.deleteTitle")}
          description={t("common.cannotUndo")}
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
