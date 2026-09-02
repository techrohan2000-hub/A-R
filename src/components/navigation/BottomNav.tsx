import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Plus } from "lucide-react";
import { navItems, primaryMobilePaths } from "../../routes/navConfig";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const primary = primaryMobilePaths
    .map((path) => navItems.find((item) => item.path === path))
    .filter((item): item is (typeof navItems)[number] => Boolean(item));
  const rest = navItems.filter((item) => !(primaryMobilePaths as readonly string[]).includes(item.path));
  const moreActive = rest.some((item) =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  );

  useLockBodyScroll(moreOpen || addOpen);

  const quickAddTargets: { label: string; path: string }[] = [
    { label: "Task", path: "/tasks" },
    { label: "Guest", path: "/guests" },
    { label: "Expense", path: "/budget" },
    { label: "Shopping Item", path: "/shopping" },
    { label: "Vendor", path: "/vendors" },
    { label: "Event", path: "/events-rituals" },
    { label: "Milestone", path: "/timeline" },
    { label: "Note", path: "/notes" },
  ];

  return (
    <>
      {!moreOpen && !addOpen && (
        <button
          onClick={() => setAddOpen(true)}
          aria-label="Quick add"
          className="fixed z-40 flex items-center justify-center rounded-full bg-maroon text-cream shadow-lg shadow-maroon/30 lg:hidden"
          style={{
            height: "3.25rem",
            width: "3.25rem",
            right: "max(1rem, env(safe-area-inset-right))",
            bottom: "calc(5.25rem + env(safe-area-inset-bottom))",
          }}
        >
          <Plus size={24} />
        </button>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-beige bg-cream/95 backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-5">
          {primary.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  `flex min-h-12 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
                    isActive ? "text-maroon" : "text-charcoal-soft"
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.75} />
                <span className="truncate px-0.5">{label}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={() => setMoreOpen(true)}
              className={`flex min-h-12 w-full flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
                moreActive ? "text-maroon" : "text-charcoal-soft"
              }`}
            >
              <Menu size={20} strokeWidth={1.75} />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label="All sections">
          <div className="absolute inset-0 bg-charcoal/40" onClick={() => setMoreOpen(false)} />
          <div
            className="anim-sheet relative max-h-[80dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-cream p-5"
            style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-beige" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg text-maroon-deep">All Sections</h3>
              <button onClick={() => setMoreOpen(false)} aria-label="Close" className="rounded-full p-2 text-charcoal-soft">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {navItems.map(({ path, label, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => {
                    setMoreOpen(false);
                    navigate(path);
                  }}
                  className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center ${
                    (path === "/" ? location.pathname === "/" : location.pathname.startsWith(path))
                      ? "border-maroon/40 bg-peach/40"
                      : "border-beige bg-cream-soft/50"
                  }`}
                >
                  <Icon size={20} className="text-maroon" strokeWidth={1.75} />
                  <span className="text-[11px] font-medium leading-tight text-charcoal-soft">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label="Quick add">
          <div className="absolute inset-0 bg-charcoal/40" onClick={() => setAddOpen(false)} />
          <div
            className="anim-sheet relative w-full rounded-t-3xl bg-cream p-5"
            style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-beige" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg text-maroon-deep">Quick Add</h3>
              <button onClick={() => setAddOpen(false)} aria-label="Close" className="rounded-full p-2 text-charcoal-soft">
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
                  className="min-h-12 rounded-xl border border-beige bg-cream-soft/50 px-4 py-3 text-left text-sm font-medium text-charcoal-soft"
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
