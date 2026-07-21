# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Gear Locker — assign and track company equipment. Vite + React 19 +
`@hanzo/gui` + `@hanzo/iam` + `@hanzo/base`. Keep it minimal and real.
`@hanzo/gui` needs the react-native-web alias + Tamagui defines in
`vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this); no
`animation` prop, and colored actions go through the `Btn` atom (Button omits
text color). `schema.sql` (`assets` + `assignments`) is the Base data contract —
keep it in lockstep with `src/lib/model.ts`. Prove changes with `npm run build`
(tsc + vite). Never build a container image locally — Hanzo Cloud owns deploys.
