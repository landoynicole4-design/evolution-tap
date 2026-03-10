// screens/LoadingScreen.jsx
import {
  BlackHanSans_400Regular,
  useFonts,
} from '@expo-google-fonts/black-han-sans'
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter'
import { useEffect, useRef } from 'react'
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { playSound } from '../utils/soundManager'

const C = {
  bg: '#F8F6F2',
  surface: '#FFFFFF',
  border: '#EAE5DC',
  accent: '#E8420A',
  accentDim: '#E8420A14',
  text: '#18130E',
  textDim: '#A09488',
  textFaint: '#CEC8C0',
  shadow: '#6B5A40',
}

const EVOLUTION_EMOJIS = ['🦠', '🪼', '🐟', '🐸', '🦎', '🐺', '🧬', '🤖', '👽']

export default function LoadingScreen({ onDone }) {
  const [fontsLoaded] = useFonts({
    BlackHanSans_400Regular,
    Inter_400Regular,
    Inter_700Bold,
  })

  // Master fade for entire screen exit
  const screenOpacity = useRef(new Animated.Value(1)).current

  // Hero egg animations
  const eggScale = useRef(new Animated.Value(0.6)).current
  const eggOpacity = useRef(new Animated.Value(0)).current
  const eggFloat = useRef(new Animated.Value(0)).current

  // Title animations
  const titleOpacity = useRef(new Animated.Value(0)).current
  const titleY = useRef(new Animated.Value(16)).current

  // Subtitle
  const subOpacity = useRef(new Animated.Value(0)).current

  // Progress bar
  const barProgress = useRef(new Animated.Value(0)).current
  const barOpacity = useRef(new Animated.Value(0)).current

  // Orbs
  const orb1S = useRef(new Animated.Value(0.8)).current
  const orb2S = useRef(new Animated.Value(1.2)).current

  // Emoji chain — declared individually to respect Rules of Hooks
  const e0 = useRef(new Animated.Value(0)).current
  const e1 = useRef(new Animated.Value(0)).current
  const e2 = useRef(new Animated.Value(0)).current
  const e3 = useRef(new Animated.Value(0)).current
  const e4 = useRef(new Animated.Value(0)).current
  const e5 = useRef(new Animated.Value(0)).current
  const e6 = useRef(new Animated.Value(0)).current
  const e7 = useRef(new Animated.Value(0)).current
  const e8 = useRef(new Animated.Value(0)).current
  const emojiAnims = [e0, e1, e2, e3, e4, e5, e6, e7, e8]

  useEffect(() => {
    if (!fontsLoaded) return

    // ← Play entrance sound with delay to ensure sounds are ready
    setTimeout(() => playSound('entrance'), 1500)

    // Orb pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1S, {
          toValue: 1.4,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(orb1S, {
          toValue: 0.7,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2S, {
          toValue: 0.7,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(orb2S, {
          toValue: 1.3,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Float loop for egg
    Animated.loop(
      Animated.sequence([
        Animated.timing(eggFloat, {
          toValue: -8,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(eggFloat, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Main entrance sequence
    Animated.sequence([
      // 1. Egg pops in
      Animated.parallel([
        Animated.timing(eggOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(eggScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      // 2. Title slides up
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(titleY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // 3. Subtitle fades
      Animated.timing(subOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      // 4. Bar fades in then fills
      Animated.timing(barOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(barProgress, {
        toValue: 100,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      // 5. Emoji chain
      Animated.stagger(
        90,
        emojiAnims.map((a) =>
          Animated.timing(a, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        )
      ),
      // 6. Brief pause
      Animated.delay(300),
      // 7. Fade entire screen out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onDone())
  }, [fontsLoaded])

  const T = fontsLoaded
    ? {
        title: { fontFamily: 'BlackHanSans_400Regular' },
        body: { fontFamily: 'Inter_400Regular' },
        bold: { fontFamily: 'Inter_700Bold' },
      }
    : { title: {}, body: {}, bold: {} }

  return (
    <Animated.View style={[s.root, { opacity: screenOpacity }]}>
      <SafeAreaView style={s.safe}>
        {/* Ambient orbs */}
        <Animated.View style={[s.orb1, { transform: [{ scale: orb1S }] }]} />
        <Animated.View style={[s.orb2, { transform: [{ scale: orb2S }] }]} />

        <View style={s.center}>
          {/* Egg hero */}
          <Animated.Text
            style={{
              fontSize: 80,
              transform: [{ scale: eggScale }, { translateY: eggFloat }],
              opacity: eggOpacity,
            }}
          >
            🥚
          </Animated.Text>

          {/* Title */}
          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleY }],
              alignItems: 'center',
              marginTop: 12,
            }}
          >
            <Text style={[T.title, s.title]}>EVOLUTION TAP</Text>
            <Animated.Text style={[T.body, s.sub, { opacity: subOpacity }]}>
              evolve or go extinct
            </Animated.Text>
          </Animated.View>

          {/* Progress bar */}
          <Animated.View style={[s.barWrap, { opacity: barOpacity }]}>
            <View style={s.barTrack}>
              <Animated.View
                style={[
                  s.barFill,
                  {
                    width: barProgress.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={[T.bold, s.loadingTxt]}>LOADING</Text>
          </Animated.View>

          {/* Evolution emoji chain */}
          <View style={s.chainRow}>
            {EVOLUTION_EMOJIS.map((emoji, i) => (
              <Animated.Text
                key={i}
                style={{ fontSize: 18, opacity: emojiAnims[i] }}
              >
                {emoji}
              </Animated.Text>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Animated.Text style={[T.bold, s.footer, { opacity: subOpacity }]}>
          ONE TAP · ONE LIFE · NO SECOND CHANCES
        </Animated.Text>
      </SafeAreaView>
    </Animated.View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  orb1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: C.accentDim,
  },
  orb2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1565C014',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 0 },
  title: { fontSize: 36, color: C.text, letterSpacing: 3 },
  sub: { fontSize: 13, color: C.textDim, letterSpacing: 5, marginTop: 4 },
  barWrap: { alignItems: 'center', gap: 8, marginTop: 32, width: 220 },
  barTrack: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    backgroundColor: C.border,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: C.accent, borderRadius: 3 },
  loadingTxt: { fontSize: 9, color: C.textFaint, letterSpacing: 4 },
  chainRow: { flexDirection: 'row', gap: 6, marginTop: 24 },
  footer: { fontSize: 9, color: C.textFaint, letterSpacing: 3 },
})
