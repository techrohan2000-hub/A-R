import type { InvitationChannel, WeddingEventSummary } from "../../types/wedding";

export interface InvitationTemplateInput {
  guestName: string;
  groomName: string;
  brideName: string;
  event: WeddingEventSummary;
  defaultVenue: string;
  city: string;
  rsvpText: string;
  signature: string;
  customNote?: string;
}

export function normalizePhone(phone: string, defaultCountryCode = "91") {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10) digits = `${defaultCountryCode}${digits}`;
  return digits;
}

export function isValidPhone(phone: string) {
  const digits = normalizePhone(phone);
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function readableDate(value: string) {
  if (!value) return "the planned date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function buildInvitationMessage(input: InvitationTemplateInput) {
  const venue = input.event.venue || input.defaultVenue;
  const lines = [
    `Dear ${input.guestName},`,
    "",
    `${input.groomName} & ${input.brideName} warmly invite you to ${input.event.name}.`,
    `Date: ${readableDate(input.event.date)}`,
    input.event.time ? `Time: ${input.event.time}` : "",
    venue ? `Venue: ${venue}${input.city ? `, ${input.city}` : ""}` : "",
    input.customNote?.trim() || "",
    "",
    input.rsvpText.trim(),
    input.signature.trim(),
  ];
  return lines.filter((line, index) => line || lines[index - 1] !== "").join("\n").trim();
}

export function buildComposerUrl(
  channel: InvitationChannel,
  contact: { phone?: string; email?: string },
  message: string,
  subject: string
) {
  if (channel === "email") {
    if (!contact.email || !isValidEmail(contact.email)) throw new Error("Add a valid guest email first.");
    return `mailto:${encodeURIComponent(contact.email.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  }

  if (!contact.phone || !isValidPhone(contact.phone)) throw new Error("Add a valid guest phone number first.");
  const phone = normalizePhone(contact.phone);
  if (channel === "whatsapp") return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return `sms:${phone}?body=${encodeURIComponent(message)}`;
}
