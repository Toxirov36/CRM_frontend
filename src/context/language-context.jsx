import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { translations } from "../i18n/translations";

export const LANGUAGES = [
  { code: "uz", name: "O'zbekcha", short: "UZ", flag: "🇺🇿" },
  { code: "en", name: "English", short: "EN", flag: "🇬🇧" },
  { code: "ru", name: "Русский", short: "RU", flag: "🇷🇺" },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children, storageKey = "app_language", defaultLanguage = "uz" }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && (saved === "uz" || saved === "en" || saved === "ru")) {
        return saved;
      }
      // Also check legacy or other formats
      const legacy = localStorage.getItem("language");
      if (legacy && (legacy === "uz" || legacy === "en" || legacy === "ru")) {
        return legacy;
      }
      return defaultLanguage;
    } catch {
      return defaultLanguage;
    }
  });

  const setLanguage = useCallback((newLang) => {
    if (newLang === "uz" || newLang === "en" || newLang === "ru") {
      try {
        localStorage.setItem(storageKey, newLang);
        localStorage.setItem("language", newLang);
      } catch (e) {
        console.error("Failed to save language in localStorage", e);
      }
      setLanguageState(newLang);
    }
  }, [storageKey]);

  // Nested translation helper: t('nav.main') or t('common.save', 'Default text')
  const t = useCallback((path, fallback = "") => {
    if (!path) return fallback || "";

    const getNestedValue = (obj, keyPath) => {
      const keys = keyPath.split(".");
      let current = obj;
      for (const k of keys) {
        if (!current || typeof current !== "object") return undefined;
        current = current[k];
      }
      return current;
    };

    const currentDict = translations[language] || translations.uz;
    let res = getNestedValue(currentDict, path);

    // Fallback to Uzbek if translation missing in current language
    if (res === undefined && language !== "uz") {
      res = getNestedValue(translations.uz, path);
    }

    if (res !== undefined) {
      return res;
    }

    return fallback || path;
  }, [language]);

  const currentLanguage = useMemo(() => {
    return LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    languages: LANGUAGES,
    currentLanguage,
  }), [language, setLanguage, t, currentLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
