import { useCallback, useEffect } from "react";
import {
  applyDocumentLanguage,
  isAppLanguage,
  navLabel,
  readStoredLanguage,
  translate,
  writeStoredLanguage,
  type AppLanguage,
} from "../i18n";
import { useWedding } from "./useWedding";

export function useI18n() {
  const { workspace, saveWedding } = useWedding();
  const language: AppLanguage = isAppLanguage(workspace?.wedding.uiLanguage)
    ? workspace.wedding.uiLanguage
    : readStoredLanguage();

  useEffect(() => {
    applyDocumentLanguage(language);
  }, [language]);

  const t = useCallback((path: string, vars?: Record<string, string | number>) => (
    translate(language, path, vars)
  ), [language]);

  const labelFor = useCallback((path: string) => navLabel(language, path), [language]);

  const setLanguage = useCallback(async (next: AppLanguage) => {
    writeStoredLanguage(next);
    applyDocumentLanguage(next);
    if (workspace) {
      await saveWedding({ ...workspace.wedding, uiLanguage: next });
    }
  }, [saveWedding, workspace]);

  return { language, t, setLanguage, labelFor, isMr: language === "mr" };
}
