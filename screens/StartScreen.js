import {
  BlackHanSans_400Regular,
  useFonts,
} from '@expo-google-fonts/black-han-sans'
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import { useEffect, useRef } from 'react'
import {
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { STAGES } from '../utils/gameConfig'

const BASE_W = 390
const MAX_W = 440

const C = {
  bg: '#F8F6F2',
  surface: '#FFFFFF',
  border: '#EAE5DC',
  borderMid: '#D4CEC4',
  accent: '#E8420A',
  accentDim: '#E8420A14',
  amber: '#C97A08',
  amberLight: '#FEF6E4',
  text: '#18130E',
  textMid: '#5A5148',
  textDim: '#A09488',
  textFaint: '#CEC8C0',
  shadow: '#6B5A40',
  green: '#158040',
}

export default function StartScreen({ onStart, highScore }) {
  const { width: W, height: H } = useWindowDimensions()
  const cw = Math.min(W, MAX_W)
  const sc = (n) => Math.round((cw / BASE_W) * n)
  const vh = (n) => Math.round((H / 844) * n)

  const [fontsLoaded] = useFonts({
    BlackHanSans_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  const a0 = useRef(new Animated.Value(0)).current,
    y0 = useRef(new Animated.Value(-22)).current
  const a1 = useRef(new Animated.Value(0)).current,
    s1 = useRef(new Animated.Value(0.84)).current
  const a2 = useRef(new Animated.Value(0)).current,
    y2 = useRef(new Animated.Value(18)).current
  const a3 = useRef(new Animated.Value(0)).current,
    y3 = useRef(new Animated.Value(18)).current
  const a4 = useRef(new Animated.Value(0)).current,
    y4 = useRef(new Animated.Value(18)).current

  const floatY = useRef(new Animated.Value(0)).current
  const orbS = useRef(new Animated.Value(1)).current
  const btnS = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!fontsLoaded) return
    Animated.sequence([
      Animated.parallel([
        Animated.timing(a0, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(y0, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(a1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(s1, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(55, [
        Animated.parallel([
          Animated.timing(a2, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.spring(y2, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(a3, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.spring(y3, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(a4, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.spring(y4, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(btnS, {
          toValue: 1.03,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(btnS, {
          toValue: 0.97,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbS, {
          toValue: 1.3,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(orbS, {
          toValue: 0.8,
          duration: 4500,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [fontsLoaded])

  if (!fontsLoaded)
    return (
      <View
        style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <Text style={{ fontSize: 32 }}>🥚</Text>
      </View>
    )

  const eras = [
    { label: 'PRIMORDIAL', emojis: '🦠🫧🪼', color: '#158040' },
    { label: 'SEA LIFE', emojis: '🐟🐙🦈', color: '#1256A8' },
    { label: 'LAND', emojis: '🐸🦎🦕', color: '#4A7A20' },
    { label: 'WARM BLOOD', emojis: '🐇🐺🐻', color: '#5C3D28' },
    { label: 'APEX', emojis: '🦅🦁', color: '#C04A00' },
    { label: 'HUMAN ERA', emojis: '🦧🧬🤖', color: '#1A237E' },
    { label: 'GOD MODE', emojis: '👽🌌✨', color: '#5A1490' },
  ]

  const T = {
    title: { fontFamily: 'BlackHanSans_400Regular' },
    body: { fontFamily: 'Inter_400Regular' },
    bold: { fontFamily: 'Inter_700Bold' },
    semi: { fontFamily: 'Inter_600SemiBold' },
  }

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={[s.bgOrb, { transform: [{ scale: orbS }] }]} />
      <Animated.View style={[s.bgOrb2, { transform: [{ scale: orbS }] }]} />

      <View style={[s.col, { maxWidth: MAX_W, paddingHorizontal: sc(20) }]}>
        {/* ── HEADER RULE ── */}
        <Animated.View
          style={[s.topRule, { opacity: a0, transform: [{ translateY: y0 }] }]}
        >
          <View style={s.ruleLine} />
          <View
            style={[
              s.rulePill,
              {
                paddingHorizontal: sc(14),
                paddingVertical: sc(5),
                borderRadius: sc(20),
              },
            ]}
          >
            <Text style={[T.semi, s.ruleTxt, { fontSize: sc(8) }]}>
              EVOLUTION TAP
            </Text>
          </View>
          <View style={s.ruleLine} />
        </Animated.View>

        {/* ── HERO CARD ── */}
        <Animated.View
          style={[
            s.heroCard,
            {
              opacity: a1,
              transform: [{ scale: s1 }],
              borderRadius: sc(22),
              paddingVertical: vh(16),
              paddingHorizontal: sc(20),
            },
          ]}
        >
          <Animated.Text
            style={{ fontSize: sc(60), transform: [{ translateY: floatY }] }}
          >
            🥚
          </Animated.Text>
          <View style={{ overflow: 'hidden' }}>
            <Text style={[T.title, s.heroTitle, { fontSize: sc(50) }]}>
              EVOLVE
            </Text>
          </View>
          <Text style={[T.body, s.heroSub, { fontSize: sc(13) }]}>
            or go extinct
          </Text>
          <View style={[s.pillRow, { gap: sc(8), marginTop: vh(10) }]}>
            {[
              ['20', 'STAGES'],
              ['7', 'ERAS'],
              ['1', 'LIFE'],
            ].map(([n, l]) => (
              <View
                key={l}
                style={[
                  s.pill,
                  {
                    paddingVertical: sc(6),
                    paddingHorizontal: sc(14),
                    borderRadius: sc(28),
                  },
                ]}
              >
                <Text style={[T.title, s.pillNum, { fontSize: sc(20) }]}>
                  {n}
                </Text>
                <Text style={[T.bold, s.pillLabel, { fontSize: sc(8) }]}>
                  {l}
                </Text>
              </View>
            ))}
          </View>
          {highScore > 0 && (
            <View
              style={[
                s.hsBadge,
                {
                  paddingVertical: sc(7),
                  paddingHorizontal: sc(16),
                  borderRadius: sc(40),
                  marginTop: vh(8),
                },
              ]}
            >
              <Text style={[T.bold, s.hsLabel, { fontSize: sc(9) }]}>
                BEST{' '}
              </Text>
              <Text style={[T.title, s.hsNum, { fontSize: sc(20) }]}>
                {highScore}
              </Text>
              <Text style={[T.body, s.hsOf, { fontSize: sc(13) }]}>
                /{STAGES.length}{' '}
              </Text>
              <Text style={{ fontSize: sc(20) }}>
                {STAGES[Math.min(highScore - 1, STAGES.length - 1)].emoji}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ── ERA MAP ── */}
        <Animated.View
          style={[
            s.card,
            {
              opacity: a2,
              transform: [{ translateY: y2 }],
              borderRadius: sc(18),
              padding: sc(14),
            },
          ]}
        >
          <Text
            style={[
              T.bold,
              s.cardLabel,
              { fontSize: sc(8), marginBottom: sc(10) },
            ]}
          >
            YOUR JOURNEY — 7 ERAS · 20 STAGES
          </Text>
          <View style={s.eraGrid}>
            {eras.map((era, i) => (
              <View
                key={i}
                style={[
                  s.eraItem,
                  {
                    borderRadius: sc(10),
                    padding: sc(7),
                    borderColor: era.color + '30',
                  },
                ]}
              >
                <Text style={{ fontSize: sc(14), textAlign: 'center' }}>
                  {era.emojis}
                </Text>
                <Text
                  style={[
                    T.bold,
                    s.eraLabel,
                    { fontSize: sc(8), color: era.color },
                  ]}
                >
                  {era.label}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── RULES ── */}
        <Animated.View
          style={[
            s.card,
            {
              opacity: a3,
              transform: [{ translateY: y3 }],
              borderRadius: sc(18),
              padding: sc(14),
            },
          ]}
        >
          <Text
            style={[
              T.bold,
              s.cardLabel,
              { fontSize: sc(8), marginBottom: sc(8) },
            ]}
          >
            HOW TO PLAY
          </Text>
          {[
            ['🎯', 'Tap when the bar hits the zone'],
            ['⚡', 'Every 4th tap = Mutation Boost'],
            ['💀', 'Miss once — extinct forever'],
            ['🏆', 'Clear all 20 to be Omniscient'],
          ].map(([icon, rule], i, arr) => (
            <View
              key={i}
              style={[
                s.ruleRow,
                {
                  gap: sc(10),
                  paddingVertical: sc(7),
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: C.border,
                },
              ]}
            >
              <Text style={{ fontSize: sc(15) }}>{icon}</Text>
              <Text style={[T.body, s.ruleTxtItem, { fontSize: sc(12) }]}>
                {rule}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* ── CTA ── */}
        <Animated.View
          style={[
            {
              opacity: a4,
              transform: [{ translateY: y4 }],
              alignItems: 'center',
              gap: sc(8),
              paddingBottom: sc(4),
            },
          ]}
        >
          <Animated.View
            style={{ transform: [{ scale: btnS }], width: '100%' }}
          >
            <Pressable
              style={({ pressed }) => [
                s.btn,
                { paddingVertical: sc(19), borderRadius: sc(14) },
                pressed && { opacity: 0.88 },
              ]}
              onPress={onStart}
            >
              <Text style={[T.title, s.btnTxt, { fontSize: sc(18) }]}>
                TAP TO BEGIN →
              </Text>
            </Pressable>
          </Animated.View>
          <Text
            style={[
              T.body,
              { color: C.textFaint, letterSpacing: 2, fontSize: sc(10) },
            ]}
          >
            one tap · one life · no second chances
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg, alignItems: 'center' },
  bgOrb: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: C.accentDim,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1565C014',
  },
  col: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },

  topRule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  ruleLine: { flex: 1, height: 1, backgroundColor: C.border },
  rulePill: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  ruleTxt: { color: C.textDim, letterSpacing: 4 },

  heroCard: {
    backgroundColor: C.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOpacity: 0.13,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 9,
  },
  heroTitle: { color: C.text, letterSpacing: 2, marginTop: 2 },
  heroSub: { color: C.textDim, letterSpacing: 5, marginTop: 2 },
  pillRow: { flexDirection: 'row' },
  pill: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  pillNum: { color: C.text },
  pillLabel: { color: C.textDim, letterSpacing: 2 },
  hsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.amberLight,
    borderWidth: 1,
    borderColor: C.amber + '50',
  },
  hsLabel: { color: C.amber, letterSpacing: 3 },
  hsNum: { color: C.text },
  hsOf: { color: C.textDim },

  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: { color: C.textDim, letterSpacing: 3 },
  eraGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  eraItem: {
    backgroundColor: C.bg,
    borderWidth: 1,
    alignItems: 'center',
    flex: 1,
    minWidth: 70,
  },
  eraLabel: { letterSpacing: 0.5, textAlign: 'center' },
  ruleRow: { flexDirection: 'row', alignItems: 'center' },
  ruleTxtItem: { color: C.textMid, flex: 1 },

  btn: {
    backgroundColor: C.accent,
    width: '100%',
    alignItems: 'center',
    shadowColor: C.accent,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 12,
  },
  btnTxt: { color: '#FFF', letterSpacing: 3 },
})
