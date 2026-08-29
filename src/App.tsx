import { HashRouter, Routes, Route } from "react-router-dom";
import { WeddingProvider } from "./context/WeddingContext";
import { AppLayout } from "./layouts/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { WeddingSetup } from "./pages/WeddingSetup";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { Tasks } from "./pages/Tasks";
import { Guests } from "./pages/Guests";
import { Vendors } from "./pages/Vendors";
import { Shopping } from "./pages/Shopping";
import { Budget } from "./pages/Budget";
import { EventsRituals } from "./pages/EventsRituals";
import { Timeline } from "./pages/Timeline";
import { navItems } from "./routes/navConfig";
import { useWedding } from "./hooks/useWedding";

const builtPaths = new Set([
  "/",
  "/settings",
  "/tasks",
  "/guests",
  "/vendors",
  "/shopping",
  "/budget",
  "/events-rituals",
  "/timeline",
]);

// HashRouter is used deliberately: GitHub Pages serves static files with no
// server-side rewrites, so a BrowserRouter would 404 on refresh for any
// nested route. HashRouter keeps routing entirely client-side and needs no
// extra GitHub Pages configuration.
function AppRoutes() {
  const { isLoading } = useWedding();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <div>
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gold-soft border-t-maroon" />
          <p className="text-sm text-charcoal-soft">Loading wedding data…</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/setup" element={<WeddingSetup />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/events-rituals" element={<EventsRituals />} />
          <Route path="/timeline" element={<Timeline />} />
          {navItems
            .filter((item) => !builtPaths.has(item.path))
            .map((item) => (
              <Route key={item.path} path={item.path} element={<PlaceholderPage />} />
            ))}
        </Route>
      </Routes>
    </HashRouter>
  );
}

function App() {
  return (
    <WeddingProvider>
      <AppRoutes />
    </WeddingProvider>
  );
}

export default App;
