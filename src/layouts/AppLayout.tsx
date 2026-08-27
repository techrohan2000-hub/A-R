import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";
import { BottomNav } from "../components/navigation/BottomNav";
import { TopBar } from "../components/navigation/TopBar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar />
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
