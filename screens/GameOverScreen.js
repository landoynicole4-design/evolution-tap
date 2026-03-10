import {
  BlackHanSans_400Regular,
  useFonts,
} from '@expo-google-fonts/black-han-sans'
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import * as Haptics from 'expo-haptics'
import * as MediaLibrary from 'expo-media-library'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { STAGES } from '../utils/gameConfig'
import { playSound } from '../utils/soundManager'

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
  greenLight: '#EAF6EF',
  danger: '#C82020',
  dangerLight: '#FFF0F0',
}

// ─── Confetti particle component (win only) ───────────────────────────────────
function ConfettiParticle({ delay, color, sc }) {
  const translateY = useRef(new Animated.Value(-20)).current
  const translateX = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const rotate = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0)).current

  const startX = (Math.random() - 0.5) * 300
  const size = sc(6 + Math.random() * 6)

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 600 + Math.random() * 200,
          duration: 1800 + Math.random() * 800,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: startX,
          duration: 1800 + Math.random() * 800,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 5),
          duration: 1800 + Math.random() * 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(1200),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ])
    anim.start()
  }, [])

  const spin = rotate.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-360deg', '360deg'],
  })

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 80,
        left: '50%',
        width: size,
        height: size,
        borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        backgroundColor: color,
        opacity,
        transform: [
          { translateX },
          { translateY },
          { rotate: spin },
          { scale },
        ],
      }}
    />
  )
}

const CONFETTI_COLORS = [
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
]

function ConfettiBurst({ sc }) {
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    delay: Math.random() * 600,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  }))

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} color={p.color} sc={sc} />
      ))}
    </View>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

// Animated card wrapper — slides up + fades in
function SlideCard({ anim, translateY, children, style }) {
  return (
    <Animated.View
      style={[
        {
          opacity: anim,
          transform: [
            {
              translateY: translateY.interpolate({
                inputRange: [0, 1],
                outputRange: [32, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  )
}

export default function GameOverScreen({
  score,
  highScore,
  isNewRecord,
  hapticsEnabled,
  onRestart,
  onHome,
}) {
  const { width: W, height: H } = useWindowDimensions()
  const cw = Math.min(W, MAX_W)
  const sc = (n) => Math.round((cw / BASE_W) * n)
  // Scale by screen height so all content fits without scrolling
  // Base design height is 844 (iPhone 14). Clamp so tall phones don't over-inflate.
  const BASE_H = 844
  const hScale = Math.min(H / BASE_H, 1.0)
  const vh = (n) => Math.round(n * hScale)

  const [fontsLoaded] = useFonts({
    BlackHanSans_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  const [capturing, setCapturing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const fullScreenRef = useRef(null)

  const isWin = score >= STAGES.length
  const reached = STAGES[Math.min(score, STAGES.length - 1)]
  const learnStage = STAGES[Math.min(score, STAGES.length - 1)]
  const pct = Math.round((score / STAGES.length) * 100)
  const stars =
    score === STAGES.length ? 3 : score >= 12 ? 2 : score >= 6 ? 1 : 0

  const accentColor = isWin ? C.green : score >= 10 ? C.amber : C.danger
  const accentLight = isWin
    ? C.greenLight
    : score >= 10
      ? C.amberLight
      : C.dangerLight
  const accentDimBg = isWin
    ? C.green + '14'
    : score >= 10
      ? C.amber + '14'
      : C.danger + '14'
  const mainEmoji = isWin ? '🏆' : score >= 12 ? '🌿' : score >= 6 ? '🦴' : '💀'
  const outcomeLabel = isWin ? 'EXTINCTION AVOIDED' : 'SPECIES LOST'

  // ── Animation values ────────────────────────────────────────────────────────
  const headerAnim = useRef(new Animated.Value(0)).current
  const headerSlide = useRef(new Animated.Value(0)).current

  const heroAnim = useRef(new Animated.Value(0)).current
  const heroSlide = useRef(new Animated.Value(0)).current
  const heroScale = useRef(new Animated.Value(0.88)).current

  const infoAnim = useRef(new Animated.Value(0)).current
  const infoSlide = useRef(new Animated.Value(0)).current

  const progressAnim = useRef(new Animated.Value(0)).current
  const progressSlide = useRef(new Animated.Value(0)).current

  const buttonsAnim = useRef(new Animated.Value(0)).current
  const buttonsSlide = useRef(new Animated.Value(0)).current

  const floatY = useRef(new Animated.Value(0)).current
  const orbS = useRef(new Animated.Value(1)).current
  const btnPulse = useRef(new Animated.Value(1)).current
  const barPct = useRef(new Animated.Value(0)).current
  const recordS = useRef(new Animated.Value(0)).current
  const screenshotFlash = useRef(new Animated.Value(0)).current

  const starAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ]
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isWin) playSound('win')
    else playSound('extinct')
  }, [isWin])

  useEffect(() => {
    if (!fontsLoaded) return

    const makeSlideIn = (anim, slide, delay, duration = 320) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(slide, {
            toValue: 1,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ])

    Animated.parallel([
      // Staggered card entrances
      makeSlideIn(headerAnim, headerSlide, 0, 280),
      Animated.sequence([
        Animated.delay(80),
        Animated.parallel([
          Animated.timing(heroAnim, {
            toValue: 1,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(heroSlide, {
            toValue: 1,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(heroScale, {
            toValue: 1,
            friction: 7,
            tension: 60,
            useNativeDriver: true,
          }),
        ]),
      ]),
      makeSlideIn(infoAnim, infoSlide, 220, 340),
      makeSlideIn(progressAnim, progressSlide, 340, 340),
      makeSlideIn(buttonsAnim, buttonsSlide, 440, 320),

      // Stars stagger (after hero settles)
      Animated.sequence([
        Animated.delay(500),
        Animated.stagger(
          130,
          starAnims
            .slice(0, stars)
            .map((a) =>
              Animated.spring(a, {
                toValue: 1,
                friction: 3,
                tension: 110,
                useNativeDriver: true,
              })
            )
        ),
      ]),

      // Progress bar fill
      Animated.sequence([
        Animated.delay(560),
        Animated.timing(barPct, {
          toValue: pct,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),

      // New record badge
      ...(isNewRecord
        ? [
            Animated.sequence([
              Animated.delay(700),
              Animated.spring(recordS, {
                toValue: 1,
                friction: 3,
                tension: 90,
                useNativeDriver: true,
              }),
            ]),
          ]
        : []),
    ]).start(() => {
      if (isWin) setShowConfetti(true)
    })

    // Ambient loops
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -10,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbS, {
          toValue: 1.25,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(orbS, {
          toValue: 0.85,
          duration: 4500,
          useNativeDriver: true,
        }),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(btnPulse, {
          toValue: 1.025,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(btnPulse, {
          toValue: 0.975,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsLoaded])

  const haptic = (style) => {
    if (hapticsEnabled !== false) Haptics.impactAsync(style).catch(() => {})
  }

  const handleScreenshot = async () => {
    if (capturing) return
    try {
      setCapturing(true)
      haptic(Haptics.ImpactFeedbackStyle.Medium)
      playSound('tap')

      screenshotFlash.setValue(1)
      Animated.timing(screenshotFlash, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }).start()

      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow photo library access to save.')
        setCapturing(false)
        return
      }

      await new Promise((res) => setTimeout(res, 80))
      const uri = await captureRef(fullScreenRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      })
      await MediaLibrary.saveToLibraryAsync(uri)
      setSaved(true)
      if (hapticsEnabled !== false)
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {})
      setTimeout(() => setSaved(false), 3000)

      await Share.share({
        message: `I evolved to ${reached.emoji} ${reached.name} in Evolution Tap! Score: ${score}/${STAGES.length} 🧬`,
        url: uri,
      })
    } catch (_e) {
      Alert.alert('Screenshot failed', 'Could not capture the screen.')
    } finally {
      setCapturing(false)
    }
  }

  if (!fontsLoaded)
    return (
      <View
        style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <Text style={{ fontSize: 40 }}>{mainEmoji}</Text>
      </View>
    )

  const T = {
    title: { fontFamily: 'BlackHanSans_400Regular' },
    body: { fontFamily: 'Inter_400Regular' },
    bold: { fontFamily: 'Inter_700Bold' },
    semi: { fontFamily: 'Inter_600SemiBold' },
  }

  return (
    <View ref={fullScreenRef} collapsable={false} style={s.root}>
      <SafeAreaView style={s.safe}>
        {/* Ambient orbs */}
        <Animated.View
          style={[
            s.bgOrb,
            { backgroundColor: accentDimBg, transform: [{ scale: orbS }] },
          ]}
        />
        <Animated.View
          style={[
            s.bgOrb2,
            { backgroundColor: C.accentDim, transform: [{ scale: orbS }] },
          ]}
        />

        {/* Confetti on win */}
        {showConfetti && <ConfettiBurst sc={sc} />}

        {/* Root column — fills SafeAreaView exactly, no scrolling */}
        <View style={[s.content, { paddingHorizontal: sc(16) }]}>
          {/* ── Header (fixed height) ── */}
          <SlideCard
            anim={headerAnim}
            translateY={headerSlide}
            style={s.header}
          >
            <Pressable
              onPress={handleScreenshot}
              disabled={capturing}
              style={({ pressed }) => [
                s.shotBtn,
                {
                  width: sc(36),
                  height: sc(36),
                  borderRadius: sc(10),
                  backgroundColor: saved ? accentLight : C.surface,
                  borderColor: saved ? accentColor + '60' : C.border,
                  opacity: pressed ? 0.65 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: sc(16) }}>
                {capturing ? '⏳' : saved ? '✅' : '📸'}
              </Text>
            </Pressable>

            <View
              style={[
                s.outcomePill,
                {
                  backgroundColor: accentColor + '15',
                  borderColor: accentColor + '40',
                },
              ]}
            >
              <Text
                style={[
                  T.semi,
                  { fontSize: sc(11), color: accentColor, letterSpacing: 2 },
                ]}
              >
                {isWin ? '🏆' : '💀'} {outcomeLabel}
              </Text>
            </View>

            <View style={{ width: sc(36) }} />
          </SlideCard>

          {/* ── Hero Card (flex: 3) ── */}
          <Animated.View
            style={[
              s.heroCard,
              {
                flex: 3,
                opacity: heroAnim,
                transform: [
                  {
                    translateY: heroSlide.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                  { scale: heroScale },
                ],
                borderRadius: sc(20),
                marginTop: sc(8),
                paddingHorizontal: sc(16),
                paddingVertical: sc(8),
              },
            ]}
          >
            <Animated.Text
              style={[
                s.heroEmoji,
                { fontSize: sc(54), transform: [{ translateY: floatY }] },
              ]}
            >
              {mainEmoji}
            </Animated.Text>

            <Text
              style={[
                T.title,
                s.heroTitle,
                { fontSize: sc(50), color: accentColor },
              ]}
            >
              {isWin ? 'EVOLVED' : 'EXTINCT'}
            </Text>

            <View style={s.reachedRow}>
              <Text
                style={[
                  T.body,
                  { fontSize: sc(13), color: C.textDim, letterSpacing: 2 },
                ]}
              >
                {isWin ? 'a l l  2 0  e r a s' : 'r e a c h e d'}
              </Text>
              {!isWin && (
                <>
                  <Text style={{ fontSize: sc(17), marginHorizontal: sc(5) }}>
                    {reached.emoji}
                  </Text>
                  <Text
                    style={[
                      T.body,
                      { fontSize: sc(13), color: C.textDim, letterSpacing: 2 },
                    ]}
                  >
                    {reached.name}
                  </Text>
                </>
              )}
            </View>

            {stars > 0 && (
              <View style={[s.starsRow, { marginTop: sc(6) }]}>
                {[0, 1, 2].map((i) => (
                  <Animated.Text
                    key={i}
                    style={{
                      fontSize: sc(24),
                      color: i < stars ? C.amber : C.textFaint,
                      transform: [
                        {
                          scale:
                            i < stars ? starAnims[i] : new Animated.Value(1),
                        },
                      ],
                      marginHorizontal: sc(4),
                    }}
                  >
                    ★
                  </Animated.Text>
                ))}
              </View>
            )}

            <View style={[s.statsRow, { marginTop: sc(8), gap: sc(8) }]}>
              {[
                { value: String(score), label: 'STAGES' },
                { value: String(highScore), label: 'BEST' },
                { value: `${pct}%`, label: 'EVOLVED', highlight: true },
              ].map(({ value, label, highlight }) => (
                <View
                  key={label}
                  style={[
                    s.statPill,
                    {
                      paddingVertical: sc(8),
                      paddingHorizontal: sc(10),
                      borderRadius: sc(50),
                      backgroundColor: highlight ? accentLight : C.bg,
                      borderColor: highlight ? accentColor + '50' : C.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      T.title,
                      {
                        fontSize: sc(24),
                        color: highlight ? accentColor : C.text,
                      },
                    ]}
                  >
                    {value}
                  </Text>
                  <Text
                    style={[
                      T.bold,
                      {
                        fontSize: sc(9),
                        color: highlight ? accentColor : C.textDim,
                        letterSpacing: 1.5,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            {isNewRecord && (
              <Animated.View
                style={[
                  s.recordBadge,
                  {
                    transform: [{ scale: recordS }],
                    backgroundColor: C.amberLight,
                    borderColor: C.amber + '50',
                    marginTop: sc(6),
                    paddingVertical: sc(4),
                    paddingHorizontal: sc(12),
                    borderRadius: sc(20),
                  },
                ]}
              >
                <Text
                  style={[
                    T.bold,
                    { fontSize: sc(10), color: C.amber, letterSpacing: 2 },
                  ]}
                >
                  ✦ NEW RECORD
                </Text>
              </Animated.View>
            )}
          </Animated.View>

          {/* ── Did You Know Card (flex: 2.2) ── */}
          <SlideCard
            anim={infoAnim}
            translateY={infoSlide}
            style={[
              s.infoCard,
              { flex: 2.2, borderRadius: sc(16), marginTop: sc(8) },
            ]}
          >
            <View
              style={[
                s.infoHeader,
                { paddingVertical: sc(6), paddingHorizontal: sc(12) },
              ]}
            >
              <Text
                style={[
                  T.bold,
                  { fontSize: sc(10), color: C.textMid, letterSpacing: 2 },
                ]}
              >
                📚 DID YOU KNOW?
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                padding: sc(10),
                justifyContent: 'space-between',
              }}
            >
              <View style={s.creatureRow}>
                <View
                  style={[
                    s.emojiCircle,
                    {
                      width: sc(48),
                      height: sc(48),
                      borderRadius: sc(14),
                      backgroundColor: learnStage.color + '18',
                      borderColor: learnStage.color + '35',
                    },
                  ]}
                >
                  <Text style={{ fontSize: sc(30) }}>{learnStage.emoji}</Text>
                </View>

                <View style={[s.creatureInfo, { marginLeft: sc(10) }]}>
                  <Text
                    style={[
                      T.title,
                      { fontSize: sc(17), color: learnStage.color },
                    ]}
                  >
                    {learnStage.name.toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      T.body,
                      {
                        fontSize: sc(11),
                        color: C.textDim,
                        fontStyle: 'italic',
                      },
                    ]}
                  >
                    {learnStage.sciName}
                  </Text>
                  <View
                    style={[
                      s.periodBadge,
                      {
                        backgroundColor: learnStage.color + '15',
                        borderColor: learnStage.color + '30',
                        marginTop: sc(4),
                        paddingVertical: sc(2),
                        paddingHorizontal: sc(8),
                        borderRadius: sc(20),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        T.bold,
                        { fontSize: sc(9), color: learnStage.color },
                      ]}
                    >
                      {learnStage.period}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  s.factBox,
                  {
                    backgroundColor: learnStage.color + '10',
                    borderColor: learnStage.color + '28',
                    padding: sc(8),
                    borderRadius: sc(10),
                    marginTop: sc(8),
                  },
                ]}
              >
                <Text
                  style={[
                    T.bold,
                    {
                      fontSize: sc(9),
                      color: learnStage.color,
                      letterSpacing: 1.5,
                      marginBottom: sc(3),
                    },
                  ]}
                >
                  🔬 FUN FACT
                </Text>
                <Text
                  style={[
                    T.body,
                    { fontSize: sc(12), color: C.textMid, lineHeight: sc(17) },
                  ]}
                >
                  {learnStage.fact}
                </Text>
              </View>
            </View>
          </SlideCard>

          {/* ── Evolution Progress Card (flex: 1.6) ── */}
          <SlideCard
            anim={progressAnim}
            translateY={progressSlide}
            style={[
              s.progressCard,
              { flex: 1.6, borderRadius: sc(16), marginTop: sc(8) },
            ]}
          >
            <View
              style={[
                s.progressHeaderRow,
                {
                  paddingHorizontal: sc(12),
                  paddingTop: sc(8),
                  paddingBottom: sc(4),
                },
              ]}
            >
              <Text
                style={[
                  T.bold,
                  { fontSize: sc(10), color: C.textDim, letterSpacing: 2 },
                ]}
              >
                EVOLUTION PROGRESS
              </Text>
              <Text style={[T.bold, { fontSize: sc(13), color: accentColor }]}>
                {pct}%
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: sc(12),
                paddingBottom: sc(10),
                flex: 1,
                justifyContent: 'space-evenly',
              }}
            >
              <View
                style={[
                  s.progressTrack,
                  { height: sc(5), borderRadius: sc(3) },
                ]}
              >
                <Animated.View
                  style={[
                    s.progressFill,
                    {
                      width: barPct.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: accentColor,
                      borderRadius: sc(3),
                    },
                  ]}
                />
              </View>

              <Text style={[T.body, { fontSize: sc(11), color: C.textDim }]}>
                {score} of {STAGES.length} stages completed
              </Text>

              <View style={{ gap: sc(3) }}>
                {[0, 1].map((row) => (
                  <View key={row} style={s.miniGridRow}>
                    {STAGES.slice(row * 10, row * 10 + 10).map((st, i) => {
                      const globalIdx = row * 10 + i
                      const isDone = globalIdx < score || isWin
                      return (
                        <Text
                          key={globalIdx}
                          style={{
                            fontSize: sc(19),
                            opacity: isDone ? 1 : 0.18,
                          }}
                        >
                          {st.emoji}
                        </Text>
                      )
                    })}
                  </View>
                ))}
              </View>
            </View>
          </SlideCard>

          {/* ── Buttons (flex: 1.6) ── */}
          <SlideCard
            anim={buttonsAnim}
            translateY={buttonsSlide}
            style={[
              s.buttonsContainer,
              { flex: 1.6, marginTop: sc(8), marginBottom: sc(4) },
            ]}
          >
            <Animated.View
              style={[{ flex: 1 }, { transform: [{ scale: btnPulse }] }]}
            >
              <Pressable
                style={({ pressed }) => [
                  s.primaryBtn,
                  {
                    flex: 1,
                    borderRadius: sc(14),
                    backgroundColor: accentColor,
                    shadowColor: accentColor,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
                onPress={() => {
                  haptic(Haptics.ImpactFeedbackStyle.Medium)
                  onRestart()
                }}
              >
                <Text
                  style={[
                    T.title,
                    { fontSize: sc(20), color: '#fff', letterSpacing: 2 },
                  ]}
                >
                  TRY AGAIN →
                </Text>
              </Pressable>
            </Animated.View>

            <Pressable
              style={({ pressed }) => [
                s.secondaryBtn,
                {
                  flex: 1,
                  borderRadius: sc(14),
                  marginTop: sc(6),
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={() => {
                haptic(Haptics.ImpactFeedbackStyle.Light)
                onHome()
              }}
            >
              <Text
                style={[
                  T.bold,
                  { fontSize: sc(14), color: C.textMid, letterSpacing: 1 },
                ]}
              >
                ← BACK TO HOME
              </Text>
            </Pressable>

            <Text
              style={[
                T.body,
                s.footerLabel,
                { fontSize: sc(10), marginTop: sc(6) },
              ]}
            >
              EVOLUTION TAP · evolve or go extinct
            </Text>
          </SlideCard>
        </View>
      </SafeAreaView>

      {/* Shutter flash */}
      <Animated.View
        pointerEvents="none"
        style={[s.flash, { opacity: screenshotFlash }]}
      />
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1, alignItems: 'center', width: '100%' },
  // Main column fills the safe area — no scroll, everything flex-distributed
  content: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MAX_W,
    paddingTop: 2,
  },

  bgOrb: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: -50,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#1565C014',
  },

  // Header — fixed, no flex
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  shotBtn: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  outcomePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },

  // Hero card
  heroCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  heroEmoji: { textAlign: 'center' },
  heroTitle: { textAlign: 'center', letterSpacing: 1, marginTop: 2 },
  reachedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'center' },
  statPill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    flex: 1,
  },
  recordBadge: { alignSelf: 'center', borderWidth: 1 },

  // Info card
  infoCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  infoHeader: { borderBottomWidth: 1, borderBottomColor: C.border },
  creatureRow: { flexDirection: 'row', alignItems: 'center' },
  emojiCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  creatureInfo: { flex: 1 },
  periodBadge: { alignSelf: 'flex-start', borderWidth: 1 },
  factBox: { borderWidth: 1 },

  // Progress card
  progressCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTrack: { backgroundColor: C.bg, overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%' },
  miniGridRow: { flexDirection: 'row', justifyContent: 'space-between' },

  // Buttons
  buttonsContainer: { justifyContent: 'flex-end' },
  primaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  secondaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.borderMid,
  },
  footerLabel: { textAlign: 'center', color: C.textFaint, letterSpacing: 2 },

  // Flash overlay
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
})
