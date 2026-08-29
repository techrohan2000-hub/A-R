import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";
import { BottomNav } from "../components/navigation/BottomNav";
import { TopBar } from "../components/navigation/TopBar";

export function AppLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-cream">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-cream transition focus:translate-y-0"
      >
        Skip to main content
      </a>
      <div className="pointer-events-none fixed right-[-8rem] top-24 h-80 w-80 rounded-full bg-peach/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-gold-soft/10 blur-3xl" />
      <Sidebar />
      <div className="relative lg:pl-64">
        <TopBar />
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
