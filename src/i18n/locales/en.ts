// Base language. Every other locale must satisfy `typeof en` (see de.ts pattern
// when a second language is added) so the shapes stay in sync at compile time.
export const en = {
  common: {
    appName: "Strata",
    signIn: "Sign in",
    signOut: "Sign out",
    loading: "Loading…",
    retry: "Retry",
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
  nav: {
    databases: "Databases",
    groups: "Groups",
    users: "Users",
    grants: "Grants",
    soon: "Soon",
  },
  search: {
    placeholder: "Search databases…",
  },
  databases: {
    title: "Databases",
    subtitle: "{{count}} registered",
    rescan: "Rescan",
    rescanning: "Rescanning…",
    error: "Couldn't load databases.",
    status: {
      present: "Present",
      missing: "Missing",
    },
    origin: {
      discovered: "Discovered",
      manual: "Manual",
    },
    col: {
      name: "Name",
      engine: "Engine",
      location: "Namespace",
      status: "Status",
      origin: "Origin",
    },
    empty: {
      none: "No databases yet. Run a rescan to discover them.",
      filtered: "No databases match your search.",
    },
  },
} as const
