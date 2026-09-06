import { useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Copy, Download, ImagePlus, Mail, MessageCircle, Send, Smartphone } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import type { InvitationChannel, InvitationLanguage, InvitationStyle } from "../types/wedding";
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

const channelDetails: Record<InvitationChannel, { label: string; icon: typeof Mail }> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  email: { label: "Email", icon: Mail },
  sms: { label: "SMS", icon: Smartphone },
};

const languageOptions: { value: InvitationLanguage; label: string; hint: string }[] = [
  { value: "en", label: "English", hint: "Send in English" },
  { value: "mr", label: "मराठी", hint: "मराठीत पाठवा" },
];

const styleOptions: { value: InvitationStyle; label: string; en: string; mr: string }[] = [
  { value: "warm", label: "Warm", en: "Heartfelt and close", mr: "हार्दिक आणि जिव्हाळ्याचे" },
  { value: "traditional", label: "Traditional", en: "Blessings of elders", mr: "सप्रेम पारंपरिक निमंत्रण" },
  { value: "festive", label: "Festive", en: "Colour, music, joy", mr: "रंग, संगीत, आनंद" },
  { value: "poetic", label: "Poetic", en: "Two families, one celebration", mr: "दोन परिवार, एक सोहळा" },
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
  const [eventId, setEventId] = useState("");
  const [channel, setChannel] = useState<InvitationChannel>("whatsapp");
  const [language, setLanguage] = useState<InvitationLanguage>("en");
  const [style, setStyle] = useState<InvitationStyle>("traditional");
  const [selected, setSelected] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");
  const [includeCard, setIncludeCard] = useState(true);
  const [openedGuestId, setOpenedGuestId] = useState<string | null>(null);
  const [busyGuestId, setBusyGuestId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enDraft, setEnDraft] = useState("");
  const [mrDraft, setMrDraft] = useState("");
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [appliedKey, setAppliedKey] = useState<string | null>(null);

  const enabledEvents = useMemo(() => {
    const listed = workspace?.wedding.events.filter((event) => event.enabled) ?? [];
    if (listed.length) return listed;
    const couple = workspace?.wedding.couple;
    return [{
      id: "wedding-day",
      name: "Wedding",
      date: couple?.weddingDate || "",
      time: couple?.weddingTime || "",
      venue: couple?.weddingVenue || "",
      enabled: true,
    }];
  }, [workspace]);

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
  const previewGuestName = selectedGuests[0]?.name || "our beloved guest";

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

  const applyMood = (next: InvitationStyle) => {
    setStyle(next);
    setEnDraft(defaultInvitationTemplate(next, "en"));
    setMrDraft(defaultInvitationTemplate(next, "mr"));
  };

  const saveDefaults = async () => {
    if (!workspace) return;
    setSavingDefaults(true);
    try {
      await saveReminderPreferences({
        ...workspace.reminderPreferences,
        invitationMessageEn: enDraft,
        invitationMessageMr: mrDraft,
      });
      setMessage(language === "mr"
        ? "Default Marathi invitation saved for every guest."
        : "Default English invitation saved for every guest.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the default invitations.");
    } finally {
      setSavingDefaults(false);
    }
  };

  const invitationText = (guestName: string) => {
    const input = templateInput(guestName);
    return input ? buildInvitationMessage(input) : "";
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
    if (!input || !event) throw new Error("Choose an event first.");
    const blob = await invitationCardBlob({ ...input, hashtag: workspace.wedding.couple.hashtag });
    return new File([blob], invitationCardFileName(guestName, event.name), { type: "image/png" });
  };

  const openComposer = async (guestId: string, withImage: boolean) => {
    if (!event) return;
    const guest = workspace.guests.find((entry) => entry.id === guestId);
    if (!guest) return;
    setBusyGuestId(guestId);
    try {
      const text = invitationText(guest.name);
      const subject = `${event.name} invitation`;
      if (withImage) {
        const file = await makeCardFile(guest.name);
        if (canShareFiles()) {
          await shareInvitationCard({ title: subject, text, file });
          await recordOpened(guestId, text);
          setMessage(`Shared the ${channelDetails[channel].label} invitation card with ${guest.name}. Confirm below after sending.`);
          return;
        }
        downloadBlob(file, file.name);
        const url = buildComposerUrl(channel, guest, text, subject);
        window.open(url, "_blank", "noopener,noreferrer");
        await recordOpened(guestId, text);
        setMessage(`Card image downloaded for ${guest.name}. Attach it in ${channelDetails[channel].label}, then confirm below.`);
        return;
      }
      const url = buildComposerUrl(channel, guest, text, subject);
      window.open(url, "_blank", "noopener,noreferrer");
      await recordOpened(guestId, text);
      setMessage(`Opened ${channelDetails[channel].label} for ${guest.name}. Confirm below after sending.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not open the invitation.");
    } finally {
      setBusyGuestId(null);
    }
  };

  const downloadPreviewCard = async () => {
    try {
      const file = await makeCardFile(previewGuestName);
      downloadBlob(file, file.name);
      setMessage("Invitation card image downloaded. You can attach it in WhatsApp or email.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not download the card.");
    }
  };

  const copyPreviewCard = async () => {
    try {
      const file = await makeCardFile(previewGuestName);
      await copyImageToClipboard(file);
      setMessage("Invitation card copied. Paste it into WhatsApp or Gmail.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not copy the card.");
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
      message: invitationText(guest.name),
      status: "sent",
      openedAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    });
    setOpenedGuestId(null);
    setMessage(`Marked ${guest.name}'s invitation as sent.`);
  };

  if (!workspace.guests.length) {
    return <EmptyState icon={Mail} title="Add guests before sending invitations" description="Guest phone numbers and email addresses are used to open free message composers." />;
  }

  const previewInput = templateInput(previewGuestName);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-gold-soft/70 bg-gradient-to-br from-white via-cream-soft to-peach/35 p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Living invitation</p>
        <h2 className="mt-1 text-xl text-maroon-deep sm:text-2xl">A card people will actually want to open</h2>
        <p className="mt-2 max-w-2xl text-sm text-charcoal-soft">
          Choose English or Marathi — one language at a time. Then send a warm message, and optionally a card image, through WhatsApp or email.
        </p>
        <p className="mt-2 font-marathi text-sm text-maroon">इंग्रजी किंवा मराठी — एका वेळी एक भाषा. WhatsApp आणि ईमेलवर संदेशासोबत कार्डची प्रतिमाही पाठवता येते.</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <Card>
          <div className="space-y-4">
            <Field label="Event">
              <select className="input" value={activeEventId} onChange={(e) => setEventId(e.target.value)}>
                {enabledEvents.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}{entry.date ? ` · ${entry.date}` : ""}</option>)}
              </select>
            </Field>
            <ChoiceGroup label="Language / भाषा">
              <div className="grid grid-cols-2 gap-2">
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    aria-label={`Language: ${option.label}`}
                    aria-pressed={language === option.value}
                    onClick={() => setLanguage(option.value)}
                    className={`rounded-xl border p-3 text-center ${language === option.value ? "border-maroon bg-peach/30 text-maroon" : "border-beige text-charcoal-soft"}`}
                  >
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-tight">{option.hint}</span>
                  </button>
                ))}
              </div>
            </ChoiceGroup>
            <ChoiceGroup label="Invitation mood">
              <div className="grid grid-cols-2 gap-2">
                {styleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => applyMood(option.value)}
                    className={`rounded-xl border p-3 text-left ${style === option.value ? "border-maroon bg-peach/30" : "border-beige"}`}
                  >
                    <span className="block text-sm font-medium text-maroon-deep">{option.label}</span>
                    <span className="mt-0.5 block text-[11px] text-charcoal-soft">{option.en}</span>
                    <span className="block font-marathi text-[11px] text-maroon">{option.mr}</span>
                  </button>
                ))}
              </div>
            </ChoiceGroup>
            <ChoiceGroup label="Channel">
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(channelDetails) as [InvitationChannel, typeof channelDetails.whatsapp][]).map(([value, detail]) => {
                  const Icon = detail.icon;
                  return (
                    <button key={value} onClick={() => setChannel(value)} className={`rounded-xl border p-3 text-xs font-medium ${channel === value ? "border-maroon bg-peach/30 text-maroon" : "border-beige text-charcoal-soft"}`}>
                      <Icon size={18} className="mx-auto mb-1" /> {detail.label}
                    </button>
                  );
                })}
              </div>
            </ChoiceGroup>
            <Field label="Optional personal note">
              <textarea rows={3} className="input resize-none" value={customNote} onChange={(e) => setCustomNote(e.target.value)} placeholder={language === "mr" ? "तुमच्यासोबत हा आनंद साजरा करायला आम्हाला खूप आनंद होईल." : "We would be delighted to celebrate with you."} />
            </Field>
            <label className="flex items-start gap-3 rounded-xl border border-gold-soft/60 bg-cream-soft/70 p-3 text-sm">
              <input type="checkbox" checked={includeCard} onChange={(event) => setIncludeCard(event.target.checked)} className="mt-0.5 h-4 w-4 accent-maroon" />
              <span>
                <span className="block font-medium text-charcoal">Also send a card image</span>
                <span className="mt-0.5 block text-xs text-charcoal-soft">WhatsApp and email cannot auto-attach files from the browser. We download or share the card so you can attach it in one tap.</span>
                <span className="mt-0.5 block font-marathi text-xs text-maroon">WhatsApp / ईमेलमध्ये कार्डची प्रतिमा जोडण्यासाठी आम्ही ती डाउनलोड किंवा शेअर करतो.</span>
              </span>
            </label>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg text-maroon-deep">Select guests</h3>
            <button
              onClick={() => setSelected(selected.length === workspace.guests.length ? [] : workspace.guests.map((guest) => guest.id))}
              className="text-xs font-medium text-maroon"
            >
              {selected.length === workspace.guests.length ? "Clear all" : "Select all"}
            </button>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {workspace.guests.map((guest) => (
              <label key={guest.id} className="flex items-center justify-between gap-3 rounded-xl border border-beige/70 p-3">
                <span className="flex min-w-0 items-center gap-3">
                  <input type="checkbox" aria-label={`Select ${guest.name}`} checked={selected.includes(guest.id)} onChange={() => setSelected((current) => current.includes(guest.id) ? current.filter((id) => id !== guest.id) : [...current, guest.id])} className="h-4 w-4 accent-maroon" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{guest.name}</span>
                    <span className="block truncate text-xs text-charcoal-soft">{channel === "email" ? guest.email || "Email missing" : guest.phone || "Phone missing"}</span>
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
              <h3 className="text-lg text-maroon-deep">Edit default invitation</h3>
              <p className="text-xs text-charcoal-soft">This wording is used for every guest. Keep {"{guestName}"} so each message stays personal.</p>
              <p className="font-marathi text-xs text-maroon">हीच मसुदा सर्व पाहुण्यांसाठी. {"{guestName}"} ठेवा, म्हणजे प्रत्येक नाव आपोआप येईल.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={copyPreviewCard} className="flex items-center gap-1.5 rounded-full border border-maroon px-3 py-1.5 text-xs font-medium text-maroon hover:bg-peach/30">
                <Copy size={13} /> Copy image
              </button>
              <button onClick={downloadPreviewCard} className="flex items-center gap-1.5 rounded-full border border-maroon px-3 py-1.5 text-xs font-medium text-maroon hover:bg-peach/30">
                <Download size={13} /> Download card
              </button>
              <button onClick={saveDefaults} disabled={savingDefaults} className="rounded-full bg-maroon px-3 py-1.5 text-xs font-medium text-white hover:bg-maroon-deep disabled:opacity-60">
                Save default for all
              </button>
            </div>
          </div>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,340px)_1fr]">
            <InvitationCardPreview input={previewInput} hashtag={workspace.wedding.couple.hashtag} />
            <div className="space-y-4">
              {language === "mr" ? (
                <Field label="मराठी निमंत्रण">
                  <textarea
                    aria-label="Marathi invitation"
                    rows={14}
                    className="input resize-y font-marathi text-sm"
                    value={mrDraft}
                    onChange={(event) => setMrDraft(event.target.value)}
                  />
                </Field>
              ) : (
                <Field label="English invitation">
                  <textarea
                    aria-label="English invitation"
                    rows={14}
                    className="input resize-y font-sans text-sm"
                    value={enDraft}
                    onChange={(event) => setEnDraft(event.target.value)}
                  />
                </Field>
              )}
              <div>
                <p className="mb-1.5 text-xs font-medium text-charcoal-soft">Preview for {previewGuestName}</p>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-xl bg-cream-soft p-4 font-sans text-sm text-charcoal-soft">{invitationText(previewGuestName)}</pre>
              </div>
            </div>
          </div>
        </Card>
      )}

      {selectedGuests.length > 0 && event && (
        <Card>
          <h3 className="text-lg text-maroon-deep">Send queue ({selectedGuests.length})</h3>
          <p className="mb-4 mt-1 text-xs text-charcoal-soft">Messages are personalized with each guest’s name. Browsers require you to open them one at a time.</p>
          <div className="space-y-2">
            {selectedGuests.map((guest) => (
              <div key={guest.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-beige p-3">
                <span className="text-sm font-medium">{guest.name}</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openComposer(guest.id, false)}
                    disabled={busyGuestId === guest.id}
                    className="flex items-center gap-1.5 rounded-full border border-maroon px-3 py-1.5 text-xs font-medium text-maroon hover:bg-peach/30 disabled:opacity-60"
                  >
                    <Send size={13} /> Open {channelDetails[channel].label}
                  </button>
                  {includeCard && channel !== "sms" && (
                    <button
                      onClick={() => openComposer(guest.id, true)}
                      disabled={busyGuestId === guest.id}
                      className="flex items-center gap-1.5 rounded-full bg-maroon px-3 py-1.5 text-xs font-medium text-white hover:bg-maroon-deep disabled:opacity-60"
                    >
                      <ImagePlus size={13} /> {channelDetails[channel].label} with card
                    </button>
                  )}
                  {openedGuestId === guest.id && (
                    <button onClick={() => markSent(guest.id)} className="rounded-full bg-green-800 px-3 py-1.5 text-xs font-medium text-white">
                      Mark sent
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {message && <p className="mt-3 text-sm text-charcoal-soft">{message}</p>}
        </Card>
      )}
    </div>
  );
}
