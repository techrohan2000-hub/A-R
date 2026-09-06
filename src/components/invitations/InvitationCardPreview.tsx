import { readableDate, type InvitationTemplateInput } from "../../services/invitations";

interface InvitationCardPreviewProps {
  input: InvitationTemplateInput;
  hashtag?: string;
  message: string;
}

export function InvitationCardPreview({ input, hashtag, message }: InvitationCardPreviewProps) {
  const showMr = (input.language ?? "en") === "mr";
  const dateLabel = readableDate(input.event.date, showMr ? "mr-IN" : "en-IN");

  return (
    <div className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-[28px] border-[6px] border-maroon bg-gradient-to-b from-[#fffaf3] via-[#fbf6ef] to-[#f3e6d4] p-3 shadow-[0_18px_40px_-18px_rgba(74,20,32,0.45)]">
      <div className="flex flex-col items-center rounded-[18px] border border-gold-soft/80 px-5 py-6 text-center">
        <p className={`text-[11px] font-semibold tracking-[0.22em] text-gold ${showMr ? "font-marathi tracking-normal" : "uppercase"}`}>
          {showMr ? "॥ शुभ विवाह निमंत्रण ॥" : "You are invited"}
        </p>
        <h3 className="mt-3 font-display text-3xl leading-tight text-maroon-deep">
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
        <p className="mt-1 text-xs text-charcoal-soft">{dateLabel}</p>

        <p className={`mt-5 w-full whitespace-pre-wrap text-left text-[13px] leading-relaxed text-charcoal ${showMr ? "font-marathi" : ""}`}>
          {message}
        </p>

        {hashtag ? (
          <p className="mt-5 text-[11px] font-semibold tracking-wide text-gold">
            {hashtag.startsWith("#") ? hashtag : `#${hashtag}`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
