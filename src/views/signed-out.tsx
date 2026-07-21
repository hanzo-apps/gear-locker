import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, ScrollView, Text, H1, Paragraph } from '@hanzo/gui'
import { C, MONO } from '../lib/theme'
import { STATUS_ORDER } from '../lib/model'
import { Wordmark, TagChip, StatusBadge, TypeTile, PersonAvatar, Btn } from '../ui/atoms'

/**
 * Signed-out landing — the pre-auth view. One action: PKCE sign-in with Hanzo
 * (hanzo.id owns every credential interaction; there is no local form). The
 * right-hand panel is the product's OWN asset list rendered with clearly
 * labelled sample gear — an honest illustration, not a live metric.
 */

const SAMPLE: { tag: string; name: string; type: string; status: string; who: string }[] = [
  { tag: 'LT-0342', name: 'MacBook Pro 16"', type: 'Laptop', status: 'assigned', who: 'Dana Cruz' },
  { tag: 'MN-1187', name: 'Dell U2723QE', type: 'Monitor', status: 'available', who: '' },
  { tag: 'PH-0091', name: 'iPhone 15 Pro', type: 'Phone', status: 'assigned', who: 'Sam Ito' },
  { tag: 'HS-0455', name: 'Sony WH-1000XM5', type: 'Headset', status: 'repair', who: '' },
]

function PreviewRow({ row }: { row: (typeof SAMPLE)[number] }) {
  return (
    <XStack
      alignItems="center"
      gap={12}
      paddingHorizontal={14}
      paddingVertical={11}
      borderBottomWidth={1}
      borderColor={C.line}
    >
      <TypeTile type={row.type} size={32} />
      <YStack flex={1} gap={5}>
        <XStack alignItems="center" gap={8}>
          <TagChip tag={row.tag} />
          <Text fontSize={13.5} fontWeight="600" color={C.text} numberOfLines={1}>
            {row.name}
          </Text>
        </XStack>
        <Text fontSize={11.5} color={C.faint}>
          {row.who ? `Held by ${row.who}` : 'In locker'}
        </Text>
      </YStack>
      {row.who ? <PersonAvatar name={row.who} size={24} /> : null}
      <StatusBadge status={row.status} />
    </XStack>
  )
}

export function SignedOut() {
  const { login, isLoading } = useIam()

  return (
    <ScrollView flex={1} backgroundColor={C.bg}>
      <YStack height={3} backgroundColor={C.brand} />
      <YStack alignItems="center" paddingHorizontal="$4" paddingVertical={56}>
        <YStack width="100%" maxWidth={1080} gap={52}>
          {/* nav */}
          <XStack alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={16}>
            <Wordmark size={34} />
            <Btn label="Sign in" tone="ghost" size="sm" disabled={isLoading} onPress={() => login()} />
          </XStack>

          {/* hero */}
          <XStack flexWrap="wrap" gap={44} alignItems="center">
            <YStack flex={1} minWidth={330} gap={22}>
              <XStack
                alignSelf="flex-start"
                backgroundColor={C.panel}
                borderColor={C.line}
                borderWidth={1}
                borderRadius={999}
                paddingHorizontal={12}
                paddingVertical={6}
                gap={8}
                alignItems="center"
              >
                <YStack width={7} height={7} borderRadius={999} backgroundColor={C.brand} />
                <Text fontSize={12.5} color={C.muted}>
                  Asset tracking on Hanzo
                </Text>
              </XStack>

              <H1 fontSize={52} lineHeight={56} fontWeight="800" color={C.text}>
                Every asset{'\n'}accounted for.
              </H1>

              <Paragraph fontSize={17} lineHeight={26} color={C.muted} maxWidth={470}>
                Track company laptops, monitors, and phones — who holds each one and what state
                it's in. Assign gear, log returns, and read the full history. Org-scoped in Hanzo
                Base, signed in with Hanzo.
              </Paragraph>

              <XStack gap={14} flexWrap="wrap" alignItems="center" paddingTop={2}>
                <Btn
                  label={isLoading ? 'Loading…' : 'Sign in with Hanzo'}
                  tone="primary"
                  size="lg"
                  disabled={isLoading}
                  onPress={() => login()}
                />
                <Text fontSize={13.5} color={C.faint}>
                  No passwords — IAM owns every credential.
                </Text>
              </XStack>

              <XStack gap={14} flexWrap="wrap" paddingTop={10}>
                {STATUS_ORDER.map((s) => (
                  <StatusBadge key={s} status={s} />
                ))}
              </XStack>
            </YStack>

            {/* product preview window */}
            <YStack
              flex={1}
              minWidth={360}
              backgroundColor={C.panel}
              borderRadius={16}
              borderWidth={1}
              borderColor={C.line}
              overflow="hidden"
              shadowColor="#000"
              shadowRadius={48}
              shadowOpacity={0.45}
              shadowOffset={{ width: 0, height: 26 }}
            >
              <XStack
                alignItems="center"
                gap={7}
                paddingHorizontal={14}
                paddingVertical={11}
                borderBottomWidth={1}
                borderColor={C.line}
                backgroundColor={C.raised}
              >
                <YStack width={10} height={10} borderRadius={999} backgroundColor="#ff5f57" />
                <YStack width={10} height={10} borderRadius={999} backgroundColor="#febc2e" />
                <YStack width={10} height={10} borderRadius={999} backgroundColor="#28c840" />
                <Text fontFamily={MONO} fontSize={12} color={C.faint} marginLeft={8}>
                  gear-locker.hanzo.app
                </Text>
              </XStack>

              <YStack padding={14} gap={12}>
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize={15} fontWeight="700" color={C.text}>
                    Assets
                  </Text>
                  <XStack
                    backgroundColor={C.bg}
                    borderWidth={1}
                    borderColor={C.line}
                    borderRadius={999}
                    paddingHorizontal={9}
                    paddingVertical={3}
                  >
                    <Text fontSize={11} color={C.faint} textTransform="uppercase" letterSpacing={0.8}>
                      sample
                    </Text>
                  </XStack>
                </XStack>

                <YStack backgroundColor={C.bg} borderRadius={12} borderWidth={1} borderColor={C.line} overflow="hidden">
                  {SAMPLE.map((row) => (
                    <PreviewRow key={row.tag} row={row} />
                  ))}
                </YStack>
              </YStack>
            </YStack>
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
