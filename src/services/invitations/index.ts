import type { InvitationChannel, InvitationLanguage, InvitationStyle, WeddingEventSummary } from "../../types/wedding";

export type { InvitationLanguage, InvitationStyle };

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
  language?: InvitationLanguage;
  style?: InvitationStyle;
  customTemplateEn?: string;
  customTemplateMr?: string;
}

const DEFAULT_RSVP_EN = "Please let us know if you can join us.";
const DEFAULT_RSVP_MR = "कृपया आपण येऊ शकता का ते आम्हाला कळवा.";
const DEFAULT_SIG_EN = "With warm regards, the wedding family";
const DEFAULT_SIG_MR = "आपले स्नेहांकित,\nलग्न परिवार";

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

export function readableDate(value: string, locale: "en-IN" | "mr-IN" = "en-IN") {
  if (!value) return locale === "mr-IN" ? "नियोजित दिवशी" : "the planned date";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function compactLines(lines: string[]) {
  return lines.filter((line, index) => line || lines[index - 1] !== "").join("\n").trim();
}

function rsvpFor(input: InvitationTemplateInput, locale: "en" | "mr") {
  const text = input.rsvpText.trim();
  if (locale === "mr") {
    if (!text || text === DEFAULT_RSVP_EN) return DEFAULT_RSVP_MR;
    return text;
  }
  return text || DEFAULT_RSVP_EN;
}

function signatureFor(input: InvitationTemplateInput, locale: "en" | "mr") {
  const text = input.signature.trim();
  if (locale === "mr") {
    if (!text || text === DEFAULT_SIG_EN) return DEFAULT_SIG_MR;
    return text;
  }
  return text || DEFAULT_SIG_EN;
}

const englishOpenings: Record<InvitationStyle, string> = {
  warm: `Dear {guestName},\n\n{groomName} & {brideName} warmly invite you to {event}.`,
  traditional: `With the blessings of our elders\n\nDear {guestName},\n\n{groomName} & {brideName} request the honour of your presence at {event}.`,
  festive: `✨ You're invited ✨\n\nDear {guestName},\n\nThe mandap is ready, the music is waiting, and {event} will not feel complete without you.\nCome celebrate colour, laughter and blessings with {groomName} & {brideName}.`,
  poetic: `Two families. One celebration. A lifetime of togetherness.\n\nDear {guestName},\n\n{groomName} & {brideName} would be honoured if you shared the joy of {event}.`,
};

const marathiOpenings: Record<InvitationStyle, string> = {
  warm: `प्रिय {guestName},\n\n{groomName} आणि {brideName} आपणांस {event} सोहळ्यात सहभागी होण्यासाठी हार्दिक आमंत्रित करतात.`,
  traditional: `॥ श्री गणेशाय नमः ॥\n॥ शुभ विवाह निमंत्रण ॥\n\nसप्रेम निमंत्रण\n\nप्रिय {guestName},\n\nवडीलधाऱ्यांच्या आशीर्वादाने {groomName} आणि {brideName} यांच्या {event} प्रसंगी आपणांस सादर निमंत्रित करत आहोत.`,
  festive: `✨ शुभ निमंत्रण ✨\n\nप्रिय {guestName},\n\nमंगल संगीत तयार आहे, मंडप सजला आहे — आणि {event} आपल्याशिवाय पूर्ण होणार नाही!\n{groomName} आणि {brideName} सोबत रंगात, हसण्यात आणि आशीर्वादात सामील व्हा.`,
  poetic: `दोन परिवार. एक सोहळा. आयुष्यभराचा सोबत.\n\nप्रिय {guestName},\n\n{groomName} आणि {brideName} यांच्या {event} च्या आनंदात आपण भागीदार व्हावे, ही आमची हार्दिक इच्छा.`,
};

export function defaultInvitationTemplate(style: InvitationStyle, locale: "en" | "mr") {
  if (locale === "mr") {
    return compactLines([
      marathiOpenings[style],
      "{dateLineMr}",
      "{timeLineMr}",
      "{venueLineMr}",
      "{note}",
      "",
      "{rsvpMr}",
      "{signatureMr}",
    ].join("\n").split("\n"));
  }
  return compactLines([
    englishOpenings[style],
    "{dateLine}",
    "{timeLine}",
    "{venueLine}",
    "{note}",
    "",
    "{rsvp}",
    "{signature}",
  ].join("\n").split("\n"));
}

export function invitationVars(input: InvitationTemplateInput): Record<string, string> {
  const venue = input.event.venue || input.defaultVenue;
  const place = venue ? (input.city ? `${venue}, ${input.city}` : venue) : "";
  return {
    guestName: input.guestName,
    groomName: input.groomName,
    brideName: input.brideName,
    event: input.event.name,
    date: readableDate(input.event.date),
    dateMr: readableDate(input.event.date, "mr-IN"),
    dateLine: `Date: ${readableDate(input.event.date)}`,
    dateLineMr: `दिनांक: ${readableDate(input.event.date, "mr-IN")}`,
    timeLine: input.event.time ? `Time: ${input.event.time}` : "",
    timeLineMr: input.event.time ? `वेळ: ${input.event.time}` : "",
    venueLine: place ? `Venue: ${place}` : "",
    venueLineMr: place ? `स्थळ: ${place}` : "",
    note: input.customNote?.trim() || "",
    rsvp: rsvpFor(input, "en"),
    rsvpMr: rsvpFor(input, "mr"),
    signature: signatureFor(input, "en"),
    signatureMr: signatureFor(input, "mr"),
  };
}

export function fillInvitationTemplate(template: string, vars: Record<string, string>) {
  const filled = template.replace(/\{([a-zA-Z]+)\}/g, (match, key: string) => (
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match
  ));
  return compactLines(filled.split("\n"));
}

export function buildInvitationMessage(input: InvitationTemplateInput) {
  const language = input.language ?? "en";
  const style = input.style ?? "warm";
  const vars = invitationVars(input);
  const en = fillInvitationTemplate(input.customTemplateEn?.trim() || defaultInvitationTemplate(style, "en"), vars);
  const mr = fillInvitationTemplate(input.customTemplateMr?.trim() || defaultInvitationTemplate(style, "mr"), vars);
  return language === "mr" ? mr : en;
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

export interface InvitationCardInput extends InvitationTemplateInput {
  hashtag?: string;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function ensureCardFonts() {
  const fonts = document.fonts;
  if (!fonts?.load) return;
  await Promise.all([
    fonts.load('700 84px "Cormorant Garamond"'),
    fonts.load('600 42px "Noto Serif Devanagari"'),
    fonts.load('500 28px Karla'),
  ]).catch(() => undefined);
  await fonts.ready.catch(() => undefined);
}

export async function renderInvitationCard(input: InvitationCardInput) {
  await ensureCardFonts();
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1440;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the invitation card.");

  const showMr = (input.language ?? "en") === "mr";
  const venue = [input.event.venue || input.defaultVenue, input.city].filter(Boolean).join(", ");
  const couple = [input.groomName, input.brideName].filter(Boolean).join("  &  ") || (showMr ? "शुभ विवाह" : "You're invited");

  ctx.fillStyle = "#fbf6ef";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#6d1e2f";
  ctx.lineWidth = 18;
  roundRect(ctx, 42, 42, width - 84, height - 84, 28);
  ctx.stroke();
  ctx.strokeStyle = "#b08d57";
  ctx.lineWidth = 4;
  roundRect(ctx, 68, 68, width - 136, height - 136, 20);
  ctx.stroke();

  const ornament = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "#b08d57";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.lineTo(26, 0);
    ctx.moveTo(0, -26);
    ctx.lineTo(0, 26);
    ctx.stroke();
    ctx.restore();
  };
  ornament(110, 110);
  ornament(width - 110, 110);
  ornament(110, height - 110);
  ornament(width - 110, height - 110);

  ctx.textAlign = "center";
  ctx.fillStyle = "#b08d57";
  ctx.font = showMr ? '600 28px "Noto Serif Devanagari", serif' : '600 22px Karla, sans-serif';
  ctx.fillText(showMr ? "॥ शुभ विवाह निमंत्रण ॥" : "YOU ARE INVITED", width / 2, 180);

  ctx.fillStyle = "#4a1420";
  ctx.font = '700 72px "Cormorant Garamond", Georgia, serif';
  const coupleLines = wrapText(ctx, couple, width - 220);
  let y = 290;
  for (const line of coupleLines) {
    ctx.fillText(line, width / 2, y);
    y += 78;
  }

  ctx.strokeStyle = "#d9c093";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 140, y + 8);
  ctx.lineTo(width / 2 + 140, y + 8);
  ctx.stroke();

  ctx.fillStyle = "#6d1e2f";
  ctx.font = showMr ? '600 40px "Noto Serif Devanagari", serif' : '600 36px "Cormorant Garamond", Georgia, serif';
  y += 70;
  for (const line of wrapText(ctx, input.event.name, width - 240)) {
    ctx.fillText(line, width / 2, y);
    y += 48;
  }

  ctx.fillStyle = "#56504a";
  ctx.font = '500 28px Karla, sans-serif';
  const info = [
    readableDate(input.event.date, showMr ? "mr-IN" : "en-IN"),
    input.event.time || "",
    venue,
  ].filter(Boolean);
  y += 24;
  for (const line of info) {
    ctx.fillText(line, width / 2, y);
    y += 42;
  }

  y += 36;
  ctx.fillStyle = "#4a1420";
  ctx.font = showMr ? '600 32px "Noto Serif Devanagari", serif' : '600 30px "Cormorant Garamond", Georgia, serif';
  const greeting = showMr
    ? `प्रिय ${input.guestName}`
    : `Dear ${input.guestName}`;
  for (const line of wrapText(ctx, greeting, width - 240)) {
    ctx.fillText(line, width / 2, y);
    y += 42;
  }

  ctx.fillStyle = "#6d1e2f";
  ctx.font = showMr ? '500 26px "Noto Serif Devanagari", serif' : '500 24px Karla, sans-serif';
  const wish = showMr
    ? "आपली उपस्थिती या आनंदाच्या दिवसाला पूर्णत्व देईल."
    : "Your presence will complete this joyous day.";
  y += 28;
  for (const line of wrapText(ctx, wish, width - 260)) {
    ctx.fillText(line, width / 2, y);
    y += 38;
  }

  if (input.hashtag) {
    ctx.fillStyle = "#b08d57";
    ctx.font = "600 24px Karla, sans-serif";
    ctx.fillText(input.hashtag.startsWith("#") ? input.hashtag : `#${input.hashtag}`, width / 2, height - 150);
  }

  ctx.fillStyle = "#b08d57";
  ctx.font = showMr ? '600 22px "Noto Serif Devanagari", serif' : "500 18px Karla, sans-serif";
  ctx.fillText(showMr ? "सप्रेम निमंत्रण" : "With love, the wedding family", width / 2, height - 110);

  return canvas;
}

export async function invitationCardBlob(input: InvitationCardInput) {
  const canvas = await renderInvitationCard(input);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not create the invitation image.");
  return blob;
}

export function invitationCardFileName(guestName: string, eventName: string) {
  const safe = (value: string) => value.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "invite";
  return `${safe(guestName)}-${safe(eventName)}-invite.png`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function canShareFiles() {
  if (typeof navigator === "undefined" || typeof File === "undefined") return false;
  if (!navigator.share || !navigator.canShare) return false;
  try {
    const probe = new File(["invite"], "invite.png", { type: "image/png" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export async function shareInvitationCard(options: { title: string; text: string; file: File }) {
  if (!navigator.share) throw new Error("Sharing is not available on this device.");
  await navigator.share({ title: options.title, text: options.text, files: [options.file] });
}

export async function copyImageToClipboard(blob: Blob) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    throw new Error("Copying images is not supported in this browser.");
  }
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}
