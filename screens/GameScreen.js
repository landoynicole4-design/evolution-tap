import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
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

const BAR_WIDTH = Dimensions.get('window').width - 56
const rz = (w) => Math.random() * (100 - w)

export default function GameScreen({ onGameOver }) {
  const [stageIndex, setStageIndex] = useState(0)
  const [indPos, setIndPos] = useState(0)
  const [zoneStart, setZoneStart] = useState(() => rz(STAGES[0].zoneWidth))
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [isMutation, setIsMutation] = useState(false)
  const [tapCount, setTapCount] = useState(0)

  const posRef = useRef(0),
    dirRef = useRef(1),
    stageRef = useRef(0)
  const zoneRef = useRef(zoneStart),
    activeRef = useRef(false)
  const intervalRef = useRef(null),
    tapCountRef = useRef(0)
  const mutationRef = useRef(false),
    mutationTimer = useRef(null)

  const cScale = useRef(new Animated.Value(1)).current
  const cRotate = useRef(new Animated.Value(0)).current
  const zonePulse = useRef(new Animated.Value(1)).current
  const flashAnim = useRef(new Animated.Value(0)).current
  const mutAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(zonePulse, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(zonePulse, {
          toValue: 1.0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [zonePulse])

  useEffect(() => {
    let c = 3
    const t = setInterval(() => {
      c -= 1
      setCountdown(c)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
      if (c <= 0) {
        clearInterval(t)
        setCountdown(null)
        activeRef.current = true
        startInterval()
      }
    }, 800)
    return () => clearInterval(t)
  }, [startInterval])

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (!activeRef.current) return
      const spd = STAGES[stageRef.current].speed
      posRef.current += dirRef.current * spd
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

  useEffect(
    () => () => {
      clearInterval(intervalRef.current)
      clearTimeout(mutationTimer.current)
      activeRef.current = false
    },
    []
  )

  const triggerMutation = () => {
    mutationRef.current = true
    setIsMutation(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => {}
    )
    Animated.loop(
      Animated.sequence([
        Animated.timing(mutAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mutAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 3 }
    ).start()
    mutationTimer.current = setTimeout(() => {
      mutationRef.current = false
      setIsMutation(false)
    }, MUTATION_DURATION)
  }

  const handleTap = () => {
    if (!activeRef.current) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    const pos = posRef.current,
      zs = zoneRef.current
    const zw = mutationRef.current
      ? STAGES[stageRef.current].zoneWidth + MUTATION_BONUS
      : STAGES[stageRef.current].zoneWidth
    const inZone = pos >= zs && pos <= zs + zw
    activeRef.current = false

    if (inZone) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      )
      setFeedback('evolve')
      setScore((s) => s + 1)
      Animated.sequence([
        Animated.parallel([
          Animated.timing(cScale, {
            toValue: 1.5,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(cRotate, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(cScale, {
            toValue: 1.0,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.timing(cRotate, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start()
      tapCountRef.current += 1
      setTapCount(tapCountRef.current)
      if (tapCountRef.current % MUTATION_EVERY === 0)
        setTimeout(() => triggerMutation(), FEEDBACK_DURATION + 100)
      const next = stageRef.current + 1
      setTimeout(() => {
        setFeedback(null)
        if (next >= STAGES.length) {
          clearInterval(intervalRef.current)
          onGameOver(STAGES.length)
          return
        }
        stageRef.current = next
        setStageIndex(next)
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      )
      setFeedback('extinct')
      Animated.sequence([
        Animated.timing(cScale, {
          toValue: 0.6,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(cScale, {
          toValue: 1.3,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(cScale, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start()
      clearInterval(intervalRef.current)
      setTimeout(() => onGameOver(stageRef.current), FEEDBACK_DURATION + 400)
    }
  }

  const stage = STAGES[stageIndex]
  const activeZW = isMutation
    ? stage.zoneWidth + MUTATION_BONUS
    : stage.zoneWidth
  const indX = (indPos / 100) * BAR_WIDTH
  const zoneX = (zoneStart / 100) * BAR_WIDTH
  const zoneW = (activeZW / 100) * BAR_WIDTH
  const indColor =
    feedback === 'evolve'
      ? '#4ade80'
      : feedback === 'extinct'
        ? '#f87171'
        : isMutation
          ? '#fbbf24'
          : '#fff'
  const spin = cRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg'],
  })

  if (countdown !== null && countdown > 0) {
    return (
      <View style={[s.cdown, { backgroundColor: stage.bg }]}>
        <Text style={{ fontSize: 80 }}>{stage.emoji}</Text>
        <Text style={s.cdNum}>{countdown}</Text>
        <Text style={s.cdLabel}>GET READY</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={[s.container, { backgroundColor: stage.bg }]}
        onPress={handleTap}
      >
        <SafeAreaView style={s.safe}>
          <View style={s.header}>
            <View style={s.pill}>
              <Text style={s.pillLabel}>STAGE</Text>
              <Text style={s.pillVal}>
                {stageIndex + 1}
                <Text style={s.pillMax}>/{STAGES.length}</Text>
              </Text>
            </View>
            <View style={s.pill}>
              <Text style={s.pillLabel}>SCORE</Text>
              <Text style={s.pillVal}>{score}</Text>
            </View>
          </View>

          {isMutation && (
            <Animated.View
              style={[
                s.mutBanner,
                {
                  opacity: mutAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ]}
            >
              <Text style={s.mutText}>🧬 MUTATION BOOST 🧬</Text>
            </Animated.View>
          )}

          <View style={s.creature}>
            <Animated.Text
              style={[
                { fontSize: 84 },
                { transform: [{ scale: cScale }, { rotate: spin }] },
              ]}
            >
              {stage.emoji}
            </Animated.Text>
            <Text style={[s.stageName, { color: stage.color }]}>
              {stage.name}
            </Text>
            {feedback === 'evolve' && (
              <Text style={s.fbEvolve}>✨ EVOLVED!</Text>
            )}
            {feedback === 'extinct' && (
              <Text style={s.fbExtinct}>💀 EXTINCT!</Text>
            )}
            {!feedback && (
              <Text style={s.tapHint}>
                {isMutation ? '⚡ BOOSTED — TAP NOW!' : 'TAP TO EVOLVE'}
              </Text>
            )}
          </View>

          <View style={s.barSection}>
            <View style={s.barMeta}>
              <Text style={[s.metaTxt, { color: stage.color }]}>
                Zone {Math.round(activeZW)}%
              </Text>
              <Text style={s.metaTxt}>Speed {stage.speed.toFixed(1)}x</Text>
              <Text style={[s.metaTxt, { color: '#fbbf24' }]}>
                Boost in: {MUTATION_EVERY - (tapCount % MUTATION_EVERY)} tap
                {MUTATION_EVERY - (tapCount % MUTATION_EVERY) !== 1 ? 's' : ''}
              </Text>
            </View>
            <View
              style={[
                s.bar,
                {
                  width: BAR_WIDTH,
                  borderColor: isMutation ? '#fbbf24' : '#1a1a35',
                },
              ]}
            >
              <Animated.View
                style={[
                  s.zone,
                  {
                    left: zoneX,
                    width: zoneW,
                    backgroundColor: isMutation
                      ? '#fbbf2430'
                      : stage.color + '25',
                    borderColor: isMutation ? '#fbbf24' : stage.color,
                    transform: [{ scaleY: zonePulse }],
                  },
                ]}
              />
              <View
                style={[
                  s.indicator,
                  {
                    left: indX - 10,
                    backgroundColor: indColor,
                    shadowColor: indColor,
                  },
                ]}
              />
            </View>
          </View>

          <View style={s.progress}>
            {STAGES.map((st, i) => (
              <Text
                key={i}
                style={[
                  { fontSize: 20 },
                  i < stageIndex && { opacity: 0.25 },
                  i === stageIndex && { fontSize: 32 },
                  i > stageIndex && { opacity: 0.1 },
                ]}
              >
                {st.emoji}
              </Text>
            ))}
          </View>
          <Text style={s.bottomHint}>tap anywhere • one life</Text>
        </SafeAreaView>
      </Pressable>
      <Animated.View
        pointerEvents="none"
        style={[s.flash, { opacity: flashAnim }]}
      />
    </View>
  )
}

const s = StyleSheet.create({
  cdown: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  cdNum: { fontSize: 96, fontWeight: '900', color: '#fff' },
  cdLabel: { fontSize: 14, color: '#555', letterSpacing: 4 },
  container: { flex: 1 },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f87171',
  },
  header: { flexDirection: 'row', gap: 14 },
  pill: {
    backgroundColor: '#ffffff0d',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  pillLabel: { color: '#444', fontSize: 10, letterSpacing: 2 },
  pillVal: { color: '#fff', fontSize: 22, fontWeight: '800' },
  pillMax: { fontSize: 13, color: '#333', fontWeight: '400' },
  mutBanner: {
    backgroundColor: '#fbbf2415',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  mutText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  creature: {
    alignItems: 'center',
    height: 150,
    justifyContent: 'center',
    gap: 8,
  },
  stageName: { fontSize: 17, fontWeight: '700', letterSpacing: 1 },
  fbEvolve: {
    color: '#4ade80',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  fbExtinct: {
    color: '#f87171',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tapHint: { color: '#ffffff15', fontSize: 12, letterSpacing: 4 },
  barSection: { alignItems: 'center', gap: 12, width: '100%' },
  barMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  metaTxt: { color: '#333', fontSize: 11, fontWeight: '600' },
  bar: {
    height: 48,
    backgroundColor: '#0d0d20',
    borderRadius: 24,
    borderWidth: 1,
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
  indicator: {
    position: 'absolute',
    top: 6,
    width: 20,
    height: 36,
    borderRadius: 10,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  progress: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  bottomHint: { color: '#1a1a35', fontSize: 11, letterSpacing: 3 },
})
