import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";
import { BottomNav } from "../components/navigation/BottomNav";
import { TopBar } from "../components/navigation/TopBar";
import { FloatingWishes } from "../components/welcome/FloatingWishes";
import { useI18n } from "../hooks/useI18n";

export function AppLayout() {
  const { t } = useI18n();
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-cream">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-cream transition focus:translate-y-0"
      >
        {t("common.skip")}
      </a>
      <div className="pointer-events-none fixed right-[-8rem] top-24 hidden h-80 w-80 rounded-full bg-peach/20 blur-3xl sm:block" />
      <div className="pointer-events-none fixed bottom-[-10rem] left-1/3 hidden h-96 w-96 rounded-full bg-gold-soft/10 blur-3xl sm:block" />
      <Sidebar />
      <div className="relative lg:pl-64">
        <TopBar />
        <FloatingWishes />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto max-w-7xl px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:pt-6 lg:pb-12 lg:pt-8"
        >
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
