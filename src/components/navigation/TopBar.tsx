import { useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../../routes/navConfig";
import { NotificationCenter } from "../notifications/NotificationCenter";

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const current = navItems.find((item) =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  );
  const goToMatch = () => {
    const match = navItems.find((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));
    if (!match) return;
    navigate(match.path);
    setQuery("");
    setSearchOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-20 border-b border-beige/80 bg-cream/85 shadow-[0_8px_30px_-28px_rgba(74,20,32,0.8)] backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-8 sm:py-3.5">
        {searchOpen ? (
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-beige bg-white/80 px-3.5 py-2 shadow-sm focus-within:border-gold-soft focus-within:ring-2 focus-within:ring-peach/50">
            <Search size={16} className="shrink-0 text-charcoal-soft" />
            <input
              type="search"
              autoFocus
              list="planner-sections"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") goToMatch();
                if (event.key === "Escape") setSearchOpen(false);
              }}
              placeholder="Go to a section…"
              className="w-full bg-transparent text-base text-charcoal outline-none placeholder:text-charcoal-soft/60 sm:text-sm"
            />
          </label>
        ) : (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-gold" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Our celebration</p>
            </div>
            <h1 className="truncate text-xl leading-tight text-maroon-deep sm:text-2xl">{current?.label ?? "Wedding Planner"}</h1>
          </div>
        )}
        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          {searchOpen ? (
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
              aria-label="Close search"
              className="rounded-full border border-beige bg-white/80 p-2.5 text-charcoal-soft sm:hidden"
            >
              <X size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search planner sections"
              className="rounded-full border border-beige bg-white/80 p-2.5 text-maroon sm:hidden"
            >
              <Search size={18} />
            </button>
          )}
          <label className="hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-beige bg-white/80 px-3.5 py-2 shadow-sm transition focus-within:border-gold-soft focus-within:ring-2 focus-within:ring-peach/50 sm:flex">
            <Search size={16} className="text-charcoal-soft" />
            <input
              type="search"
              list="planner-sections"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") goToMatch();
              }}
              placeholder="Go to a planner section…"
              className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-charcoal-soft/60"
            />
          </label>
          <datalist id="planner-sections">
            {navItems.map((item) => <option key={item.path} value={item.label} />)}
          </datalist>
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}
