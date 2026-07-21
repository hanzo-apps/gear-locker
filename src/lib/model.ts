/**
 * The domain, in ONE place: the two Base collections (in lockstep with
 * schema.sql), the status vocabulary + its colors, and small pure helpers.
 */
import type { BaseRecord } from '@hanzo/base/react'

/** A tracked piece of equipment. Row of the `assets` collection. */
export interface Asset extends BaseRecord {
  tag: string // inventory tag, e.g. LT-0342
  name: string // human name, e.g. MacBook Pro 16"
  type: string // one of TYPES
  status: string // one of StatusKey
}

/** A hand-off of an asset to a person. Row of the `assignments` collection. */
export interface Assignment extends BaseRecord {
  asset: string // asset tag this row refers to
  person: string // who holds it
  since: string // ISO date (YYYY-MM-DD) the hand-off started
}

export type StatusKey = 'available' | 'assigned' | 'repair' | 'retired'

export interface StatusMeta {
  key: StatusKey
  label: string
  color: string
  tint: string
}

export const STATUS: Record<StatusKey, StatusMeta> = {
  available: { key: 'available', label: 'Available', color: '#22c55e', tint: 'rgba(34,197,94,0.13)' },
  assigned: { key: 'assigned', label: 'Assigned', color: '#60a5fa', tint: 'rgba(96,165,250,0.14)' },
  repair: { key: 'repair', label: 'In repair', color: '#fbbf24', tint: 'rgba(251,191,36,0.15)' },
  retired: { key: 'retired', label: 'Retired', color: '#94a3b8', tint: 'rgba(148,163,184,0.13)' },
}

export const STATUS_ORDER: StatusKey[] = ['available', 'assigned', 'repair', 'retired']

export function statusMeta(s: string): StatusMeta {
  return STATUS[s as StatusKey] ?? STATUS.retired
}

/** Equipment categories offered when adding an asset. */
export const TYPES = ['Laptop', 'Monitor', 'Phone', 'Tablet', 'Keyboard', 'Headset', 'Dock', 'Other'] as const

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_INK = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#22d3ee', '#fb7185', '#4ade80']

/** Deterministic avatar color from a name (stable across renders). */
export function personColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_INK[h % AVATAR_INK.length]
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function fmtDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Compact elapsed label since an ISO date, e.g. "3 days", "5 mo", "1 yr". */
export function elapsed(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const days = Math.max(0, Math.round((Date.now() - d.getTime()) / 86_400_000))
  if (days === 0) return 'today'
  if (days === 1) return '1 day'
  if (days < 30) return `${days} days`
  const months = Math.round(days / 30)
  if (months < 12) return `${months} mo`
  return `${Math.round(months / 12)} yr`
}
