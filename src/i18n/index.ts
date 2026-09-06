import { messages, type AppLanguage, type MessageTree } from "./messages";

export type { AppLanguage, MessageTree };
export { messages };

export const LANGUAGE_STORAGE_KEY = "wedding-planner:ui-language";

export function isAppLanguage(value: unknown): value is AppLanguage {
  return value === "en" || value === "mr";
}

export function readStoredLanguage(): AppLanguage {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isAppLanguage(stored) ? stored : "en";
  } catch {
    return "en";
  }
}

export function writeStoredLanguage(language: AppLanguage) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore private-mode write failures.
  }
}

export function applyDocumentLanguage(language: AppLanguage) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language === "mr" ? "mr" : "en";
  document.documentElement.classList.toggle("lang-mr", language === "mr");
}

function lookup(tree: unknown, path: string): string | undefined {
  let current: unknown = tree;
  for (const part of path.split(".")) {
    if (!current || typeof current !== "object" || !(part in current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  ));
}

export function translate(language: AppLanguage, path: string, vars?: Record<string, string | number>) {
  const text = lookup(messages[language], path) ?? lookup(messages.en, path) ?? path;
  return interpolate(text, vars);
}

export function navLabel(language: AppLanguage, path: string) {
  const keys: Record<string, string> = {
    "/": "nav.dashboard",
    "/manage": "nav.manage",
    "/timeline": "nav.timeline",
    "/events-rituals": "nav.events",
    "/tasks": "nav.tasks",
    "/guests": "nav.guests",
    "/shopping": "nav.shopping",
    "/vendors": "nav.vendors",
    "/budget": "nav.budget",
    "/invitations": "nav.invitations",
    "/outfits": "nav.outfits",
    "/jewellery": "nav.jewellery",
    "/decoration": "nav.decoration",
    "/photography": "nav.photography",
    "/travel": "nav.travel",
    "/gifts": "nav.gifts",
    "/documents": "nav.documents",
    "/wedding-day": "nav.weddingDay",
    "/family": "nav.family",
    "/notes": "nav.notes",
    "/settings": "nav.settings",
    "/food": "nav.food",
    "/venue": "nav.venue",
  };
  return translate(language, keys[path] ?? "common.weddingPlanner");
}
