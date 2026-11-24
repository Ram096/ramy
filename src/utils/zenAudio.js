// Full-Length Music Player Engine for Ramy's Cockpit Website
// Plays full songs from public/dumbai.m4a and public/bienvenidos.m4a

export const PLAYLIST_TRACKS = [
  {
    id: 'dumbai',
    title: 'DUMBAI',
    artist: 'CA7RIEL & Paco Amoroso',
    display: 'DUMBAI — CA7RIEL & Paco Amoroso',
    src: 'dumbai.m4a',
  },
  {
    id: 'bienvenidos',
    title: 'Bienvenidos a la Tierra',
    artist: 'Rawayana',
    display: 'Bienvenidos a la Tierra — Rawayana',
    src: 'bienvenidos.m4a',
  },
]

class MusicPlayerEngine {
  constructor() {
    this.isPlaying = false
    this.currentIndex = 0
    this.audio = null
    this.listeners = new Set()
  }

  subscribe(fn) {
    this.listeners.add(fn)
    // Immediately emit current state to the new subscriber
    try {
      fn({
        isPlaying: this.isPlaying,
        currentIndex: this.currentIndex,
        currentTrack: PLAYLIST_TRACKS[this.currentIndex],
      })
    } catch (_) {}
    return () => this.listeners.delete(fn)
  }

  notify() {
    const state = {
      isPlaying: this.isPlaying,
      currentIndex: this.currentIndex,
      currentTrack: PLAYLIST_TRACKS[this.currentIndex],
    }
    this.listeners.forEach((fn) => {
      try {
        fn(state)
      } catch (_) {}
    })
  }

  getCurrentTrack() {
    return PLAYLIST_TRACKS[this.currentIndex]
  }

  resolveStreams() {
    // Local full-length audio files are bundled directly in public/
  }

  ensureAudio() {
    if (!this.audio && typeof window !== 'undefined') {
      this.audio = new Audio()
      this.audio.preload = 'auto'
      this.audio.volume = 0.8
      this.audio.addEventListener('play', () => {
        this.isPlaying = true
        this.notify()
      })
      this.audio.addEventListener('playing', () => {
        this.isPlaying = true
        this.notify()
      })
      this.audio.addEventListener('pause', () => {
        // Only mark paused if it wasn't just ended/advancing tracks
        if (!this.audio.ended) {
          this.isPlaying = false
          this.notify()
        }
      })
      this.audio.addEventListener('ended', () => {
        this.nextTrack(true)
      })
    }
    return this.audio
  }

  async playCurrent() {
    const audio = this.ensureAudio()
    if (!audio) return

    this.isPlaying = true
    this.notify()

    const track = PLAYLIST_TRACKS[this.currentIndex]
    if (!audio.src || !audio.src.endsWith(track.src)) {
      audio.src = track.src
    }

    try {
      await audio.play()
      this.isPlaying = !audio.paused
      this.notify()
    } catch (err) {
      // Ignore AbortError when interrupted by rapid toggle/remount; check actual audio.paused state
      if (err && err.name === 'AbortError') return
      this.isPlaying = !audio.paused
      this.notify()
    }
  }

  start() {
    const audio = this.ensureAudio()
    if (this.isPlaying && audio && !audio.paused) {
      this.notify()
      return
    }
    this.playCurrent()
  }

  stop() {
    this.isPlaying = false
    if (this.audio) {
      try {
        this.audio.pause()
      } catch (_) {}
    }
    this.notify()
  }

  toggle() {
    const audio = this.ensureAudio()
    const actuallyPlaying = this.isPlaying && audio && !audio.paused
    if (actuallyPlaying) {
      this.stop()
      return false
    } else {
      this.start()
      return true
    }
  }

  nextTrack(autoKeepPlaying = false) {
    const shouldPlay = this.isPlaying || autoKeepPlaying
    this.currentIndex = (this.currentIndex + 1) % PLAYLIST_TRACKS.length
    if (this.audio) {
      const track = PLAYLIST_TRACKS[this.currentIndex]
      this.audio.src = track.src
      this.audio.currentTime = 0
    }
    if (shouldPlay) {
      this.playCurrent()
    } else {
      this.notify()
    }
  }

  prevTrack() {
    const shouldPlay = this.isPlaying
    this.currentIndex =
      (this.currentIndex - 1 + PLAYLIST_TRACKS.length) % PLAYLIST_TRACKS.length
    if (this.audio) {
      const track = PLAYLIST_TRACKS[this.currentIndex]
      this.audio.src = track.src
      this.audio.currentTime = 0
    }
    if (shouldPlay) {
      this.playCurrent()
    } else {
      this.notify()
    }
  }
}

export const zenAudio = new MusicPlayerEngine()
