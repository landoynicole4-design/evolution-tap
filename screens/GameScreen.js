import {
  BlackHanSans_400Regular,
  useFonts,
} from '@expo-google-fonts/black-han-sans'
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import {
  FEEDBACK_DURATION,
  MUTATION_BONUS,
  MUTATION_DURATION,
  MUTATION_EVERY,
  STAGES,
  TICK_MS,
} from '../utils/gameConfig'
import { playCountdown, playSound } from '../utils/soundManager'

const BASE_W = 390
const BASE_H = 844
const MAX_W = 440

const C = {
  bg: '#F8F6F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F0ECE6',
  border: '#EAE5DC',
  accent: '#E8420A',
  text: '#18130E',
  textMid: '#5A5148',
  textDim: '#A09488',
  textFaint: '#CEC8C0',
  amber: '#C97A08',
  amberLight: '#FEF6E4',
  danger: '#D42020',
  dangerLight: '#FFF0F0',
  green: '#158040',
  greenLight: '#EEFBF3',
  shadow: '#6B5A40',
}

const rz = (w) => Math.random() * (100 - w)

export default function GameScreen({ onGameOver }) {
  const { width: W, height: H } = useWindowDimensions()
  const cw = Math.min(W, MAX_W)
  const sc = (n) => Math.round((cw / BASE_W) * n)
  const vsc = (n) => Math.round((H / BASE_H) * n)
  const PAD = sc(16)
  const BAR_W = cw - PAD * 2

  const [fontsLoaded] = useFonts({
    BlackHanSans_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  const [stageIdx, setStageIdx] = useState(0)
  const [indPos, setIndPos] = useState(0)
  const [zoneStart, setZoneStart] = useState(() => rz(STAGES[0].zoneWidth))
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [isMut, setIsMut] = useState(false)
  const [tapCount, setTapCount] = useState(0)

  const posRef = useRef(0)
  const dirRef = useRef(1)
  const stageRef = useRef(0)
  const zoneRef = useRef(zoneStart)
  const activeRef = useRef(false)
  const intRef = useRef(null)
  const tapRef = useRef(0)
  const mutRef = useRef(false)
  const mutTimer = useRef(null)

  const haptic = useCallback((style) => {
    Haptics.impactAsync(style).catch(() => {})
  }, [])

  const hapticNotif = useCallback((style) => {
    Haptics.notificationAsync(style).catch(() => {})
  }, [])

  // Animated values
  const cScale = useRef(new Animated.Value(1)).current
  const cRotate = useRef(new Animated.Value(0)).current
  const flashRed = useRef(new Animated.Value(0)).current
  const flashGreen = useRef(new Animated.Value(0)).current
  const zPulse = useRef(new Animated.Value(1)).current
  const mutA = useRef(new Animated.Value(0)).current
  const glowScale = useRef(new Animated.Value(0.8)).current
  const glowOpacity = useRef(new Animated.Value(0.3)).current
  const cdNum = useRef(new Animated.Value(1)).current
  const cdRing1 = useRef(new Animated.Value(0)).current
  const cdRing2 = useRef(new Animated.Value(0)).current
  const cdRing3 = useRef(new Animated.Value(0)).current
  const rippleS = useRef(new Animated.Value(0.15)).current
  const rippleO = useRef(new Animated.Value(0)).current
  const indGlow = useRef(new Animated.Value(0.6)).current
  const indWiggle = useRef(new Animated.Value(0)).current
  const scorePopS = useRef(new Animated.Value(1)).current
  const headerShake = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(zPulse, {
          toValue: 1.07,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(zPulse, {
          toValue: 1.0,
          duration: 480,
          useNativeDriver: true,
        }),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 1.15,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.9,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 0.75,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.2,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(indGlow, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(indGlow, {
          toValue: 0.4,
          duration: 320,
          useNativeDriver: true,
        }),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(indWiggle, {
          toValue: 1.5,
          duration: 110,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(indWiggle, {
          toValue: -1.5,
          duration: 110,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(indWiggle, {
          toValue: 0,
          duration: 110,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const burstRings = useCallback(() => {
    cdRing1.setValue(0)
    cdRing2.setValue(0)
    cdRing3.setValue(0)
    Animated.stagger(80, [
      Animated.timing(cdRing1, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cdRing2, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cdRing3, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
    cdNum.setValue(1.7)
    Animated.spring(cdNum, {
      toValue: 1,
      friction: 4,
      tension: 90,
      useNativeDriver: true,
    }).start()
  }, [cdRing1, cdRing2, cdRing3, cdNum])

  const startInterval = useCallback(() => {
    if (intRef.current) clearInterval(intRef.current)
    intRef.current = setInterval(() => {
      if (!activeRef.current) return
      posRef.current += dirRef.current * STAGES[stageRef.current].speed
      if (posRef.current >= 100) {
        posRef.current = 100
        dirRef.current = -1
      }
      if (posRef.current <= 0) {
        posRef.current = 0
        dirRef.current = 1
      }
      setIndPos(posRef.current)
    }, TICK_MS)
  }, [])

  // ── COUNTDOWN — plays sound once at start, synced to 3s audio ──
  useEffect(() => {
    let c = 3
    burstRings()
    playCountdown() // ← plays full 3s sound once, perfectly in sync
    const t = setInterval(() => {
      c -= 1
      setCountdown(c)
      haptic(Haptics.ImpactFeedbackStyle.Heavy)
      if (c > 0) burstRings()
      if (c <= 0) {
        clearInterval(t)
        setCountdown(null)
        activeRef.current = true
        startInterval()
      }
    }, 900)
    return () => clearInterval(t)
  }, [startInterval, burstRings, haptic])

  useEffect(
    () => () => {
      clearInterval(intRef.current)
      clearTimeout(mutTimer.current)
      activeRef.current = false
    },
    []
  )

  const triggerMutation = () => {
    mutRef.current = true
    setIsMut(true)
    hapticNotif(Haptics.NotificationFeedbackType.Warning)
    playSound('mutation')
    Animated.sequence([
      Animated.timing(mutA, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(mutA, {
        toValue: 0.4,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(mutA, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start()
    mutTimer.current = setTimeout(() => {
      mutRef.current = false
      setIsMut(false)
      mutA.setValue(0)
    }, MUTATION_DURATION)
  }

  const fireRipple = () => {
    rippleS.setValue(0.15)
    rippleO.setValue(1)
    Animated.parallel([
      Animated.timing(rippleS, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rippleO, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleTap = () => {
    if (!activeRef.current) return
    haptic(Haptics.ImpactFeedbackStyle.Medium)
    playSound('tap')
    fireRipple()

    const pos = posRef.current
    const zs = zoneRef.current
    const zw = mutRef.current
      ? STAGES[stageRef.current].zoneWidth + MUTATION_BONUS
      : STAGES[stageRef.current].zoneWidth
    const inZ = pos >= zs && pos <= zs + zw
    activeRef.current = false

    if (inZ) {
      hapticNotif(Haptics.NotificationFeedbackType.Success)
      playSound('evolve')
      setFeedback('evolve')
      setScore((s) => s + 1)
      scorePopS.setValue(1.6)
      Animated.spring(scorePopS, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start()

      Animated.sequence([
        Animated.parallel([
          Animated.timing(cScale, {
            toValue: 1.8,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(cRotate, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(cScale, {
            toValue: 1.0,
            friction: 3,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.timing(cRotate, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
      ]).start()

      Animated.sequence([
        Animated.timing(flashGreen, {
          toValue: 0.4,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(flashGreen, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start()

      tapRef.current += 1
      setTapCount(tapRef.current)
      if (tapRef.current % MUTATION_EVERY === 0)
        setTimeout(() => triggerMutation(), FEEDBACK_DURATION + 50)

      const next = stageRef.current + 1

      setTimeout(async () => {
        setFeedback(null)
        if (next >= STAGES.length) {
          clearInterval(intRef.current)
          try {
            const saved = await AsyncStorage.getItem('highScore')
            if (STAGES.length > (saved ? parseInt(saved) : 0))
              await AsyncStorage.setItem('highScore', String(STAGES.length))
          } catch (_) {}
          onGameOver(STAGES.length)
          return
        }
        stageRef.current = next
        setStageIdx(next)
        posRef.current = 0
        dirRef.current = 1
        setIndPos(0)
        const z = rz(STAGES[next].zoneWidth)
        zoneRef.current = z
        setZoneStart(z)
        activeRef.current = true
        startInterval()
      }, FEEDBACK_DURATION)
    } else {
      hapticNotif(Haptics.NotificationFeedbackType.Error)
      playSound('extinct')
      setFeedback('extinct')

      Animated.sequence([
        Animated.timing(headerShake, {
          toValue: 8,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(headerShake, {
          toValue: -8,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(headerShake, {
          toValue: 5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(headerShake, {
          toValue: -5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(headerShake, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start()

      Animated.sequence([
        Animated.timing(cScale, {
          toValue: 0.3,
          duration: 65,
          useNativeDriver: true,
        }),
        Animated.timing(cScale, {
          toValue: 1.7,
          duration: 65,
          useNativeDriver: true,
        }),
        Animated.timing(cScale, {
          toValue: 0,
          duration: 320,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start()

      Animated.sequence([
        Animated.timing(flashRed, {
          toValue: 0.7,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(flashRed, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start()

      clearInterval(intRef.current)
      setTimeout(async () => {
        try {
          const saved = await AsyncStorage.getItem('highScore')
          if (stageRef.current > (saved ? parseInt(saved) : 0))
            await AsyncStorage.setItem('highScore', String(stageRef.current))
        } catch (_) {}
        onGameOver(stageRef.current)
      }, FEEDBACK_DURATION + 400)
    }
  }

  const stage = STAGES[stageIdx]
  const actZW = isMut ? stage.zoneWidth + MUTATION_BONUS : stage.zoneWidth
  const effBAR = BAR_W - sc(2)
  const indX = (indPos / 100) * effBAR
  const zoneX = (zoneStart / 100) * effBAR
  const zoneW = (actZW / 100) * effBAR
  const spin = cRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '24deg'],
  })
  const nextBoost = MUTATION_EVERY - (tapCount % MUTATION_EVERY)
  const barH = Math.max(vsc(50), 44)
  const indH = Math.max(vsc(34), 28)
  const indTop = (barH - indH) / 2
  const indColor =
    feedback === 'evolve'
      ? C.green
      : feedback === 'extinct'
        ? C.danger
        : isMut
          ? C.amber
          : C.accent

  const eraNames = [
    '',
    'PRIMORDIAL',
    'SEA LIFE',
    'LAND',
    'WARM BLOOD',
    'APEX',
    'HUMAN',
    'GOD MODE',
  ]
  const eraIdx =
    stageIdx < 3
      ? 1
      : stageIdx < 6
        ? 2
        : stageIdx < 9
          ? 3
          : stageIdx < 12
            ? 4
            : stageIdx < 14
              ? 5
              : stageIdx < 17
                ? 6
                : 7

  const ring1S = cdRing1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 2.4],
  })
  const ring2S = cdRing2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1.9],
  })
  const ring3S = cdRing3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1.5],
  })
  const ring1O = cdRing1.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.9, 0.5, 0],
  })
  const ring2O = cdRing2.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.7, 0.4, 0],
  })
  const ring3O = cdRing3.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.5, 0.3, 0],
  })

  const T = fontsLoaded
    ? {
        title: { fontFamily: 'BlackHanSans_400Regular' },
        body: { fontFamily: 'Inter_400Regular' },
        bold: { fontFamily: 'Inter_700Bold' },
        semi: { fontFamily: 'Inter_600SemiBold' },
      }
    : { title: {}, body: {}, bold: {}, semi: {} }

  // ── COUNTDOWN ──
  if (countdown !== null && countdown > 0) {
    return (
      <View style={[s.fill, { backgroundColor: stage.bg }]}>
        <SafeAreaView style={[s.fill, s.cdCenter]}>
          <Animated.View
            style={[
              s.cdRingBase,
              {
                width: sc(200),
                height: sc(200),
                borderRadius: sc(100),
                borderColor: stage.color + '60',
                transform: [{ scale: ring1S }],
                opacity: ring1O,
              },
            ]}
          />
          <Animated.View
            style={[
              s.cdRingBase,
              {
                width: sc(200),
                height: sc(200),
                borderRadius: sc(100),
                borderColor: stage.color + '80',
                transform: [{ scale: ring2S }],
                opacity: ring2O,
              },
            ]}
          />
          <Animated.View
            style={[
              s.cdRingBase,
              {
                width: sc(200),
                height: sc(200),
                borderRadius: sc(100),
                borderColor: stage.color,
                transform: [{ scale: ring3S }],
                opacity: ring3O,
              },
            ]}
          />
          <View
            style={[
              s.cdCard,
              {
                borderRadius: sc(28),
                padding: sc(36),
                borderColor: stage.color + '30',
              },
            ]}
          >
            <Text style={{ fontSize: sc(56), textAlign: 'center' }}>
              {stage.emoji}
            </Text>
            <Animated.Text
              style={[
                T.title,
                s.cdNum,
                {
                  fontSize: sc(96),
                  color: stage.color,
                  transform: [{ scale: cdNum }],
                },
              ]}
            >
              {countdown}
            </Animated.Text>
            <Text style={[T.bold, s.cdReady, { fontSize: sc(11) }]}>
              GET READY
            </Text>
            <View
              style={[
                s.cdBadge,
                {
                  borderRadius: sc(30),
                  paddingVertical: sc(6),
                  paddingHorizontal: sc(16),
                  borderColor: stage.color + '50',
                  marginTop: sc(6),
                },
              ]}
            >
              <Text
                style={[
                  T.bold,
                  { fontSize: sc(11), color: stage.color, letterSpacing: 2 },
                ]}
                numberOfLines={1}
              >
                STAGE {stageIdx + 1} · {stage.name.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text
            style={[T.body, s.cdHint, { fontSize: sc(10), marginTop: sc(22) }]}
          >
            TAP ANYWHERE WHEN READY
          </Text>
        </SafeAreaView>
      </View>
    )
  }

  // ── MAIN GAME ──
  return (
    <View style={s.fill}>
      <Pressable
        style={[s.fill, { backgroundColor: stage.bg }]}
        onPress={handleTap}
      >
        <SafeAreaView style={s.fill}>
          <Animated.View
            style={[
              s.col,
              {
                maxWidth: MAX_W,
                paddingHorizontal: PAD,
                paddingTop: vsc(8),
                paddingBottom: vsc(6),
                transform: [{ translateX: headerShake }],
              },
            ]}
          >
            {/* ── HEADER ── */}
            <View
              style={[
                s.header,
                {
                  borderRadius: sc(16),
                  paddingVertical: sc(10),
                  paddingHorizontal: sc(14),
                },
              ]}
            >
              <View style={s.statBox}>
                <Text style={[T.bold, s.statLabel, { fontSize: sc(8) }]}>
                  STAGE
                </Text>
                <Text style={[T.title, s.statVal, { fontSize: sc(22) }]}>
                  {stageIdx + 1}
                  <Text style={[T.body, s.statOf, { fontSize: sc(12) }]}>
                    /{STAGES.length}
                  </Text>
                </Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1, gap: sc(2) }}>
                <View
                  style={[
                    s.eraBadge,
                    {
                      borderRadius: sc(30),
                      paddingVertical: sc(4),
                      paddingHorizontal: sc(10),
                    },
                  ]}
                >
                  <Text
                    style={[
                      T.bold,
                      { fontSize: sc(9), color: stage.color, letterSpacing: 2 },
                    ]}
                    numberOfLines={1}
                  >
                    {eraNames[eraIdx]}
                  </Text>
                </View>
                <Text
                  style={[
                    T.semi,
                    { fontSize: sc(10), color: stage.color, letterSpacing: 1 },
                  ]}
                  numberOfLines={1}
                >
                  {stage.emoji} {stage.name.toUpperCase()}
                </Text>
              </View>
              <View style={s.statBox}>
                <Text style={[T.bold, s.statLabel, { fontSize: sc(8) }]}>
                  SCORE
                </Text>
                <Animated.Text
                  style={[
                    T.title,
                    s.statVal,
                    { fontSize: sc(22), transform: [{ scale: scorePopS }] },
                  ]}
                >
                  {score}
                </Animated.Text>
              </View>
            </View>

            {/* ── MUTATION BANNER ── */}
            {isMut && (
              <Animated.View
                style={[
                  s.mutBanner,
                  {
                    opacity: mutA,
                    borderRadius: sc(10),
                    paddingVertical: sc(7),
                    paddingHorizontal: sc(14),
                  },
                ]}
              >
                <Text
                  style={[T.bold, s.mutTxt, { fontSize: sc(11) }]}
                  numberOfLines={1}
                >
                  ⚡ MUTATION ACTIVE — ZONE WIDENED ⚡
                </Text>
              </Animated.View>
            )}

            {/* ── CREATURE CARD ── */}
            <View
              style={[
                s.creatureCard,
                { borderRadius: sc(20), flex: 1, marginVertical: sc(4) },
              ]}
            >
              <Animated.View
                style={[
                  s.ripple,
                  {
                    width: sc(180),
                    height: sc(180),
                    borderRadius: sc(90),
                    borderColor: indColor,
                    transform: [{ scale: rippleS }],
                    opacity: rippleO,
                  },
                ]}
              />
              <Animated.View
                style={[
                  s.glow,
                  {
                    width: sc(140),
                    height: sc(140),
                    borderRadius: sc(70),
                    backgroundColor: stage.color + '18',
                    transform: [{ scale: glowScale }],
                    opacity: glowOpacity,
                  },
                ]}
              />
              <Animated.Text
                style={{
                  fontSize: sc(80),
                  transform: [{ scale: cScale }, { rotate: spin }],
                  zIndex: 2,
                }}
              >
                {stage.emoji}
              </Animated.Text>

              {feedback === 'evolve' && (
                <View
                  style={[
                    s.fbBadge,
                    {
                      backgroundColor: C.greenLight,
                      borderColor: C.green,
                      borderRadius: sc(28),
                      paddingVertical: sc(6),
                      paddingHorizontal: sc(18),
                    },
                  ]}
                >
                  <Text
                    style={[
                      T.title,
                      { color: C.green, fontSize: sc(14), letterSpacing: 2 },
                    ]}
                  >
                    EVOLVED ✦
                  </Text>
                </View>
              )}
              {feedback === 'extinct' && (
                <View
                  style={[
                    s.fbBadge,
                    {
                      backgroundColor: C.dangerLight,
                      borderColor: C.danger,
                      borderRadius: sc(28),
                      paddingVertical: sc(6),
                      paddingHorizontal: sc(18),
                    },
                  ]}
                >
                  <Text
                    style={[
                      T.title,
                      { color: C.danger, fontSize: sc(14), letterSpacing: 2 },
                    ]}
                  >
                    EXTINCT ✦
                  </Text>
                </View>
              )}
              {!feedback && (
                <Text
                  style={[
                    T.semi,
                    {
                      fontSize: sc(10),
                      color: isMut ? C.amber : C.textFaint,
                      letterSpacing: 2,
                      zIndex: 2,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {isMut ? '⚡ ZONE WIDENED — TAP!' : 'TAP ANYWHERE TO EVOLVE'}
                </Text>
              )}

              <View
                style={[
                  s.sciTag,
                  {
                    borderRadius: sc(20),
                    paddingHorizontal: sc(10),
                    paddingVertical: sc(3),
                    bottom: sc(8),
                  },
                ]}
              >
                <Text
                  style={[
                    T.body,
                    {
                      fontSize: sc(9),
                      color: stage.color,
                      fontStyle: 'italic',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {stage.sciName}
                </Text>
              </View>
            </View>

            {/* ── BAR CARD ── */}
            <View
              style={[s.barCard, { borderRadius: sc(16), padding: sc(11) }]}
            >
              <View style={[s.metaRow, { gap: sc(5), marginBottom: sc(9) }]}>
                <View
                  style={[
                    s.metaPill,
                    {
                      borderRadius: sc(20),
                      paddingVertical: sc(3),
                      paddingHorizontal: sc(9),
                      borderColor: stage.color + '50',
                    },
                  ]}
                >
                  <Text
                    style={[T.bold, { fontSize: sc(9), color: stage.color }]}
                    numberOfLines={1}
                  >
                    ZONE {Math.round(actZW)}%
                  </Text>
                </View>
                <View
                  style={[
                    s.metaPill,
                    {
                      borderRadius: sc(20),
                      paddingVertical: sc(3),
                      paddingHorizontal: sc(9),
                    },
                  ]}
                >
                  <Text
                    style={[T.bold, { fontSize: sc(9), color: C.textDim }]}
                    numberOfLines={1}
                  >
                    SPD {stage.speed.toFixed(1)}×
                  </Text>
                </View>
                <View
                  style={[
                    s.metaPill,
                    {
                      borderRadius: sc(20),
                      paddingVertical: sc(3),
                      paddingHorizontal: sc(9),
                      backgroundColor: isMut ? C.amberLight : C.surfaceAlt,
                      borderColor: isMut ? C.amber + '60' : C.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      T.bold,
                      { fontSize: sc(9), color: isMut ? C.amber : C.textDim },
                    ]}
                    numberOfLines={1}
                  >
                    ⚡ {nextBoost} TO BOOST
                  </Text>
                </View>
              </View>

              <View
                style={[
                  s.bar,
                  {
                    width: BAR_W - sc(22),
                    height: barH,
                    borderColor: isMut ? C.amber + '70' : C.border,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    s.zone,
                    {
                      left: zoneX,
                      width: zoneW,
                      backgroundColor: isMut
                        ? C.amberLight
                        : stage.color + '18',
                      borderColor: isMut ? C.amber : stage.color,
                      transform: [{ scaleY: zPulse }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    s.indicator,
                    {
                      left: Math.max(
                        0,
                        Math.min(indX - sc(11), BAR_W - sc(22) - sc(22))
                      ),
                      top: indTop,
                      width: sc(22),
                      height: indH,
                      borderRadius: sc(6),
                      backgroundColor: indColor,
                      opacity: indGlow,
                      shadowColor: indColor,
                      shadowOpacity: 1,
                      shadowRadius: 12,
                      elevation: 12,
                      transform: [{ translateX: indWiggle }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    s.indicator,
                    {
                      left: Math.max(
                        0,
                        Math.min(indX - sc(11), BAR_W - sc(22) - sc(22))
                      ),
                      top: indTop + sc(4),
                      width: sc(22),
                      height: indH - sc(8),
                      borderRadius: sc(4),
                      backgroundColor: indColor,
                      transform: [{ translateX: indWiggle }],
                    },
                  ]}
                />
              </View>

              <View style={[s.edgeRow, { marginTop: sc(4) }]}>
                <Text
                  style={[
                    T.bold,
                    { fontSize: sc(8), color: C.textFaint, letterSpacing: 2 },
                  ]}
                >
                  START
                </Text>
                <Text
                  style={[
                    T.bold,
                    { fontSize: sc(8), color: C.textFaint, letterSpacing: 2 },
                  ]}
                >
                  END
                </Text>
              </View>
            </View>

            {/* ── TIMELINE STRIP ── */}
            <View
              style={[
                s.timeline,
                {
                  borderRadius: sc(12),
                  paddingVertical: sc(7),
                  paddingHorizontal: sc(10),
                  marginTop: sc(4),
                },
              ]}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: sc(4), alignItems: 'center' }}
              >
                {STAGES.map((st, i) => {
                  const isDone = i < stageIdx
                  const isCurrent = i === stageIdx
                  const isNext = i === stageIdx + 1
                  return (
                    <View key={i} style={{ alignItems: 'center', gap: sc(2) }}>
                      <View
                        style={[
                          s.timelineItem,
                          {
                            width: isCurrent ? sc(36) : sc(28),
                            height: isCurrent ? sc(36) : sc(28),
                            borderRadius: isCurrent ? sc(18) : sc(14),
                          },
                          isDone && {
                            backgroundColor: st.color + '20',
                            borderColor: st.color + '40',
                            borderWidth: 1,
                          },
                          isCurrent && {
                            backgroundColor: st.color + '25',
                            borderColor: st.color,
                            borderWidth: 2,
                          },
                          isNext && {
                            backgroundColor: C.surfaceAlt,
                            borderColor: C.border,
                            borderWidth: 1,
                          },
                          !isDone &&
                            !isCurrent &&
                            !isNext && {
                              backgroundColor: 'transparent',
                              borderColor: C.border,
                              borderWidth: 1,
                            },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: isCurrent ? sc(20) : sc(14),
                            opacity: isDone
                              ? 0.4
                              : isCurrent
                                ? 1
                                : isNext
                                  ? 0.7
                                  : 0.2,
                          }}
                        >
                          {st.emoji}
                        </Text>
                      </View>
                      {isCurrent && (
                        <View
                          style={[
                            s.timelineDot,
                            {
                              backgroundColor: st.color,
                              width: sc(4),
                              height: sc(4),
                              borderRadius: sc(2),
                            },
                          ]}
                        />
                      )}
                    </View>
                  )
                })}
              </ScrollView>
            </View>

            <Text
              style={[
                T.body,
                {
                  fontSize: sc(8),
                  color: C.textFaint,
                  letterSpacing: 2,
                  marginTop: sc(3),
                },
              ]}
              numberOfLines={1}
            >
              TAP ANYWHERE · ONE LIFE · NO RETRIES
            </Text>
          </Animated.View>
        </SafeAreaView>
      </Pressable>

      {/* Flash overlays */}
      <Animated.View
        pointerEvents="none"
        style={[s.flash, { opacity: flashGreen, backgroundColor: C.green }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[s.flash, { opacity: flashRed, backgroundColor: C.danger }]}
      />
    </View>
  )
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  col: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cdCenter: { alignItems: 'center', justifyContent: 'center' },
  cdRingBase: { position: 'absolute', borderWidth: 2 },
  cdCard: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 12,
  },
  cdNum: { lineHeight: undefined },
  cdReady: { color: '#A09488', letterSpacing: 5 },
  cdBadge: { backgroundColor: '#F8F6F2', borderWidth: 1 },
  cdHint: { color: '#CEC8C0', letterSpacing: 3 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE5DC',
    shadowColor: '#6B5A40',
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
  },
  statBox: { alignItems: 'center', width: 52 },
  statLabel: { color: '#CEC8C0', letterSpacing: 3 },
  statVal: { color: '#18130E' },
  statOf: { color: '#A09488' },
  eraBadge: {
    backgroundColor: '#F8F6F2',
    borderWidth: 1,
    borderColor: '#EAE5DC',
  },

  mutBanner: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FEF6E4',
    borderWidth: 1.5,
    borderColor: '#C97A0870',
  },
  mutTxt: { color: '#C97A08', letterSpacing: 1 },

  creatureCard: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE5DC',
    shadowColor: '#6B5A40',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
    gap: 5,
  },
  ripple: { position: 'absolute', borderWidth: 2 },
  glow: { position: 'absolute' },
  fbBadge: { borderWidth: 1.5, zIndex: 3 },
  sciTag: {
    position: 'absolute',
    backgroundColor: '#F8F6F2',
    borderWidth: 1,
    borderColor: '#EAE5DC',
  },

  barCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE5DC',
    shadowColor: '#6B5A40',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  metaRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  metaPill: {
    backgroundColor: '#F8F6F2',
    borderWidth: 1,
    borderColor: '#EAE5DC',
  },
  bar: {
    backgroundColor: '#F8F6F2',
    borderRadius: 10,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
  },
  zone: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderWidth: 2,
    borderRadius: 6,
  },
  indicator: { position: 'absolute' },
  edgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  timeline: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE5DC',
  },
  timelineItem: { alignItems: 'center', justifyContent: 'center' },
  timelineDot: {},

  flash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
})
