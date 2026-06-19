import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import { en } from "@/i18n/locales/en"

export const defaultNS = "translation"

export const resources = {
  en: { translation: en },
} as const

void i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  defaultNS,
  interpolation: { escapeValue: false },
})

export default i18n
