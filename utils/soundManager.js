import { Audio } from 'expo-av'

const SOUND_SOURCES = {
  entrance: require('../assets/images/sounds/entrance.mp3'),
  evolve: require('../assets/images/sounds/evolve.mp3'),
  extinct: require('../assets/images/sounds/extinct.mp3'),
  mutation: require('../assets/images/sounds/mutation.mp3'),
  tap: require('../assets/images/sounds/click.mp3'),
  countdown: require('../assets/images/sounds/countdown.mp3'),
  win: require('../assets/images/sounds/win.mp3'),
}

const _cache = {}
let _ready = false
let _initLock = false
let _enabled = true

async function configureSession() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    })
  } catch (e) {
    console.warn('[Sound] session config failed:', e && e.message)
  }
}

export async function initSounds() {
  if (_ready || _initLock) return
  _initLock = true
  await configureSession()

  const names = Object.keys(SOUND_SOURCES)
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const source = SOUND_SOURCES[name]
    if (!source) {
      _cache[name] = null
      continue
    }
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        volume: 1.0,
        isLooping: name === 'entrance',
      })
      _cache[name] = sound
    } catch (e) {
      console.warn('[Sound] failed to load ' + name + ':', e && e.message)
      _cache[name] = null
    }
  }

  console.log(
    '[Sound] loaded:',
    Object.keys(_cache).filter((k) => _cache[k] !== null)
  )
  _ready = true
  _initLock = false
}

export async function playSound(name) {
  if (!_enabled || !_ready) return
  const sound = _cache[name]
  if (!sound) return
  try {
    await sound.setPositionAsync(0)
    await sound.playAsync()
  } catch (e) {
    console.warn('[Sound] playSound ' + name + ':', e && e.message)
  }
}

// ← plays countdown once cleanly, stop+restart if called again
export async function playCountdown() {
  if (!_enabled || !_ready) return
  const sound = _cache['countdown']
  if (!sound) return
  try {
    await sound.stopAsync()
    await sound.setPositionAsync(0)
    await sound.playAsync()
  } catch (e) {}
}

export async function stopSound(name) {
  const sound = _cache[name]
  if (!sound) return
  try {
    await sound.stopAsync()
  } catch (e) {}
}

export function setSoundEnabled(val) {
  _enabled = Boolean(val)
}

export function isSoundEnabled() {
  return _enabled
}

export async function unloadSounds() {
  _ready = false
  _initLock = false
  const keys = Object.keys(_cache)
  for (let i = 0; i < keys.length; i++) {
    const sound = _cache[keys[i]]
    if (sound) {
      try {
        await sound.stopAsync()
      } catch (_) {}
      try {
        await sound.unloadAsync()
      } catch (_) {}
    }
    delete _cache[keys[i]]
  }
}
