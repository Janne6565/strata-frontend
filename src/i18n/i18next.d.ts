import "i18next"

import type { en } from "@/i18n/locales/en"

// Makes t("…") keys compile-time checked against the base language shape.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation"
    resources: {
      translation: typeof en
    }
  }
}
