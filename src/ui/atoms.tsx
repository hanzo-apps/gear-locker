/**
 * The Gear Locker design atoms — the small, reusable @hanzo/gui compositions the
 * views are built from. All props are Tamagui LONGHAND (alignItems /
 * justifyContent / backgroundColor / borderRadius …); shorthands would fail tsc.
 */
import type { ReactNode } from 'react'
import { XStack, YStack, Text } from '@hanzo/gui'
import { C, MONO } from '../lib/theme'
import { statusMeta, initials, personColor } from '../lib/model'

/** The brand mark: a teal tile holding a locker-door outline (dial + handle). */
export function LockerMark({ size = 34 }: { size?: number }) {
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={size * 0.26}
      backgroundColor={C.brand}
      alignItems="center"
      justifyContent="center"
    >
      <YStack
        width={size * 0.42}
        height={size * 0.56}
        borderRadius={size * 0.11}
        borderWidth={2}
        borderColor={C.brandInk}
        alignItems="center"
        justifyContent="center"
        gap={size * 0.05}
      >
        <YStack width={size * 0.1} height={size * 0.1} borderRadius={999} backgroundColor={C.brandInk} />
        <YStack width={2} height={size * 0.12} borderRadius={2} backgroundColor={C.brandInk} />
      </YStack>
    </YStack>
  )
}

export function Wordmark({ size = 34 }: { size?: number }) {
  return (
    <XStack alignItems="center" gap={11}>
      <LockerMark size={size} />
      <YStack>
        <Text fontSize={size * 0.5} fontWeight="800" color={C.text} letterSpacing={0.2}>
          Gear Locker
        </Text>
        <Text fontSize={size * 0.32} color={C.faint} textTransform="uppercase" letterSpacing={1.6}>
          Internal Tools
        </Text>
      </YStack>
    </XStack>
  )
}

export function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return <YStack width={size} height={size} borderRadius={999} backgroundColor={color} />
}

/** Monospace inventory tag pill, e.g. `LT-0342`. */
export function TagChip({ tag, emphasis = false }: { tag: string; emphasis?: boolean }) {
  return (
    <XStack
      backgroundColor={C.bg}
      borderWidth={1}
      borderColor={emphasis ? C.brand : C.line}
      borderRadius={7}
      paddingHorizontal={9}
      paddingVertical={4}
      alignItems="center"
    >
      <Text fontFamily={MONO} fontSize={12.5} letterSpacing={0.5} fontWeight="600" color={emphasis ? C.brand : C.muted}>
        {tag}
      </Text>
    </XStack>
  )
}

/** Colored status pill: a dot + label tinted by the status. */
export function StatusBadge({ status }: { status: string }) {
  const m = statusMeta(status)
  return (
    <XStack
      alignItems="center"
      gap={7}
      backgroundColor={m.tint}
      borderRadius={999}
      paddingHorizontal={10}
      paddingVertical={4}
    >
      <Dot color={m.color} size={7} />
      <Text fontSize={12} fontWeight="600" color={m.color}>
        {m.label}
      </Text>
    </XStack>
  )
}

/** Square monogram tile for an equipment type (first letter). */
export function TypeTile({ type, size = 34 }: { type: string; size?: number }) {
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={9}
      backgroundColor={C.bg}
      borderWidth={1}
      borderColor={C.line}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontFamily={MONO} fontSize={size * 0.44} fontWeight="700" color={C.muted}>
        {type.slice(0, 1).toUpperCase()}
      </Text>
    </YStack>
  )
}

/** Round initials avatar, deterministically colored from the person's name. */
export function PersonAvatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={999}
      backgroundColor={personColor(name)}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={size * 0.4} fontWeight="800" color="#0b0e13">
        {initials(name)}
      </Text>
    </YStack>
  )
}

/** A headline stat tile for the summary strip. */
export function Stat({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <YStack
      flex={1}
      minWidth={128}
      backgroundColor={C.panel}
      borderWidth={1}
      borderColor={C.line}
      borderRadius={13}
      paddingVertical={15}
      paddingHorizontal={17}
      gap={5}
    >
      <Text fontSize={26} fontWeight="800" color={color ?? C.text}>
        {value}
      </Text>
      <Text fontSize={11.5} color={C.muted} textTransform="uppercase" letterSpacing={0.7}>
        {label}
      </Text>
    </YStack>
  )
}

/** A labelled meta cell (detail pane). */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <YStack gap={5} flex={1} minWidth={120}>
      <Text fontSize={11} color={C.faint} textTransform="uppercase" letterSpacing={0.7}>
        {label}
      </Text>
      {typeof children === 'string' ? (
        <Text fontSize={14} color={C.text}>
          {children}
        </Text>
      ) : (
        children
      )}
    </YStack>
  )
}

/** Segmented control for top-level navigation. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string; badge?: number }[]
  value: T
  onChange: (k: T) => void
}) {
  return (
    <XStack backgroundColor={C.bg} borderWidth={1} borderColor={C.line} borderRadius={11} padding={3}>
      {options.map((o) => {
        const active = o.key === value
        return (
          <XStack
            key={o.key}
            cursor="pointer"
            onPress={() => onChange(o.key)}
            backgroundColor={active ? C.raised : 'transparent'}
            hoverStyle={active ? {} : { backgroundColor: C.hover }}
            borderRadius={8}
            paddingHorizontal={15}
            paddingVertical={7}
            gap={8}
            alignItems="center"
          >
            <Text fontSize={13.5} fontWeight={active ? '700' : '500'} color={active ? C.text : C.muted}>
              {o.label}
            </Text>
            {typeof o.badge === 'number' ? (
              <XStack
                backgroundColor={active ? C.brand : C.line}
                borderRadius={999}
                minWidth={19}
                height={18}
                paddingHorizontal={5}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={11} fontWeight="700" color={active ? C.brandInk : C.muted}>
                  {o.badge}
                </Text>
              </XStack>
            ) : null}
          </XStack>
        )
      })}
    </XStack>
  )
}

/**
 * The one button. @hanzo/gui's Button omits text-`color` in this config, so the
 * app's colored actions are composed from XStack + Text (still 100% gui
 * primitives) — one styled control, three tones.
 */
export function Btn({
  label,
  onPress,
  tone = 'primary',
  size = 'md',
  disabled = false,
  full = false,
}: {
  label: string
  onPress: () => void
  tone?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  full?: boolean
}) {
  const s = size === 'lg' ? { x: 22, y: 13, f: 15.5 } : size === 'sm' ? { x: 13, y: 7, f: 13 } : { x: 16, y: 10, f: 14 }
  const t =
    tone === 'primary'
      ? { bg: C.brand, hov: C.brandHi, ink: C.brandInk, bd: C.brand }
      : tone === 'danger'
        ? { bg: 'transparent', hov: 'rgba(248,113,113,0.1)', ink: C.danger, bd: 'transparent' }
        : { bg: 'transparent', hov: C.panel, ink: C.text, bd: C.line }
  return (
    <XStack
      cursor={disabled ? 'default' : 'pointer'}
      onPress={disabled ? undefined : onPress}
      opacity={disabled ? 0.45 : 1}
      backgroundColor={t.bg}
      borderWidth={1}
      borderColor={t.bd}
      hoverStyle={disabled ? {} : { backgroundColor: t.hov, borderColor: tone === 'ghost' ? C.line2 : t.bd }}
      pressStyle={disabled ? {} : { opacity: 0.9 }}
      borderRadius={10}
      paddingHorizontal={s.x}
      paddingVertical={s.y}
      alignItems="center"
      justifyContent="center"
      alignSelf={full ? 'stretch' : 'flex-start'}
    >
      <Text fontSize={s.f} fontWeight="700" color={t.ink}>
        {label}
      </Text>
    </XStack>
  )
}

/** A pill toggle used to pick a type / status when creating an asset. */
export function ChipToggle({
  label,
  active,
  color,
  onPress,
}: {
  label: string
  active: boolean
  color?: string
  onPress: () => void
}) {
  const accent = color ?? C.brand
  return (
    <XStack
      cursor="pointer"
      onPress={onPress}
      backgroundColor={active ? accent : C.bg}
      borderWidth={1}
      borderColor={active ? accent : C.line}
      hoverStyle={active ? {} : { borderColor: C.line2 }}
      borderRadius={999}
      paddingHorizontal={13}
      paddingVertical={6}
    >
      <Text fontSize={13} fontWeight="600" color={active ? '#0b0e13' : C.muted}>
        {label}
      </Text>
    </XStack>
  )
}
