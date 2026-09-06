import { useEffect, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

const FALLBACK_GROOM = "Rohan";
const FALLBACK_BRIDE = "Aishwarya";

interface WelcomeSplashProps {
  groomName?: string;
  brideName?: string;
  photoUrl?: string;
}

function prefersReducedMotion() {
  return Boolean(typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

export function WelcomeSplash({ groomName, brideName, photoUrl }: WelcomeSplashProps) {
  const { t, isMr } = useI18n();
  const [phase, setPhase] = useState<"in" | "out" | "gone">("in");
  const visible = phase !== "gone";
  useLockBodyScroll(visible);

  const groom = groomName?.trim() || FALLBACK_GROOM;
  const bride = brideName?.trim() || FALLBACK_BRIDE;

  useEffect(() => {
    const hold = prefersReducedMotion() ? 900 : 3200;
    const fade = prefersReducedMotion() ? 200 : 700;
    const hide = window.setTimeout(() => setPhase("out"), hold);
    const gone = window.setTimeout(() => setPhase("gone"), hold + fade);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(gone);
    };
  }, []);

  const dismiss = (instant = false) => {
    if (phase === "gone") return;
    if (instant || prefersReducedMotion()) {
      setPhase("gone");
      return;
    }
    setPhase("out");
    window.setTimeout(() => setPhase("gone"), 450);
  };

  if (!visible) return null;

  return (
    <div
      className={`welcome-splash ${phase === "out" ? "welcome-splash-out" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={t("welcome.title", { groom, bride })}
      onClick={() => dismiss()}
    >
      <div className="welcome-glow" aria-hidden="true" />
      <Heart className="welcome-heart welcome-heart-1" size={22} fill="currentColor" aria-hidden="true" />
      <Heart className="welcome-heart welcome-heart-2" size={16} fill="currentColor" aria-hidden="true" />
      <Heart className="welcome-heart welcome-heart-3" size={18} fill="currentColor" aria-hidden="true" />
      <Sparkles className="welcome-sparkle welcome-sparkle-1" size={18} aria-hidden="true" />
      <Sparkles className="welcome-sparkle welcome-sparkle-2" size={14} aria-hidden="true" />

      <div className="welcome-card">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="welcome-photo" />
        ) : (
          <div className="welcome-monogram" aria-hidden="true">
            {groom.charAt(0)}
            <Heart size={14} fill="currentColor" className="mx-1 text-gold" />
            {bride.charAt(0)}
          </div>
        )}
        <p className={`welcome-kicker ${isMr ? "font-marathi" : ""}`}>{t("welcome.kicker")}</p>
        <h2 className={`welcome-title ${isMr ? "font-marathi" : ""}`}>
          {t("welcome.title", { groom, bride })}
        </h2>
        <p className={`welcome-line ${isMr ? "font-marathi" : ""}`}>{t("welcome.line")}</p>
        <button
          type="button"
          className="welcome-enter"
          onClick={(event) => {
            event.stopPropagation();
            dismiss(true);
          }}
          aria-label={t("welcome.skip")}
        >
          {t("welcome.enter")}
        </button>
      </div>
    </div>
  );
}
