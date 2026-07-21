# gear-locker — agent notes

Gear Locker: assign and track company equipment. A real Hanzo app forked from
the canonical `hanzo-starter` — Vite + React 19 + `@hanzo/gui` (UI) +
`@hanzo/iam` (auth) + `@hanzo/base` (data). Keep it minimal and REAL — every
surface must build and run, no fabricated UI.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam is what makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user. This stack is
  IDENTICAL to the starter — do not touch it.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`.
- **Domain is one place** (`src/lib/model.ts`): the `Asset`/`Assignment` types,
  the status vocabulary + colors, and pure helpers. Keep it in lockstep with
  `schema.sql`.
- **Design is one place** (`src/lib/theme.ts` palette + `src/ui/atoms.tsx`
  reusable compositions). UI is `@hanzo/gui` primitives only — no second kit, no
  Tailwind.
- **Home owns the data.** `src/views/home.tsx` runs the two Base queries and the
  summary counts, and passes one `reload()` down; `assets.tsx` (list + detail)
  and `assignments.tsx` (timeline) are pure views over that snapshot.

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line): (1) alias `react-native` → `react-native-web`, (2) `define`
  `process.env.TAMAGUI_TARGET` / `NODE_ENV` / `__DEV__`, (3) `dedupe`
  react/react-dom/react-native-web. No Tamagui compiler, no `one`, no Expo.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`alignSelf`/
  `borderRadius`/`textAlign` — NOT the `items`/`justify`/`bg`/`p`/`self`/
  `rounded`/`text` shorthands. Shorthands pass at runtime but FAIL `tsc`.
- **No `animation` prop** — this config registers no animation driver, so
  `animation=` fails `tsc`. Use `hoverStyle`/`pressStyle` for interaction (they
  apply instantly).
- **`Button` omits text `color`/`fontWeight`** in this config. The app's colored
  actions go through the ONE `Btn` atom (`src/ui/atoms.tsx`) — XStack + Text,
  still 100% gui primitives. Don't reintroduce styled `<Button color=…>`.
- **`Input` `placeholderTextColor` only accepts ColorTokens**, not hex strings —
  leave it unset (the theme default is already muted). `color`/`backgroundColor`/
  `borderColor` DO accept hex.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** `assets` + `assignments` are the
  `databaseSchema` DDL the deploy translates into Base collections
  (`provisionBaseFromDDL`). Keep it in lockstep with `src/lib/model.ts`.

## Deploy contract (Hanzo Cloud) — IDENTICAL to the starter

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage. No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native, rule `@request.auth.org_id = org`). Runtime read/write
  is browser → `VITE_HANZO_BASE_URL` with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback` (a `https://*.hanzo.app/auth/callback` wildcard, or a
  dedicated `gear-locker` client).

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
