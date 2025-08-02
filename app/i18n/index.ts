import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

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

const languageDetector = {
  type: "languageDetector" as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const storedLang = await AsyncStorage.getItem("user-language");
      if (storedLang) {
        callback(storedLang);
        return;
      }
    } catch (e) {
      console.error("Error reading language from AsyncStorage", e);
    }

    const locale = Localization.getLocales()[0]?.languageCode ?? "en";
    callback(locale);
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem("user-language", lng);
    } catch (e) {
      console.error("Error saving language to AsyncStorage", e);
    }
  },
};

i18next
  .use(languageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: "en",
    compatibilityJSON: "v4", // To make it work for Android devices
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: true, // This is needed to wait for language detection
    },
  });

export default i18next;
