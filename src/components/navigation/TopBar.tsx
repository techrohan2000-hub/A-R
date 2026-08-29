import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "../../routes/navConfig";

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const current = navItems.find((item) =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  );
  const goToMatch = () => {
    const match = navItems.find((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));
    if (!match) return;
    navigate(match.path);
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-beige/80 bg-cream/85 px-4 py-3.5 shadow-[0_8px_30px_-28px_rgba(74,20,32,0.8)] backdrop-blur-xl sm:px-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-gold" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Our celebration</p>
        </div>
        <h1 className="truncate text-2xl leading-tight text-maroon-deep">{current?.label ?? "Wedding Planner"}</h1>
      </div>
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
        <datalist id="planner-sections">
          {navItems.map((item) => <option key={item.path} value={item.label} />)}
        </datalist>
      </label>
    </header>
  );
}
