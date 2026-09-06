import { useI18n } from "../../hooks/useI18n";
import type { AppLanguage } from "../../i18n";

const options: { value: AppLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "mr", label: "मराठी" },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div role="group" aria-label={t("language.label")} className={compact ? "flex rounded-full border border-beige bg-white/80 p-0.5" : "grid grid-cols-2 gap-2"}>
      {options.map((option) => {
        const active = language === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setLanguage(option.value)}
            className={compact
              ? `rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? "bg-maroon text-cream" : "text-charcoal-soft"}`
              : `rounded-xl border p-3 text-center text-sm font-medium ${active ? "border-maroon bg-peach/30 text-maroon" : "border-beige text-charcoal-soft"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
