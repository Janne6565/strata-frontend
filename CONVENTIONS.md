# Strata Conventions

A practical reference for how the Strata frontend and backend are structured.

The **canonical, generic rules** live outside this repo in the shared design docs:

- `agents/AGENT.md` — general principles (all projects)
- `agents/technologies/REACT.md` — frontend rules
- `agents/technologies/SPRING_BOOT.md` — backend rules

This file records the **project-specific decisions and clarifications** that those
generic docs don't spell out — the conventions as they actually stand in the code,
including a few deliberate deviations. When in doubt, the canonical docs win; where
this file refines or overrides them, it says so explicitly.

---

## Frontend (`strata-frontend`)

### File naming

- **Components are `PascalCase.tsx`** (e.g. `CommandPalette.tsx`, `ResultGrid.tsx`,
  `CreateUserForm.tsx`). This is enforced across `components/`, `pages/**`, and
  `providers/`.
- **Exception — `src/components/ui/` stays kebab-case** (`alert-dialog.tsx`,
  `form-field.tsx`, `checkbox.tsx`). That folder is shadcn-generated and the shadcn
  CLI emits kebab-case; keeping it matches the ecosystem and lets `shadcn add` keep
  working. Treat `ui/` as vendored primitives.
- Logic hooks are `camelCase.ts` matching their export (`useUsersLogic.ts`).
- Page entry points are `index.tsx`. Tests are `<file>.test.ts(x)`, co-located.

### Component / logic split

Every non-trivial component is a **thin JSX file + a co-located `use<Name>Logic.ts`**.
All state, effects, selectors, callbacks, and navigation live in the hook; the
component only renders and holds `useTranslation()`. Examples: `CommandPalette.tsx` +
`useCommandPaletteLogic.ts`, every page in `pages/**`.

### Data access seam — the important one

There are **three** read/write paths, and which one to use depends on the operation:

1. **Cached entity reads → Redux slice thunks via `store/entityHooks.ts`**
   (`useDatasources`, `useGroups`, `useUsers`). These back the catalog/list screens
   and cache across navigation. This is the read seam for shared, list-shaped data.

2. **One-shot reads → `useDataLoading(loader)`** (`src/api/useDataLoading.ts`). A
   loader (typically a generated call) is fetched on mount with `idle/loading/failed`
   status and a `reload()`. Used for per-screen reads like a datasource's introspected
   schema (`useDatasourceDetailLogic`).

3. **CRUD mutations → `useDataInteractions()`** (`src/api/useDataInteractions.ts`).
   `run(action, fallbackMessage?)` wraps create/update/delete, returns `boolean`
   (success), tracks `status`/`errorMessage`, and surfaces the backend's RFC 7807
   `detail` verbatim (falling back to the translated message). **All** genuine
   mutations go through it — users, groups, grants, rename, rescan. Logic hooks call
   `run(() => generatedCall(...))`; components never call the API directly.

> **Deliberate exception:** the **query console** (`useQueryConsoleLogic`) and **row
> browser** (`useRowBrowserLogic`) call the generated `browse`/`runQuery`/`runExecute`
> functions directly. They aren't CRUD — they own rich result/page state with a
> four-state status (`empty/loading/idle/failed`) and paginate, which the generic
> seam can't model. This is intentional, not an oversight.

### Validation

All field validation lives in **`src/lib/validators.ts`** with named constants
(`PASSWORD_MIN`) and pure predicates (`isNonBlank`, `meetsPasswordPolicy`,
`isGrantScopeValid`). No inline validation in forms or hooks. `lib/` is
framework-agnostic — no React imports.

### Forms

Use the shared **`<FormField>`** (`components/ui/form-field.tsx`) for every labelled
input — it owns label association, hint, and error rendering. Never pair a raw
`<Label>` + control directly. For checkboxes use the shared **`<Checkbox>`**
primitive, not a raw `<input type="checkbox">`. Drive the disabled/invalid state from
`validators.ts`.

### State management

Redux Toolkit `createSlice`; typed `useAppDispatch`/`useAppSelector` from
`store/hooks.ts` only (never raw react-redux); `PayloadAction<T>` in reducers; union
string literals for async status (`"idle" | "loading" | "failed"`); store types via
`ReturnType<typeof store.getState>` / `typeof store.dispatch`.

### Styling

Tailwind utilities + the `cn()` helper; named tokens (`bg-card`,
`text-muted-foreground`, `border-border`) over arbitrary `[var(--x)]` syntax. Reserve
`style={{}}` for what Tailwind can't express (gradients, ring animations, runtime
status colors).

### TypeScript

Strict mode with `noUnusedLocals`/`noUnusedParameters`/`noFallthroughCasesInSwitch`/
`verbatimModuleSyntax` all on. Props as a named `interface FooProps` with `readonly`
fields. `import type` for type-only imports. `@/` alias for cross-directory imports;
relative only within a folder. Prefix floating promises with `void`. Use `globalThis`,
not `window`. No `any` (use `unknown` + narrow); no unexplained `@ts-ignore` or `!`.

### i18n

All UI text via `t("key")`; keys defined as a typed object in `i18n/locales/en.ts`
and compile-checked through `i18n/i18next.d.ts`. New keys go into every locale in the
same commit. (Currently single-locale: `en`.)

### API generation (Orval)

`src/api/generated/` is a committed build artifact — never edit by hand. Generated
functions are reached only through the seams above. The shared `customInstance`
(`src/api/axios-instance.ts`) injects auth/base-URL/error handling. Endpoints outside
the OpenAPI spec get a hand-written module using the same `customInstance`
(e.g. `src/api/datasources.ts`).

### Testing

Co-located `*.test.ts(x)`; `renderHook` + `makeWrapper(preloadedState)` for
Redux-connected hooks; `vi.mock`/`vi.fn`/`vi.mocked` with `vi.clearAllMocks()` in
`beforeEach`; slice reducers and `lib/` utilities as pure unit tests. `data-testid` on
interactive elements for E2E selectors.

---

## Backend (`strata-backend`)

### Layered architecture

- **Schema-interface / controller split.** Every endpoint group has a `*Api`
  interface (`controller/v1/schema/`) holding **all** REST + OpenAPI annotations
  (`@RequestMapping`, `@Operation`, `@ApiResponse`, `@Valid`, …) and a `*Controller`
  (`controller/v1/implementation/`) that `implements` it with method bodies only.
- Controllers stay thin → services hold business logic → repositories hold data
  access. Controllers never touch repositories. Entities carry no DTO/business logic;
  mapping lives in the response records (`UserResponse.from(...)`, etc.). JPA entities
  never leak into REST responses.

### Error handling

A single abstract **`BaseException`** (`model/exception/`) carries an `HttpStatus` +
`detail`; domain exceptions extend it (`NotFoundException`, `ConflictException`, …).
`ExceptionController` (`@RestControllerAdvice`) maps every `BaseException` through one
handler into an RFC 7807 **`ProblemDetail`** (`application/problem+json`); the extra
handlers there are only for framework exceptions (validation, unreadable body,
catch-all 500). No stack traces or internal messages reach clients.

### Transactions

`@Transactional` on every write service method; `@Transactional(readOnly = true)` on
reads. `AuditService` uses `REQUIRES_NEW` deliberately (audit rows must persist
independently of the caller's transaction).

### Persistence

Flyway owns the schema (`db/migration/`), `ddl-auto: validate` in all environments.
`Instant` for all timestamps. Repositories use derived query methods — no hardcoded
field-name JPQL.

### Configuration & security

App config binds once at startup via `@ConfigurationProperties` + `@Validated`
records (`JwtProperties`, `AuthProperties`, `KubernetesProperties`,
`DiscoveryProperties`) — no scattered `@Value`. Security rules live in one
`SecurityFilterChain`; JWT parsing is isolated to `JwtAuthenticationFilter`/
`JwtService`; secrets/issuers come from env. Stateless API → CSRF disabled (documented
in `SecurityConfig`).

> **Deliberate deviation:** fine-grained authorization uses a custom
> **`@NeedsValidation` aspect** (`security/authorization/`) on controller methods,
> wired one policy per `Operation` via `ValidatorRegistry` (fails fast at startup),
> rather than the canonical `@PreAuthorize` on services. The aspect gates at the
> controller boundary, so service methods add defence-in-depth scoping for collection
> endpoints. Keep this in mind when adding internal (non-HTTP) service callers.

### Logging & style

SLF4J with parameterised messages (never concatenation). DEBUG for the happy path,
WARN for recoverable 4xx, ERROR for 5xx. No `System.out`/`printStackTrace`, no PII or
secrets in logs. Explicit imports (no wildcards); named constants over magic
values; Lombok for boilerplate; Spotless (Google Java Format) enforced.

### Testing

JUnit 5 + Mockito + AssertJ (`assertThatThrownBy`, `.satisfies(...)`). Cover failure
and boundary paths, not just the happy path. `@SpringBootTest` sparingly; Testcontainers
for persistence/engine/k3s integration.
