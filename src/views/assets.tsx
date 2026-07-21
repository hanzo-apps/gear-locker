import { useMemo, useState } from 'react'
import { useMutation, type BaseRecord } from '@hanzo/base/react'
import { YStack, XStack, Text, Input, Paragraph, Separator } from '@hanzo/gui'
import { C } from '../lib/theme'
import { STATUS_ORDER, statusMeta, TYPES, fmtDate, elapsed, today, type Asset, type Assignment } from '../lib/model'
import { TagChip, StatusBadge, TypeTile, PersonAvatar, Field, ChipToggle, Dot, Btn } from '../ui/atoms'

interface AssetsProps {
  assets: Asset[]
  assignments: Assignment[]
  error: Error | null
  selected: string | null
  onSelect: (id: string | null) => void
  reload: () => Promise<void>
}

/**
 * The asset list (master) + detail pane. Both live here so the add form, the
 * row selection, and every mutation share one reload path back to Home's query.
 */
export function Assets({ assets, assignments, error, selected, onSelect, reload }: AssetsProps) {
  const createAsset = useMutation('assets', 'create')
  const updateAsset = useMutation('assets', 'update')
  const removeAsset = useMutation('assets', 'delete')
  const createAssignment = useMutation('assignments', 'create')

  const [adding, setAdding] = useState(false)
  const [tag, setTag] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<string>('Laptop')

  const current = assets.find((a) => a.id === selected) ?? null

  // assignments arrive sorted by -since, so the first row per tag is the latest.
  const holderByTag = useMemo(() => {
    const m = new Map<string, string>()
    for (const a of assignments) if (!m.has(a.asset)) m.set(a.asset, a.person)
    return m
  }, [assignments])

  const history = useMemo(
    () => (current ? assignments.filter((a) => a.asset === current.tag) : []),
    [assignments, current],
  )

  async function addAsset() {
    const t = tag.trim().toUpperCase()
    const n = name.trim()
    if (!t || !n || createAsset.isLoading) return
    const rec = await createAsset.mutate({ tag: t, name: n, type, status: 'available' })
    setTag('')
    setName('')
    setType('Laptop')
    setAdding(false)
    await reload()
    if (rec) onSelect((rec as BaseRecord).id)
  }

  async function assign(person: string, since: string) {
    if (!current) return
    await createAssignment.mutate({ asset: current.tag, person, since })
    await updateAsset.mutate({ id: current.id, status: 'assigned' })
    await reload()
  }

  async function setStatus(status: string) {
    if (!current) return
    await updateAsset.mutate({ id: current.id, status })
    await reload()
  }

  async function del() {
    if (!current) return
    await removeAsset.mutate({ id: current.id })
    onSelect(null)
    await reload()
  }

  const busy = updateAsset.isLoading || createAssignment.isLoading || removeAsset.isLoading

  return (
    <XStack gap={18} flexWrap="wrap" alignItems="flex-start">
      {/* master column */}
      <YStack flex={3} minWidth={340} gap={14}>
        {/* add asset */}
        <YStack backgroundColor={C.panel} borderWidth={1} borderColor={C.line} borderRadius={14} overflow="hidden">
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal={16}
            paddingVertical={13}
            cursor="pointer"
            onPress={() => setAdding((v) => !v)}
            hoverStyle={{ backgroundColor: C.raised }}
          >
            <XStack alignItems="center" gap={9}>
              <Text fontSize={17} color={C.brand} fontWeight="700">
                +
              </Text>
              <Text fontSize={14} fontWeight="600" color={C.text}>
                Add asset
              </Text>
            </XStack>
            <Text fontSize={12} color={C.faint}>
              {adding ? 'Close' : 'New'}
            </Text>
          </XStack>

          {adding ? (
            <YStack padding={16} gap={13} borderTopWidth={1} borderColor={C.line}>
              <XStack gap={10} flexWrap="wrap">
                <YStack flex={1} minWidth={130} gap={6}>
                  <Text fontSize={11} color={C.faint} textTransform="uppercase" letterSpacing={0.7}>
                    Tag
                  </Text>
                  <Input
                    value={tag}
                    placeholder="LT-0342"
                    autoCapitalize="characters"
                    onChangeText={setTag}
                    backgroundColor={C.bg}
                    borderColor={C.line}
                    color={C.text}
                  />
                </YStack>
                <YStack flex={2} minWidth={180} gap={6}>
                  <Text fontSize={11} color={C.faint} textTransform="uppercase" letterSpacing={0.7}>
                    Name
                  </Text>
                  <Input
                    value={name}
                    placeholder='MacBook Pro 16"'
                    onChangeText={setName}
                    onSubmitEditing={addAsset}
                    backgroundColor={C.bg}
                    borderColor={C.line}
                    color={C.text}
                  />
                </YStack>
              </XStack>

              <YStack gap={8}>
                <Text fontSize={11} color={C.faint} textTransform="uppercase" letterSpacing={0.7}>
                  Type
                </Text>
                <XStack gap={8} flexWrap="wrap">
                  {TYPES.map((t) => (
                    <ChipToggle key={t} label={t} active={type === t} onPress={() => setType(t)} />
                  ))}
                </XStack>
              </YStack>

              {createAsset.error ? <Paragraph color={C.danger}>{createAsset.error.message}</Paragraph> : null}

              <XStack>
                <Btn
                  label={createAsset.isLoading ? 'Adding…' : 'Add to locker'}
                  tone="primary"
                  disabled={createAsset.isLoading || !tag.trim() || !name.trim()}
                  onPress={addAsset}
                />
              </XStack>
            </YStack>
          ) : null}
        </YStack>

        {/* list */}
        {error ? (
          <Paragraph color={C.danger}>
            Couldn't reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you're signed in.
          </Paragraph>
        ) : assets.length === 0 ? (
          <YStack
            backgroundColor={C.panel}
            borderWidth={1}
            borderColor={C.line}
            borderRadius={14}
            paddingVertical={44}
            paddingHorizontal={20}
            alignItems="center"
            gap={7}
          >
            <Text fontSize={15} fontWeight="600" color={C.text}>
              The locker is empty
            </Text>
            <Text fontSize={13} color={C.muted}>
              Add your first asset above to start tracking it.
            </Text>
          </YStack>
        ) : (
          <YStack backgroundColor={C.panel} borderWidth={1} borderColor={C.line} borderRadius={14} overflow="hidden">
            {assets.map((a, i) => {
              const active = a.id === selected
              const holder = a.status === 'assigned' ? holderByTag.get(a.tag) : undefined
              return (
                <XStack
                  key={a.id}
                  alignItems="center"
                  gap={12}
                  paddingHorizontal={15}
                  paddingVertical={12}
                  cursor="pointer"
                  onPress={() => onSelect(active ? null : a.id)}
                  backgroundColor={active ? C.raised : 'transparent'}
                  hoverStyle={active ? {} : { backgroundColor: C.hover }}
                  borderTopWidth={i === 0 ? 0 : 1}
                  borderColor={C.line}
                  borderLeftWidth={3}
                  borderLeftColor={active ? C.brand : 'transparent'}
                >
                  <TypeTile type={a.type} size={34} />
                  <YStack flex={1} gap={5}>
                    <XStack alignItems="center" gap={8} flexWrap="wrap">
                      <TagChip tag={a.tag} emphasis={active} />
                      <Text fontSize={14} fontWeight="600" color={C.text} numberOfLines={1}>
                        {a.name}
                      </Text>
                    </XStack>
                    <Text fontSize={11.5} color={C.faint}>
                      {a.type}
                      {holder ? ` · held by ${holder}` : ''}
                    </Text>
                  </YStack>
                  {holder ? <PersonAvatar name={holder} size={24} /> : null}
                  <StatusBadge status={a.status} />
                </XStack>
              )
            })}
          </YStack>
        )}
      </YStack>

      {/* detail column */}
      <YStack flex={2} minWidth={320}>
        {current ? (
          <AssetDetail
            asset={current}
            history={history}
            holder={current.status === 'assigned' ? history[0]?.person : undefined}
            busy={busy}
            onAssign={assign}
            onStatus={setStatus}
            onDelete={del}
            onClose={() => onSelect(null)}
          />
        ) : (
          <YStack
            backgroundColor={C.panel}
            borderWidth={1}
            borderColor={C.line}
            borderRadius={14}
            borderStyle="dashed"
            paddingVertical={56}
            paddingHorizontal={22}
            alignItems="center"
            gap={9}
          >
            <TypeTile type="?" size={40} />
            <Text fontSize={14} fontWeight="600" color={C.text}>
              Select an asset
            </Text>
            <Text fontSize={12.5} color={C.muted} textAlign="center">
              Pick a row to see its details, holder, and full assignment history.
            </Text>
          </YStack>
        )}
      </YStack>
    </XStack>
  )
}

interface DetailProps {
  asset: Asset
  history: Assignment[]
  holder?: string
  busy: boolean
  onAssign: (person: string, since: string) => Promise<void>
  onStatus: (status: string) => Promise<void>
  onDelete: () => Promise<void>
  onClose: () => void
}

function AssetDetail({ asset, history, holder, busy, onAssign, onStatus, onDelete, onClose }: DetailProps) {
  const [person, setPerson] = useState('')
  const [since, setSince] = useState(today())
  const m = statusMeta(asset.status)

  async function submitAssign() {
    const p = person.trim()
    if (!p || busy) return
    await onAssign(p, since || today())
    setPerson('')
    setSince(today())
  }

  return (
    <YStack backgroundColor={C.panel} borderWidth={1} borderColor={C.line} borderRadius={14} overflow="hidden">
      {/* accent header */}
      <YStack height={3} backgroundColor={m.color} />
      <YStack padding={18} gap={16}>
        <XStack alignItems="flex-start" justifyContent="space-between" gap={12}>
          <YStack gap={9} flex={1}>
            <TagChip tag={asset.tag} emphasis />
            <Text fontSize={19} fontWeight="700" color={C.text}>
              {asset.name}
            </Text>
          </YStack>
          <XStack
            cursor="pointer"
            onPress={onClose}
            width={28}
            height={28}
            borderRadius={8}
            alignItems="center"
            justifyContent="center"
            hoverStyle={{ backgroundColor: C.hover }}
          >
            <Text fontSize={16} color={C.faint}>
              ✕
            </Text>
          </XStack>
        </XStack>

        <XStack alignItems="center" gap={10}>
          <StatusBadge status={asset.status} />
        </XStack>

        <XStack gap={16} flexWrap="wrap">
          <Field label="Type">{asset.type}</Field>
          <Field label="Added">{fmtDate(asset.created)}</Field>
        </XStack>

        <Separator borderColor={C.line} />

        {/* holder / assign */}
        {holder ? (
          <YStack gap={12}>
            <Text fontSize={11} color={C.faint} textTransform="uppercase" letterSpacing={0.7}>
              Current holder
            </Text>
            <XStack alignItems="center" gap={12} backgroundColor={C.bg} borderRadius={12} borderWidth={1} borderColor={C.line} padding={13}>
              <PersonAvatar name={holder} size={38} />
              <YStack flex={1} gap={3}>
                <Text fontSize={14.5} fontWeight="700" color={C.text}>
                  {holder}
                </Text>
                <Text fontSize={12} color={C.muted}>
                  Since {fmtDate(history[0]?.since)} · {elapsed(history[0]?.since)}
                </Text>
              </YStack>
              <Btn label="Return" tone="ghost" size="sm" disabled={busy} onPress={() => onStatus('available')} />
            </XStack>
          </YStack>
        ) : (
          <YStack gap={10}>
            <Text fontSize={11} color={C.faint} textTransform="uppercase" letterSpacing={0.7}>
              Assign to
            </Text>
            <XStack gap={9} flexWrap="wrap" alignItems="flex-end">
              <YStack flex={2} minWidth={150} gap={6}>
                <Input
                  value={person}
                  placeholder="Person's name"
                  onChangeText={setPerson}
                  onSubmitEditing={submitAssign}
                  backgroundColor={C.bg}
                  borderColor={C.line}
                  color={C.text}
                />
              </YStack>
              <YStack flex={1} minWidth={120} gap={6}>
                <Input
                  value={since}
                  placeholder="YYYY-MM-DD"
                  onChangeText={setSince}
                  backgroundColor={C.bg}
                  borderColor={C.line}
                  color={C.text}
                />
              </YStack>
              <Btn label="Assign" tone="primary" disabled={busy || !person.trim()} onPress={submitAssign} />
            </XStack>
          </YStack>
        )}

        {/* status control */}
        <YStack gap={9}>
          <Text fontSize={11} color={C.faint} textTransform="uppercase" letterSpacing={0.7}>
            Set status
          </Text>
          <XStack gap={8} flexWrap="wrap">
            {STATUS_ORDER.filter((s) => s !== 'assigned').map((s) => (
              <ChipToggle
                key={s}
                label={statusMeta(s).label}
                active={asset.status === s}
                color={statusMeta(s).color}
                onPress={() => onStatus(s)}
              />
            ))}
          </XStack>
        </YStack>

        <Separator borderColor={C.line} />

        {/* history timeline */}
        <YStack gap={12}>
          <Text fontSize={11} color={C.faint} textTransform="uppercase" letterSpacing={0.7}>
            History
          </Text>
          {history.length === 0 ? (
            <Text fontSize={13} color={C.muted}>
              No assignments yet — this asset has never left the locker.
            </Text>
          ) : (
            <YStack>
              {history.map((h, i) => (
                <XStack key={h.id} gap={12}>
                  {/* rail */}
                  <YStack alignItems="center" width={12}>
                    <Dot color={i === 0 && holder ? C.brand : C.faint} size={9} />
                    {i < history.length - 1 ? <YStack flex={1} width={2} backgroundColor={C.line} minHeight={26} /> : null}
                  </YStack>
                  <XStack flex={1} gap={10} alignItems="center" paddingBottom={i < history.length - 1 ? 16 : 0}>
                    <PersonAvatar name={h.person} size={26} />
                    <YStack flex={1}>
                      <Text fontSize={13.5} fontWeight="600" color={C.text}>
                        {h.person}
                      </Text>
                      <Text fontSize={11.5} color={C.faint}>
                        Assigned {fmtDate(h.since)}
                      </Text>
                    </YStack>
                    {i === 0 && holder ? (
                      <Text fontSize={11} fontWeight="600" color={C.brand}>
                        current
                      </Text>
                    ) : null}
                  </XStack>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>

        <Separator borderColor={C.line} />

        <XStack>
          <Btn label="Delete asset" tone="danger" size="sm" disabled={busy} onPress={onDelete} />
        </XStack>
      </YStack>
    </YStack>
  )
}
