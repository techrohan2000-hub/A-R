import { HashRouter, Routes, Route } from "react-router-dom";
import { WeddingProvider } from "./context/WeddingContext";
import { AppLayout } from "./layouts/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { WeddingSetup } from "./pages/WeddingSetup";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { navItems } from "./routes/navConfig";

// HashRouter is used deliberately: GitHub Pages serves static files with no
// server-side rewrites, so a BrowserRouter would 404 on refresh for any
// nested route. HashRouter keeps routing entirely client-side and needs no
// extra GitHub Pages configuration.
function App() {
  return (
    <WeddingProvider>
      <HashRouter>
        <Routes>
          <Route path="/setup" element={<WeddingSetup />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            {navItems
              .filter((item) => item.path !== "/" && item.path !== "/settings")
              .map((item) => (
                <Route key={item.path} path={item.path} element={<PlaceholderPage />} />
              ))}
          </Route>
        </Routes>
      </HashRouter>
    </WeddingProvider>
  );
}

export default App;
