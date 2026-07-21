import { useMemo, useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, ScrollView, Text, Spinner } from '@hanzo/gui'
import { C } from '../lib/theme'
import { STATUS, type Asset, type Assignment } from '../lib/model'
import { Wordmark, Segmented, Stat, PersonAvatar, Btn } from '../ui/atoms'
import { Assets } from './assets'
import { Assignments } from './assignments'

type Tab = 'assets' | 'assignments'

/**
 * Signed-in shell. Owns the two Base queries (assets + assignments) so the
 * summary strip and both tabs read one consistent snapshot, and exposes a single
 * `reload` that refetches both after any write. Everything under here carries the
 * signed-in user's IAM token (wired in providers.tsx) and is org-scoped.
 */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'

  const assetsQ = useQuery<Asset>('assets', { sort: '-created', realtime: false })
  const assignmentsQ = useQuery<Assignment>('assignments', { sort: '-since', realtime: false })

  const [tab, setTab] = useState<Tab>('assets')
  const [selected, setSelected] = useState<string | null>(null)

  async function reload() {
    await Promise.all([assetsQ.refetch(), assignmentsQ.refetch()])
  }

  const counts = useMemo(() => {
    const c = { total: 0, available: 0, assigned: 0, repair: 0, retired: 0 }
    for (const a of assetsQ.data) {
      c.total++
      if (a.status in c) (c as Record<string, number>)[a.status]++
    }
    return c
  }, [assetsQ.data])

  const loading = assetsQ.isLoading && assetsQ.data.length === 0

  return (
    <ScrollView flex={1} backgroundColor={C.bg}>
      <YStack height={3} backgroundColor={C.brand} />

      {/* header */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={16}
        paddingHorizontal="$4"
        paddingVertical={16}
        borderBottomWidth={1}
        borderColor={C.line}
        backgroundColor={C.bg}
      >
        <Wordmark size={30} />
        <XStack alignItems="center" gap={12} flexWrap="wrap">
          <XStack alignItems="center" gap={9}>
            <PersonAvatar name={who} size={26} />
            <Text fontSize={13} color={C.muted}>
              {who}
            </Text>
          </XStack>
          <Btn label="Sign out" tone="ghost" size="sm" onPress={() => logout()} />
        </XStack>
      </XStack>

      <YStack alignItems="center" paddingHorizontal="$4" paddingVertical={24}>
        <YStack width="100%" maxWidth={1080} gap={22}>
          {/* summary strip */}
          <XStack gap={12} flexWrap="wrap">
            <Stat label="Total assets" value={counts.total} />
            <Stat label="Available" value={counts.available} color={STATUS.available.color} />
            <Stat label="Assigned" value={counts.assigned} color={STATUS.assigned.color} />
            <Stat label="In repair" value={counts.repair} color={STATUS.repair.color} />
          </XStack>

          {/* nav */}
          <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={12}>
            <Segmented<Tab>
              value={tab}
              onChange={setTab}
              options={[
                { key: 'assets', label: 'Assets', badge: counts.total },
                { key: 'assignments', label: 'Assignments', badge: assignmentsQ.data.length },
              ]}
            />
          </XStack>

          {loading ? (
            <XStack gap={10} alignItems="center" paddingVertical={48} justifyContent="center">
              <Spinner color={C.brand} />
              <Text color={C.muted}>Loading the locker…</Text>
            </XStack>
          ) : tab === 'assets' ? (
            <Assets
              assets={assetsQ.data}
              assignments={assignmentsQ.data}
              error={assetsQ.error}
              selected={selected}
              onSelect={setSelected}
              reload={reload}
            />
          ) : (
            <Assignments assignments={assignmentsQ.data} assets={assetsQ.data} error={assignmentsQ.error} />
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
