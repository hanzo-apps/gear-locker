/**
 * Gear Locker — the visual system, in ONE place.
 *
 * The provider stack is the canonical Hanzo one (GuiProvider fixed to dark), so
 * this is a hand-tuned dark palette rather than a second Tamagui theme: plain
 * color strings that @hanzo/gui accepts on any `*Color` prop. IT-asset console
 * look — deep slate surfaces, hairline borders, one teal signal color.
 */

/** Monospace stack for asset tags / ids (the "inventory label" feel). */
export const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'

export const C = {
  bg: '#0b0e13', // app background (deep slate)
  panel: '#12161d', // cards / surfaces
  raised: '#161c25', // raised rows / headers
  hover: '#1b222d', // row hover
  line: '#232c39', // hairline border
  line2: '#2e3a49', // stronger border (hover/selected)
  text: '#e7edf4', // primary text
  muted: '#94a3b8', // secondary text
  faint: '#5b6675', // tertiary / labels
  brand: '#2dd4bf', // signal teal (brand + primary action)
  brandHi: '#5be6d4', // brand hover
  brandInk: '#06201c', // text/ink on brand
  danger: '#f87171', // destructive
} as const
