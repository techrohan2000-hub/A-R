import { useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { navItems } from "../routes/navConfig";
import { EmptyState } from "../components/common/EmptyState";

export function PlaceholderPage() {
  const location = useLocation();
  const item = navItems.find((i) => i.path === location.pathname);

  return (
    <EmptyState
      icon={Sparkles}
      title={`${item?.label ?? "This section"} is coming soon`}
      description={`This module is planned for Phase ${item?.phase ?? "a later phase"} of the build. The navigation, layout and data storage are already wired up, so it will slot right in.`}
    />
  );
}
