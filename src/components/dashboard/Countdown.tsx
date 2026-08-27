import { useEffect, useState } from "react";
import { getCountdown } from "../../utils/dateUtils";

interface CountdownProps {
  weddingDate: string;
  weddingTime: string;
  groomName: string;
  brideName: string;
  venue: string;
  city: string;
  photoUrl?: string;
}

const units: Array<{ key: "days" | "hours" | "minutes" | "seconds"; label: string }> = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

function initialsOf(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function Countdown({
  weddingDate,
  weddingTime,
  groomName,
  brideName,
  venue,
  city,
  photoUrl,
}: CountdownProps) {
  const [countdown, setCountdown] = useState(() => getCountdown(weddingDate, weddingTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(weddingDate, weddingTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [weddingDate, weddingTime]);

  const prettyDate = weddingDate
    ? new Date(`${weddingDate}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date not set";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-maroon px-6 py-9 text-cream sm:px-10 sm:py-10">
      {/* Signature element: a faint arch silhouette echoing a mandap, drawn once, restrained */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 200"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-full w-full opacity-[0.08]"
        preserveAspectRatio="xMidYMax slice"
      >
        <path d="M0 200 V70 Q0 10 60 10 H340 Q400 10 400 70 V200" fill="none" stroke="currentColor" strokeWidth="3" />
        <path
          d="M40 200 V90 Q40 40 90 40 H310 Q360 40 360 90 V200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>

      <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
        {/* Couple photo medallion — the first thing a visitor's eye lands on */}
        <div className="anim-medallion shrink-0">
          <div className="relative h-28 w-28 sm:h-32 sm:w-32">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-soft via-gold to-gold-soft p-[3px] shadow-lg shadow-maroon-deep/40">
              <div className="h-full w-full overflow-hidden rounded-full ring-2 ring-cream/80">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${groomName} and ${brideName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-maroon-deep font-display text-3xl text-gold-soft">
                    {initialsOf(groomName)}
                    <span className="mx-0.5 text-cream/50">&amp;</span>
                    {initialsOf(brideName)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="anim-fade-1 font-body text-sm uppercase tracking-[0.2em] text-peach/90">
            {groomName || "Groom"} &amp; {brideName || "Bride"}
          </p>
          <h1 className="anim-fade-2 mt-2 font-display text-3xl text-cream sm:text-4xl">
            {countdown.isPast ? "The Big Day Has Arrived!" : "Counting Down to Forever"}
          </h1>
          <p className="anim-fade-3 mt-1 font-body text-sm text-cream/80">
            {prettyDate}
            {venue ? ` · ${venue}` : ""}
            {city ? `, ${city}` : ""}
          </p>

          <div className="anim-fade-4 mt-7 grid grid-cols-4 gap-3 sm:max-w-md">
            {units.map((u) => (
              <div
                key={u.key}
                className="rounded-2xl bg-cream/10 py-3 text-center backdrop-blur-sm ring-1 ring-cream/15"
              >
                <div className="font-data text-2xl font-semibold tabular-nums sm:text-3xl">
                  {String(countdown[u.key]).padStart(2, "0")}
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-cream/70">{u.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
