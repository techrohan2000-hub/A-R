import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Plus } from "lucide-react";
import { navItems, primaryMobileCount } from "../../routes/navConfig";

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();

  const primary = navItems.slice(0, primaryMobileCount);
  const rest = navItems.slice(primaryMobileCount);

  const quickAddTargets: { label: string; path: string }[] = [
    { label: "Task", path: "/tasks" },
    { label: "Guest", path: "/guests" },
    { label: "Expense", path: "/budget" },
    { label: "Shopping Item", path: "/shopping" },
    { label: "Vendor", path: "/vendors" },
    { label: "Event", path: "/events-rituals" },
    { label: "Note", path: "/notes" },
  ];

  return (
    <>
      {/* Floating quick-add button */}
      <button
        onClick={() => setAddOpen(true)}
        aria-label="Quick add"
        className="fixed bottom-20 right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-maroon text-cream shadow-lg shadow-maroon/30 lg:hidden"
        style={{ height: "3.25rem", width: "3.25rem" }}
      >
        <Plus size={24} />
      </button>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-beige bg-cream/95 backdrop-blur-sm lg:hidden">
        <ul className="grid grid-cols-6">
          {primary.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-2.5 text-[10px] ${
                    isActive ? "text-maroon" : "text-charcoal-soft"
                  }`
                }
              >
                <Icon size={19} strokeWidth={1.75} />
                <span className="truncate">{label.split(" ")[0]}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={() => setMoreOpen(true)}
              className="flex w-full flex-col items-center gap-0.5 py-2.5 text-[10px] text-charcoal-soft"
            >
              <Menu size={19} strokeWidth={1.75} />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* More sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-charcoal/40" onClick={() => setMoreOpen(false)} />
          <div className="relative max-h-[70vh] w-full overflow-y-auto rounded-t-3xl bg-cream p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg text-maroon-deep">All Sections</h3>
              <button onClick={() => setMoreOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {rest.map(({ path, label, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => {
                    setMoreOpen(false);
                    navigate(path);
                  }}
                  className="flex flex-col items-center gap-2 rounded-xl border border-beige bg-cream-soft/50 px-2 py-3.5 text-center"
                >
                  <Icon size={20} className="text-maroon" strokeWidth={1.75} />
                  <span className="text-[11px] font-medium text-charcoal-soft">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick add sheet */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-charcoal/40" onClick={() => setAddOpen(false)} />
          <div className="relative w-full rounded-t-3xl bg-cream p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg text-maroon-deep">Quick Add</h3>
              <button onClick={() => setAddOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickAddTargets.map(({ label, path }) => (
                <button
                  key={label}
                  onClick={() => {
                    setAddOpen(false);
                    navigate(path);
                  }}
                  className="rounded-xl border border-beige bg-cream-soft/50 px-4 py-3 text-left text-sm font-medium text-charcoal-soft"
                >
                  + {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
