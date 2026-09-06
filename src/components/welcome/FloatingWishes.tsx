import { useWedding } from "../../hooks/useWedding";
import { useI18n } from "../../hooks/useI18n";

const FALLBACK_GROOM = "Rohan";
const FALLBACK_BRIDE = "Aishwarya";

export function FloatingWishes() {
  const { t, isMr } = useI18n();
  const { workspace } = useWedding();
  const groom = workspace?.wedding.couple.groomName?.trim() || FALLBACK_GROOM;
  const bride = workspace?.wedding.couple.brideName?.trim() || FALLBACK_BRIDE;
  const wishes = [
    t("welcome.flow1"),
    t("welcome.flow2"),
    t("welcome.flow3"),
    t("welcome.flow4"),
    t("welcome.flow5", { groom, bride }),
  ];
  const loop = [...wishes, ...wishes];

  return (
    <>
      <div className="wish-ribbon" aria-hidden="true">
        <div className={`wish-track ${isMr ? "font-marathi" : ""}`}>
          {loop.map((wish, index) => (
            <span key={`${wish}-${index}`} className="wish-chip">
              {wish}
            </span>
          ))}
        </div>
      </div>
      <div className="wish-floaters" aria-hidden="true">
        {wishes.slice(0, 3).map((wish, index) => (
          <span key={wish} className={`wish-bubble wish-bubble-${index + 1} ${isMr ? "font-marathi" : ""}`}>
            {wish}
          </span>
        ))}
      </div>
    </>
  );
}
