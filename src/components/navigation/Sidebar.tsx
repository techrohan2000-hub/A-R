import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { navItems } from "../../routes/navConfig";
import { useWedding } from "../../hooks/useWedding";
import { useI18n } from "../../hooks/useI18n";

export function Sidebar() {
  const { workspace } = useWedding();
  const { t, labelFor } = useI18n();
  const couple = workspace?.wedding.couple;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden border-r border-beige bg-cream-soft/90 shadow-[12px_0_40px_-36px_rgba(74,20,32,0.6)] backdrop-blur-xl lg:flex">
      <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full border border-gold-soft/30" />
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-maroon text-cream shadow-lg shadow-maroon/20">
          <Heart size={16} fill="currentColor" strokeWidth={0} />
          <Sparkles size={10} className="absolute -right-1 -top-1 text-gold" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg leading-tight text-maroon-deep">
            {couple ? `${couple.groomName} & ${couple.brideName}` : "Our Wedding"}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-charcoal-soft">{t("common.planner")}</p>
        </div>
      </div>

      <div className="motif-divider mx-6" />

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(({ path, icon: Icon }) => {
            const groupLabel: Record<string, string> = {
              "/": t("nav.groupOverview"),
              "/guests": t("nav.groupPeople"),
              "/shopping": t("nav.groupDetails"),
              "/documents": t("nav.groupFinal"),
              "/settings": t("nav.groupPrefs"),
            };
            return (
              <Fragment key={path}>
                {groupLabel[path] && (
                  <li className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold first:pt-0">
                    {groupLabel[path]}
                  </li>
                )}
                <li>
                  <NavLink
                    to={path}
                    end={path === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-maroon text-cream shadow-md shadow-maroon/15"
                          : "text-charcoal-soft hover:bg-peach/45 hover:text-maroon-deep"
                      }`
                    }
                  >
                    <Icon size={17} strokeWidth={1.75} />
                    <span className="truncate">{labelFor(path)}</span>
                  </NavLink>
                </li>
              </Fragment>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
