// Base language. Every other locale must satisfy `typeof en` (see de.ts pattern
// when a second language is added) so the shapes stay in sync at compile time.
export const en = {
  common: {
    appName: "Strata",
    signIn: "Sign in",
  },
  login: {
    title: "Sign in to Strata",
  },
} as const
