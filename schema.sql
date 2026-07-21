-- Gear Locker — Hanzo Base schema (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped: the collection access rule is `@request.auth.org_id = org`, so a
-- member of your org reads/writes it and other orgs cannot see it.
--
-- Keep this file in lockstep with what the app reads/writes
-- (src/lib/model.ts, src/views/assets.tsx, src/views/assignments.tsx).

-- Tracked equipment: one row per physical asset in the locker.
CREATE TABLE IF NOT EXISTS assets (
  tag    TEXT NOT NULL,  -- inventory tag, e.g. LT-0342
  name   TEXT NOT NULL,  -- human name, e.g. MacBook Pro 16"
  type   TEXT NOT NULL,  -- Laptop | Monitor | Phone | Tablet | Keyboard | Headset | Dock | Other
  status TEXT NOT NULL   -- available | assigned | repair | retired
);

-- Hand-off log: one row each time an asset is assigned to a person.
CREATE TABLE IF NOT EXISTS assignments (
  asset  TEXT NOT NULL,  -- the asset `tag` this hand-off refers to
  person TEXT NOT NULL,  -- who received it
  since  TEXT NOT NULL   -- ISO date (YYYY-MM-DD) the hand-off started
);
