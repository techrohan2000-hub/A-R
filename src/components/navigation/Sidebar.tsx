import { NavLink } from "react-router-dom";
import { Heart } from "lucide-react";
import { navItems } from "../../routes/navConfig";
import { useWedding } from "../../hooks/useWedding";

export function Sidebar() {
  const { workspace } = useWedding();
  const couple = workspace?.wedding.couple;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-beige bg-cream-soft/60 lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon text-cream">
          <Heart size={16} fill="currentColor" strokeWidth={0} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg leading-tight text-maroon-deep">
            {couple ? `${couple.groomName} & ${couple.brideName}` : "Our Wedding"}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-charcoal-soft">Planner</p>
        </div>
      </div>

      <div className="motif-divider mx-6" />

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-maroon text-cream shadow-sm"
                      : "text-charcoal-soft hover:bg-peach/40 hover:text-maroon-deep"
                  }`
                }
              >
                <Icon size={17} strokeWidth={1.75} />
                <span className="truncate">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
