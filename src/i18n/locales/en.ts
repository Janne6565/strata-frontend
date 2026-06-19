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
  detail: {
    back: "Databases",
    browse: "Browse",
    query: "Query",
    unknownEngine: "Unknown engine",
    schemaError: "Couldn't introspect this datasource.",
    noTables: "No tables found.",
    pickTable: "Select a table to browse its rows.",
    rowRange: "Rows {{from}}–{{to}}",
    prev: "Previous",
    next: "Next",
    noRows: "No rows.",
    browseError: "Couldn't load rows.",
    queryError: "Query failed.",
    queryPlaceholder: "Enter a query for this engine…",
    run: "Run",
    running: "Running…",
    execute: "Execute (write)",
    writeHint: "Writes may be blocked by read-only or prod safe-mode.",
    rowsAffected: "{{count}} row(s) affected.",
  },
} as const
