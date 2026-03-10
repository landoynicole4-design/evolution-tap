import AsyncStorage from '@react-native-async-storage/async-storage'
import { registerRootComponent } from 'expo'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import GameOverScreen from './screens/GameOverScreen'
import GameScreen from './screens/GameScreen'
import LoadingScreen from './screens/LoadingScreen'
import StartScreen from './screens/StartScreen'
import {
  initSounds,
  playSound,
  setSoundEnabled,
  stopSound,
  unloadSounds,
} from './utils/soundManager'

function App() {
  const [screen, setScreen] = useState('loading')
  const [finalScore, setFinalScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [soundEnabled, setSoundState] = useState(true)
  const [hapticsEnabled, setHapticsState] = useState(true)
  const appStateRef = useRef(AppState.currentState)

  useEffect(() => {
    const boot = async () => {
      try {
        const results = await Promise.all([
          AsyncStorage.getItem('evo_highScore'),
          AsyncStorage.getItem('evo_sound'),
          AsyncStorage.getItem('evo_haptics'),
        ])
        if (results[0]) setHighScore(parseInt(results[0], 10))
        if (results[1] !== null) {
          const v = results[1] === 'true'
          setSoundState(v)
          setSoundEnabled(v)
        }
        if (results[2] !== null) setHapticsState(results[2] === 'true')
      } catch (_) {}
      await initSounds()
    }

    boot()

    const sub = AppState.addEventListener('change', function (next) {
      const prev = appStateRef.current
      if ((prev === 'inactive' || prev === 'background') && next === 'active') {
        initSounds()
      } else if (next === 'inactive' || next === 'background') {
        stopSound('entrance')
        unloadSounds()
      }
      appStateRef.current = next
    })

    return function cleanup() {
      sub.remove()
      unloadSounds()
    }
  }, [])

  const handleGameOver = async (score) => {
    setFinalScore(score)
    const newRecord = score > highScore
    setIsNewRecord(newRecord)
    if (newRecord) {
      setHighScore(score)
      await AsyncStorage.setItem('evo_highScore', String(score)).catch(() => {})
    }
    setScreen('gameover')
  }

  const handleStart = () => {
    stopSound('entrance') // ← stops when game begins
    setScreen('game')
  }

  const handleHome = () => {
    setIsNewRecord(false)
    setScreen('start')
    setTimeout(() => playSound('entrance'), 300) // ← restarts Crazy Frog 😂
  }

  return (
    <>
      <StatusBar style="dark" />

      {screen === 'loading' && (
        <LoadingScreen onDone={() => setScreen('start')} />
      )}

      {screen === 'start' && (
        <StartScreen onStart={handleStart} highScore={highScore} />
      )}

      {screen === 'game' && (
        <GameScreen
          key={Date.now()}
          onGameOver={handleGameOver}
          soundEnabled={soundEnabled}
          hapticsEnabled={hapticsEnabled}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          score={finalScore}
          highScore={highScore}
          isNewRecord={isNewRecord}
          soundEnabled={soundEnabled}
          hapticsEnabled={hapticsEnabled}
          onRestart={() => {
            setIsNewRecord(false)
            setScreen('game')
          }}
          onHome={handleHome}
        />
      )}
    </>
  )
}

registerRootComponent(App)
