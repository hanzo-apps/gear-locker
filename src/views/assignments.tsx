import { useMemo } from 'react'
import { YStack, XStack, Text, Paragraph } from '@hanzo/gui'
import { C } from '../lib/theme'
import { fmtDate, elapsed, type Asset, type Assignment } from '../lib/model'
import { TagChip, TypeTile, PersonAvatar, Dot } from '../ui/atoms'

interface AssignmentsProps {
  assignments: Assignment[]
  assets: Asset[]
  error: Error | null
}

/**
 * A single chronological timeline of every hand-off across the whole locker
 * (newest first — the query sorts by `-since`). An entry is flagged "current"
 * when it is the latest assignment for an asset that is still `assigned`.
 */
export function Assignments({ assignments, assets, error }: AssignmentsProps) {
  const assetByTag = useMemo(() => new Map(assets.map((a) => [a.tag, a])), [assets])

  const currentIds = useMemo(() => {
    const seen = new Set<string>()
    const ids = new Set<string>()
    for (const a of assignments) {
      if (seen.has(a.asset)) continue
      seen.add(a.asset)
      const asset = assetByTag.get(a.asset)
      if (asset && asset.status === 'assigned') ids.add(a.id)
    }
    return ids
  }, [assignments, assetByTag])

  if (error) {
    return (
      <Paragraph color={C.danger}>
        Couldn't reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you're signed in.
      </Paragraph>
    )
  }

  if (assignments.length === 0) {
    return (
      <YStack
        backgroundColor={C.panel}
        borderWidth={1}
        borderColor={C.line}
        borderRadius={14}
        paddingVertical={52}
        paddingHorizontal={22}
        alignItems="center"
        gap={8}
      >
        <Text fontSize={15} fontWeight="600" color={C.text}>
          No assignments yet
        </Text>
        <Text fontSize={13} color={C.muted} textAlign="center">
          Assign an asset to someone from the Assets tab and it will show up here.
        </Text>
      </YStack>
    )
  }

  return (
    <YStack backgroundColor={C.panel} borderWidth={1} borderColor={C.line} borderRadius={16} padding={20}>
      <YStack>
        {assignments.map((a, i) => {
          const asset = assetByTag.get(a.asset)
          const isCurrent = currentIds.has(a.id)
          const last = i === assignments.length - 1
          return (
            <XStack key={a.id} gap={16}>
              {/* rail */}
              <YStack alignItems="center" width={14} paddingTop={4}>
                <Dot color={isCurrent ? C.brand : C.faint} size={11} />
                {!last ? <YStack flex={1} width={2} backgroundColor={C.line} minHeight={46} /> : null}
              </YStack>

              {/* card */}
              <YStack
                flex={1}
                backgroundColor={C.bg}
                borderWidth={1}
                borderColor={isCurrent ? C.line2 : C.line}
                borderRadius={13}
                padding={14}
                gap={11}
                marginBottom={last ? 0 : 16}
              >
                <XStack alignItems="center" justifyContent="space-between" gap={10}>
                  <XStack alignItems="center" gap={11} flex={1}>
                    <PersonAvatar name={a.person} size={32} />
                    <YStack flex={1}>
                      <Text fontSize={14.5} fontWeight="700" color={C.text}>
                        {a.person}
                      </Text>
                      <Text fontSize={11.5} color={C.faint}>
                        {isCurrent ? `Holding ${elapsed(a.since)}` : 'Past assignment'} · {fmtDate(a.since)}
                      </Text>
                    </YStack>
                  </XStack>
                  <XStack
                    backgroundColor={isCurrent ? 'rgba(45,212,191,0.14)' : C.raised}
                    borderRadius={999}
                    paddingHorizontal={10}
                    paddingVertical={4}
                  >
                    <Text fontSize={11} fontWeight="700" color={isCurrent ? C.brand : C.faint} textTransform="uppercase" letterSpacing={0.6}>
                      {isCurrent ? 'current' : 'past'}
                    </Text>
                  </XStack>
                </XStack>

                <XStack
                  alignItems="center"
                  gap={10}
                  backgroundColor={C.panel}
                  borderRadius={10}
                  borderWidth={1}
                  borderColor={C.line}
                  paddingHorizontal={11}
                  paddingVertical={9}
                >
                  <TypeTile type={asset?.type ?? 'Other'} size={28} />
                  <TagChip tag={a.asset} />
                  <Text fontSize={13.5} color={C.text} numberOfLines={1} flex={1}>
                    {asset?.name ?? 'Unknown asset'}
                  </Text>
                </XStack>
              </YStack>
            </XStack>
          )
        })}
      </YStack>
    </YStack>
  )
}
