import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { navItems } from "../../routes/navConfig";

export function TopBar() {
  const location = useLocation();
  const current = navItems.find((item) =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  );

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-beige bg-cream/90 px-4 py-4 backdrop-blur-sm sm:px-8">
      <h1 className="truncate text-2xl text-maroon-deep">{current?.label ?? "Wedding Planner"}</h1>
      <div className="hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-beige bg-white/70 px-3.5 py-2 sm:flex">
        <Search size={16} className="text-charcoal-soft" />
        <input
          type="search"
          placeholder="Search guests, tasks, vendors…"
          className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-charcoal-soft/60"
        />
      </div>
    </header>
  );
}
