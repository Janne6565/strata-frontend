// Base language. Every other locale must satisfy `typeof en` (see de.ts pattern
// when a second language is added) so the shapes stay in sync at compile time.
export const en = {
  common: {
    appName: "Strata",
    signIn: "Sign in",
    signOut: "Sign out",
  },
  login: {
    subtitle: "In-cluster database browser",
    title: "Sign in",
    description: "Enter your credentials to continue.",
    username: "Username",
    password: "Password",
    signingIn: "Signing in…",
    error: {
      generic: "Something went wrong. Please try again.",
    },
  },
  home: {
    signedInAs: "Signed in as {{username}}",
    role: "Role",
  },
} as const
