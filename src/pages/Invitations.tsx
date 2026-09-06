import { useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Copy, Download, ImagePlus, Mail, MessageCircle, Pencil, Send, Smartphone } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import { useI18n } from "../hooks/useI18n";
import type { InvitationChannel, InvitationStyle } from "../types/wedding";
import {
  buildComposerUrl,
  buildInvitationMessage,
  canShareFiles,
  copyImageToClipboard,
  defaultInvitationTemplate,
  downloadBlob,
  invitationCardBlob,
  invitationCardFileName,
  shareInvitationCard,
  type InvitationTemplateInput,
} from "../services/invitations";
import { InvitationCardPreview } from "../components/invitations/InvitationCardPreview";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { Field } from "../components/common/Field";

const channelIcons: Record<InvitationChannel, typeof Mail> = {
  whatsapp: MessageCircle,
  email: Mail,
  sms: Smartphone,
};

const styleKeys: { value: InvitationStyle; label: string; hint: string }[] = [
  { value: "warm", label: "invitations.moodWarm", hint: "invitations.moodWarmHint" },
  { value: "traditional", label: "invitations.moodTraditional", hint: "invitations.moodTraditionalHint" },
  { value: "festive", label: "invitations.moodFestive", hint: "invitations.moodFestiveHint" },
  { value: "poetic", label: "invitations.moodPoetic", hint: "invitations.moodPoeticHint" },
];

function ChoiceGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="text-sm">
      <p className="mb-1.5 font-medium text-charcoal-soft">{label}</p>
      {children}
    </div>
  );
}

export function Invitations() {
  const { workspace, addInvitation, saveReminderPreferences } = useWedding();
  const { language, t, isMr } = useI18n();
  const [eventId, setEventId] = useState("");
  const [channel, setChannel] = useState<InvitationChannel>("whatsapp");
  const [style, setStyle] = useState<InvitationStyle>("traditional");
  const [selected, setSelected] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");
  const [includeCard, setIncludeCard] = useState(true);
  const [openedGuestId, setOpenedGuestId] = useState<string | null>(null);
  const [busyGuestId, setBusyGuestId] = useState<string | null>(null);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [guestDrafts, setGuestDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [enDraft, setEnDraft] = useState("");
  const [mrDraft, setMrDraft] = useState("");
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [appliedKey, setAppliedKey] = useState<string | null>(null);

  const channelLabel = (value: InvitationChannel) => (
    value === "whatsapp" ? "WhatsApp" : value === "email" ? "Email" : "SMS"
  );

  const enabledEvents = useMemo(() => {
    const listed = workspace?.wedding.events.filter((event) => event.enabled) ?? [];
    if (listed.length) return listed;
    const couple = workspace?.wedding.couple;
    return [{
      id: "wedding-day",
      name: t("invitations.weddingFallback"),
      date: couple?.weddingDate || "",
      time: couple?.weddingTime || "",
      venue: couple?.weddingVenue || "",
      enabled: true,
    }];
  }, [t, workspace]);

  const savedEn = workspace?.reminderPreferences.invitationMessageEn ?? "";
  const savedMr = workspace?.reminderPreferences.invitationMessageMr ?? "";
  const savedKey = `${savedEn}::${savedMr}`;
  if (workspace && appliedKey !== savedKey) {
    setAppliedKey(savedKey);
    setEnDraft(savedEn || defaultInvitationTemplate("traditional", "en"));
    setMrDraft(savedMr || defaultInvitationTemplate("traditional", "mr"));
  }
  if (!workspace) return null;
  const activeEventId = eventId || enabledEvents[0]?.id || "";
  const event = enabledEvents.find((entry) => entry.id === activeEventId);
  const selectedGuests = workspace.guests.filter((guest) => selected.includes(guest.id));
  const sentGuestIds = new Set(workspace.invitations.filter((invitation) => invitation.status === "sent").map((invitation) => invitation.guestId));
  const previewGuestName = selectedGuests[0]?.name || t("invitations.previewGuest");

  const templateInput = (guestName: string): InvitationTemplateInput | null => {
    if (!event) return null;
    return {
      guestName,
      groomName: workspace.wedding.couple.groomName,
      brideName: workspace.wedding.couple.brideName,
      event,
      defaultVenue: workspace.wedding.couple.weddingVenue,
      city: workspace.wedding.couple.city,
      rsvpText: workspace.reminderPreferences.rsvpText,
      signature: workspace.reminderPreferences.invitationSignature,
      customNote,
      language,
      style,
      customTemplateEn: enDraft,
      customTemplateMr: mrDraft,
    };
  };

  const builtText = (guestName: string) => {
    const input = templateInput(guestName);
    return input ? buildInvitationMessage(input) : "";
  };

  const invitationText = (guestId: string, guestName: string) => guestDrafts[guestId] ?? builtText(guestName);

  const applyMood = (next: InvitationStyle) => {
    setStyle(next);
    setEnDraft(defaultInvitationTemplate(next, "en"));
    setMrDraft(defaultInvitationTemplate(next, "mr"));
    setGuestDrafts({});
  };

  const saveDefaults = async () => {
    setSavingDefaults(true);
    try {
      await saveReminderPreferences({
        ...workspace.reminderPreferences,
        invitationMessageEn: enDraft,
        invitationMessageMr: mrDraft,
      });
      setMessage(t("invitations.savedDefault"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("invitations.saveFailed"));
    } finally {
      setSavingDefaults(false);
    }
  };

  const recordOpened = async (guestId: string, text: string) => {
    if (!event) return;
    await addInvitation({
      guestId,
      eventId: event.id,
      channel,
      message: text,
      status: "opened",
      openedAt: new Date().toISOString(),
    });
    setOpenedGuestId(guestId);
  };

  const makeCardFile = async (guestName: string) => {
    const input = templateInput(guestName);
    if (!input || !event) throw new Error(t("invitations.chooseEvent"));
    const blob = await invitationCardBlob({ ...input, hashtag: workspace.wedding.couple.hashtag });
    return new File([blob], invitationCardFileName(guestName, event.name), { type: "image/png" });
  };

  const openComposer = async (guestId: string, withImage: boolean) => {
    if (!event) return;
    const guest = workspace.guests.find((entry) => entry.id === guestId);
    if (!guest) return;
    setBusyGuestId(guestId);
    try {
      const text = invitationText(guestId, guest.name);
      const subject = t("invitations.subject", { event: event.name });
      if (withImage) {
        const file = await makeCardFile(guest.name);
        if (canShareFiles()) {
          await shareInvitationCard({ title: subject, text, file });
          await recordOpened(guestId, text);
          setMessage(t("invitations.sharedCard", { channel: channelLabel(channel), name: guest.name }));
          return;
        }
        downloadBlob(file, file.name);
        const url = buildComposerUrl(channel, guest, text, subject);
        window.open(url, "_blank", "noopener,noreferrer");
        await recordOpened(guestId, text);
        setMessage(t("invitations.downloadedCard", { name: guest.name, channel: channelLabel(channel) }));
        return;
      }
      const url = buildComposerUrl(channel, guest, text, subject);
      window.open(url, "_blank", "noopener,noreferrer");
      await recordOpened(guestId, text);
      setMessage(t("invitations.openedChannel", { channel: channelLabel(channel), name: guest.name }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("invitations.openFailed"));
    } finally {
      setBusyGuestId(null);
    }
  };

  const downloadPreviewCard = async () => {
    try {
      const file = await makeCardFile(previewGuestName);
      downloadBlob(file, file.name);
      setMessage(t("invitations.downloadedPreview"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("invitations.downloadFailed"));
    }
  };

  const copyPreviewCard = async () => {
    try {
      const file = await makeCardFile(previewGuestName);
      await copyImageToClipboard(file);
      setMessage(t("invitations.copiedPreview"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("invitations.copyFailed"));
    }
  };

  const markSent = async (guestId: string) => {
    if (!event) return;
    const guest = workspace.guests.find((entry) => entry.id === guestId);
    if (!guest) return;
    await addInvitation({
      guestId,
      eventId: event.id,
      channel,
      message: invitationText(guestId, guest.name),
      status: "sent",
      openedAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    });
    setOpenedGuestId(null);
    setMessage(t("invitations.markedSent", { name: guest.name }));
  };

  const toggleGuestEditor = (guestId: string, guestName: string) => {
    setEditingGuestId((current) => {
      if (current === guestId) return null;
      setGuestDrafts((drafts) => drafts[guestId] ? drafts : { ...drafts, [guestId]: builtText(guestName) });
      return guestId;
    });
  };

  if (!workspace.guests.length) {
    return <EmptyState icon={Mail} title={t("invitations.emptyTitle")} description={t("invitations.emptyBody")} />;
  }

  const previewInput = templateInput(previewGuestName);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-gold-soft/70 bg-gradient-to-br from-white via-cream-soft to-peach/35 p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{t("invitations.kicker")}</p>
        <h2 className="mt-1 text-xl text-maroon-deep sm:text-2xl">{t("invitations.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm text-charcoal-soft">{t("invitations.intro")}</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <Card>
          <div className="space-y-4">
            <Field label={t("invitations.event")}>
              <select className="input" value={activeEventId} onChange={(e) => setEventId(e.target.value)}>
                {enabledEvents.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}{entry.date ? ` · ${entry.date}` : ""}</option>)}
              </select>
            </Field>
            <ChoiceGroup label={t("invitations.mood")}>
              <div className="grid grid-cols-2 gap-2">
                {styleKeys.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => applyMood(option.value)}
                    className={`rounded-xl border p-3 text-left ${style === option.value ? "border-maroon bg-peach/30" : "border-beige"}`}
                  >
                    <span className="block text-sm font-medium text-maroon-deep">{t(option.label)}</span>
                    <span className="mt-0.5 block text-[11px] text-charcoal-soft">{t(option.hint)}</span>
                  </button>
                ))}
              </div>
            </ChoiceGroup>
            <ChoiceGroup label={t("invitations.channel")}>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(channelIcons) as InvitationChannel[]).map((value) => {
                  const Icon = channelIcons[value];
                  return (
                    <button key={value} onClick={() => setChannel(value)} className={`rounded-xl border p-3 text-xs font-medium ${channel === value ? "border-maroon bg-peach/30 text-maroon" : "border-beige text-charcoal-soft"}`}>
                      <Icon size={18} className="mx-auto mb-1" /> {channelLabel(value)}
                    </button>
                  );
                })}
              </div>
            </ChoiceGroup>
            <Field label={t("invitations.personalNote")}>
              <textarea rows={3} className="input resize-none" value={customNote} onChange={(e) => setCustomNote(e.target.value)} placeholder={t("invitations.notePlaceholder")} />
            </Field>
            <label className="flex items-start gap-3 rounded-xl border border-gold-soft/60 bg-cream-soft/70 p-3 text-sm">
              <input type="checkbox" checked={includeCard} onChange={(event) => setIncludeCard(event.target.checked)} className="mt-0.5 h-4 w-4 accent-maroon" />
              <span>
                <span className="block font-medium text-charcoal">{t("invitations.cardImage")}</span>
                <span className="mt-0.5 block text-xs text-charcoal-soft">{t("invitations.cardHint")}</span>
              </span>
            </label>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg text-maroon-deep">{t("invitations.selectGuests")}</h3>
            <button
              onClick={() => setSelected(selected.length === workspace.guests.length ? [] : workspace.guests.map((guest) => guest.id))}
              className="text-xs font-medium text-maroon"
            >
              {selected.length === workspace.guests.length ? t("invitations.clearAll") : t("invitations.selectAll")}
            </button>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {workspace.guests.map((guest) => (
              <label key={guest.id} className="flex items-center justify-between gap-3 rounded-xl border border-beige/70 p-3">
                <span className="flex min-w-0 items-center gap-3">
                  <input type="checkbox" aria-label={`Select ${guest.name}`} checked={selected.includes(guest.id)} onChange={() => setSelected((current) => current.includes(guest.id) ? current.filter((id) => id !== guest.id) : [...current, guest.id])} className="h-4 w-4 accent-maroon" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{guest.name}</span>
                    <span className="block truncate text-xs text-charcoal-soft">{channel === "email" ? guest.email || t("invitations.emailMissing") : guest.phone || t("invitations.phoneMissing")}</span>
                  </span>
                </span>
                {sentGuestIds.has(guest.id) && <CheckCircle2 size={17} className="shrink-0 text-green-700" />}
              </label>
            ))}
          </div>
        </Card>
      </div>

      {previewInput && (
        <Card>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg text-maroon-deep">{t("invitations.defaultTitle")}</h3>
              <p className="text-xs text-charcoal-soft">{t("invitations.defaultHint")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={copyPreviewCard} className="flex items-center gap-1.5 rounded-full border border-maroon px-3 py-1.5 text-xs font-medium text-maroon hover:bg-peach/30">
                <Copy size={13} /> {t("invitations.copyImage")}
              </button>
              <button onClick={downloadPreviewCard} className="flex items-center gap-1.5 rounded-full border border-maroon px-3 py-1.5 text-xs font-medium text-maroon hover:bg-peach/30">
                <Download size={13} /> {t("invitations.downloadCard")}
              </button>
              <button onClick={saveDefaults} disabled={savingDefaults} className="rounded-full bg-maroon px-3 py-1.5 text-xs font-medium text-white hover:bg-maroon-deep disabled:opacity-60">
                {t("invitations.saveDefault")}
              </button>
            </div>
          </div>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,340px)_1fr]">
            <InvitationCardPreview input={previewInput} hashtag={workspace.wedding.couple.hashtag} />
            <div className="space-y-4">
              <Field label={t("invitations.invitationLabel")}>
                <textarea
                  aria-label={language === "mr" ? "Marathi invitation" : "English invitation"}
                  rows={14}
                  className={`input resize-y text-sm ${isMr ? "font-marathi" : "font-sans"}`}
                  value={language === "mr" ? mrDraft : enDraft}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (language === "mr") setMrDraft(value);
                    else setEnDraft(value);
                    setGuestDrafts({});
                  }}
                />
              </Field>
              <div>
                <p className="mb-1.5 text-xs font-medium text-charcoal-soft">{t("invitations.previewFor", { name: previewGuestName })}</p>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-xl bg-cream-soft p-4 font-sans text-sm text-charcoal-soft">{builtText(previewGuestName)}</pre>
              </div>
            </div>
          </div>
        </Card>
      )}

      {selectedGuests.length > 0 && event && (
        <Card>
          <h3 className="text-lg text-maroon-deep">{t("invitations.sendQueue", { count: selectedGuests.length })}</h3>
          <p className="mb-4 mt-1 text-xs text-charcoal-soft">{t("invitations.sendHint")}</p>
          <div className="space-y-3">
            {selectedGuests.map((guest) => {
              const customised = Boolean(guestDrafts[guest.id]);
              const editing = editingGuestId === guest.id;
              return (
                <div key={guest.id} className="space-y-3 rounded-xl border border-beige p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{guest.name}</span>
                      {customised && <span className="text-[11px] text-maroon">{t("invitations.customised")}</span>}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleGuestEditor(guest.id, guest.name)}
                        aria-expanded={editing}
                        className="flex items-center gap-1.5 rounded-full border border-maroon px-3 py-1.5 text-xs font-medium text-maroon hover:bg-peach/30"
                      >
                        <Pencil size={13} /> {editing ? t("invitations.hideMessage") : t("invitations.editMessage")}
                      </button>
                      <button
                        onClick={() => openComposer(guest.id, false)}
                        disabled={busyGuestId === guest.id}
                        className="flex items-center gap-1.5 rounded-full border border-maroon px-3 py-1.5 text-xs font-medium text-maroon hover:bg-peach/30 disabled:opacity-60"
                      >
                        <Send size={13} /> {t("invitations.openChannel", { channel: channelLabel(channel) })}
                      </button>
                      {includeCard && channel !== "sms" && (
                        <button
                          onClick={() => openComposer(guest.id, true)}
                          disabled={busyGuestId === guest.id}
                          className="flex items-center gap-1.5 rounded-full bg-maroon px-3 py-1.5 text-xs font-medium text-white hover:bg-maroon-deep disabled:opacity-60"
                        >
                          <ImagePlus size={13} /> {t("invitations.withCard", { channel: channelLabel(channel) })}
                        </button>
                      )}
                      {openedGuestId === guest.id && (
                        <button onClick={() => markSent(guest.id)} className="rounded-full bg-green-800 px-3 py-1.5 text-xs font-medium text-white">
                          {t("invitations.markSent")}
                        </button>
                      )}
                    </div>
                  </div>
                  {editing && (
                    <div>
                      <Field label={t("invitations.messageFor", { name: guest.name })}>
                        <textarea
                          aria-label={`Invitation for ${guest.name}`}
                          rows={10}
                          className={`input resize-y text-sm ${isMr ? "font-marathi" : "font-sans"}`}
                          value={guestDrafts[guest.id] ?? builtText(guest.name)}
                          onChange={(event) => setGuestDrafts((current) => ({ ...current, [guest.id]: event.target.value }))}
                        />
                      </Field>
                      <button
                        onClick={() => setGuestDrafts((current) => {
                          const next = { ...current };
                          delete next[guest.id];
                          return next;
                        })}
                        className="mt-2 text-xs font-medium text-maroon"
                      >
                        {t("invitations.useDefault")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {message && <p className="mt-3 text-sm text-charcoal-soft">{message}</p>}
        </Card>
      )}
    </div>
  );
}
