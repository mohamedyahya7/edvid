import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

// Import all translation files
import ar from "./ar.json";
import en from "./en.json";

export const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
} as const;

i18next
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    compatibilityJSON: "v4",
    lng: "ar",
    fallbackLng: "ar",
    resources,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Enforce RTL on Web DOM
if (typeof document !== "undefined") {
  document.documentElement.dir = "rtl";
  document.documentElement.lang = "ar";
}

export default i18next;
