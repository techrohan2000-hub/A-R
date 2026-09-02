import { useMemo, useState } from "react";
import { CheckCircle2, Mail, MessageCircle, Send, Smartphone } from "lucide-react";
import { useWedding } from "../hooks/useWedding";
import type { InvitationChannel } from "../types/wedding";
import { buildComposerUrl, buildInvitationMessage } from "../services/invitations";
import { Card } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";
import { Field } from "../components/common/Field";

const channelDetails: Record<InvitationChannel, { label: string; icon: typeof Mail }> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  email: { label: "Email", icon: Mail },
  sms: { label: "SMS", icon: Smartphone },
};

export function Invitations() {
  const { workspace, addInvitation } = useWedding();
  const [eventId, setEventId] = useState("");
  const [channel, setChannel] = useState<InvitationChannel>("whatsapp");
  const [selected, setSelected] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");
  const [openedGuestId, setOpenedGuestId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const enabledEvents = useMemo(() => workspace?.wedding.events.filter((event) => event.enabled) ?? [], [workspace]);
  if (!workspace) return null;
  const activeEventId = eventId || enabledEvents[0]?.id || "";
  const event = enabledEvents.find((entry) => entry.id === activeEventId);
  const selectedGuests = workspace.guests.filter((guest) => selected.includes(guest.id));
  const sentGuestIds = new Set(workspace.invitations.filter((invitation) => invitation.status === "sent").map((invitation) => invitation.guestId));

  const invitationText = (guestName: string) => {
    if (!event) return "";
    return buildInvitationMessage({
      guestName,
      groomName: workspace.wedding.couple.groomName,
      brideName: workspace.wedding.couple.brideName,
      event,
      defaultVenue: workspace.wedding.couple.weddingVenue,
      city: workspace.wedding.couple.city,
      rsvpText: workspace.reminderPreferences.rsvpText,
      signature: workspace.reminderPreferences.invitationSignature,
      customNote,
    });
  };

  const openComposer = async (guestId: string) => {
    if (!event) return;
    const guest = workspace.guests.find((entry) => entry.id === guestId);
    if (!guest) return;
    try {
      const text = invitationText(guest.name);
      const url = buildComposerUrl(channel, guest, text, `${event.name} invitation`);
      window.open(url, "_blank", "noopener,noreferrer");
      await addInvitation({
        guestId,
        eventId: event.id,
        channel,
        message: text,
        status: "opened",
        openedAt: new Date().toISOString(),
      });
      setOpenedGuestId(guestId);
      setMessage(`Opened ${channelDetails[channel].label} for ${guest.name}. Confirm below after sending.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not open the composer.");
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

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gold-soft/70 bg-gradient-to-br from-white via-cream-soft to-peach/35 p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Free invitation sharing</p>
        <h2 className="mt-1 text-xl text-maroon-deep sm:text-2xl">Invite your guests</h2>
        <p className="mt-2 max-w-2xl text-sm text-charcoal-soft">
          Choose guests, then open a prefilled WhatsApp, email, or SMS message. You stay in control and confirm each send.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <div className="space-y-4">
            <Field label="Event">
              <select className="input" value={activeEventId} onChange={(e) => setEventId(e.target.value)}>
                {enabledEvents.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} · {entry.date}</option>)}
              </select>
            </Field>
            <Field label="Channel">
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
            </Field>
            <Field label="Optional personal note">
              <textarea rows={3} className="input resize-none" value={customNote} onChange={(e) => setCustomNote(e.target.value)} placeholder="We would be delighted to celebrate with you." />
            </Field>
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
                  <input type="checkbox" checked={selected.includes(guest.id)} onChange={() => setSelected((current) => current.includes(guest.id) ? current.filter((id) => id !== guest.id) : [...current, guest.id])} className="h-4 w-4 accent-maroon" />
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

      {selectedGuests.length > 0 && event && (
        <Card>
          <h3 className="text-lg text-maroon-deep">Send queue ({selectedGuests.length})</h3>
          <p className="mb-4 mt-1 text-xs text-charcoal-soft">Messages are personalized with each guest’s name. Browsers require you to open them one at a time.</p>
          <pre className="mb-4 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl bg-cream-soft p-4 font-sans text-sm text-charcoal-soft">{invitationText(selectedGuests[0].name)}</pre>
          <div className="space-y-2">
            {selectedGuests.map((guest) => (
              <div key={guest.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-beige p-3">
                <span className="text-sm font-medium">{guest.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => openComposer(guest.id)} className="flex items-center gap-1.5 rounded-full border border-maroon px-3 py-1.5 text-xs font-medium text-maroon hover:bg-peach/30">
                    <Send size={13} /> Open {channelDetails[channel].label}
                  </button>
                  {openedGuestId === guest.id && (
                    <button onClick={() => markSent(guest.id)} className="rounded-full bg-maroon px-3 py-1.5 text-xs font-medium text-white">
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
