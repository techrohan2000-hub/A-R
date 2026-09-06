import { readableDate, type InvitationTemplateInput } from "../../services/invitations";

interface InvitationCardPreviewProps {
  input: InvitationTemplateInput;
  hashtag?: string;
}

export function InvitationCardPreview({ input, hashtag }: InvitationCardPreviewProps) {
  const showMr = (input.language ?? "en") === "mr";
  const venue = [input.event.venue || input.defaultVenue, input.city].filter(Boolean).join(", ");
  const dateLabel = readableDate(input.event.date, showMr ? "mr-IN" : "en-IN");

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-[28px] border-[6px] border-maroon bg-gradient-to-b from-[#fffaf3] via-[#fbf6ef] to-[#f3e6d4] p-3 shadow-[0_18px_40px_-18px_rgba(74,20,32,0.45)]">
      <div className="flex h-full flex-col items-center justify-between rounded-[18px] border border-gold-soft/80 px-5 py-6 text-center">
        <div>
          <p className={`text-[11px] font-semibold tracking-[0.22em] text-gold ${showMr ? "font-marathi tracking-normal" : "uppercase"}`}>
            {showMr ? "॥ शुभ विवाह निमंत्रण ॥" : "You are invited"}
          </p>
          <h3 className="mt-4 font-display text-3xl leading-tight text-maroon-deep">
            {input.groomName && input.brideName ? (
              <>
                {input.groomName}
                <span className="mx-2 text-lg text-gold">&</span>
                {input.brideName}
              </>
            ) : (
              input.groomName || input.brideName || (showMr ? "शुभ विवाह" : "You're invited")
            )}
          </h3>
          <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className={`mt-3 text-lg text-maroon ${showMr ? "font-marathi" : "font-display"}`}>{input.event.name}</p>
        </div>

        <div className="space-y-1 text-sm text-charcoal-soft">
          <p>{dateLabel}</p>
          {input.event.time ? <p>{input.event.time}</p> : null}
          {venue ? <p>{venue}</p> : null}
        </div>

        <div>
          <p className={`text-base text-maroon-deep ${showMr ? "font-marathi" : "font-display"}`}>
            {showMr ? `प्रिय ${input.guestName}` : `Dear ${input.guestName}`}
          </p>
          <p className={`mt-2 text-xs leading-relaxed text-charcoal-soft ${showMr ? "font-marathi" : ""}`}>
            {showMr
              ? "आपली उपस्थिती या आनंदाच्या दिवसाला पूर्णत्व देईल."
              : "Your presence will complete this joyous day."}
          </p>
          {hashtag ? <p className="mt-3 text-[11px] font-semibold tracking-wide text-gold">{hashtag.startsWith("#") ? hashtag : `#${hashtag}`}</p> : null}
        </div>
      </div>
    </div>
  );
}
