// Synthesizes a calming, ethereal ambient drone & gentle water/chime breeze using Web Audio API

class ZenAudioEngine {
  constructor() {
    this.ctx = null
    this.isPlaying = false
    this.nodes = []
    this.intervalId = null
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
  }

  start() {
    this.init()
    if (!this.ctx) return
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    if (this.isPlaying) return

    this.isPlaying = true

    // Warm ambient pad chord (Pentatonic: D, F#, A, B, E)
    const baseFreqs = [146.83, 220.0, 293.66, 370.0, 440.0]
    
    // Master gain
    const masterGain = this.ctx.createGain()
    masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime)
    masterGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 3)
    masterGain.connect(this.ctx.destination)
    this.nodes.push(masterGain)

    // Ethereal low drone
    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime)

      // Slight vibrato / detune
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, this.ctx.currentTime)

      gain.gain.setValueAtTime(0.04 / (idx + 1), this.ctx.currentTime)

      if (panner) {
        panner.pan.setValueAtTime((idx / baseFreqs.length) * 1.6 - 0.8, this.ctx.currentTime)
        osc.connect(gain)
        gain.connect(panner)
        panner.connect(masterGain)
      } else {
        osc.connect(gain)
        gain.connect(masterGain)
      }

      osc.start()
      this.nodes.push(osc, gain)
    })

    // Random gentle chime notes
    const chimePitches = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66]
    this.intervalId = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return
      const pitch = chimePitches[Math.floor(Math.random() * chimePitches.length)]
      const chimeOsc = this.ctx.createOscillator()
      const chimeGain = this.ctx.createGain()

      chimeOsc.type = 'sine'
      chimeOsc.frequency.setValueAtTime(pitch, this.ctx.currentTime)

      chimeGain.gain.setValueAtTime(0.001, this.ctx.currentTime)
      chimeGain.gain.exponentialRampToValueAtTime(0.03, this.ctx.currentTime + 0.1)
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5)

      chimeOsc.connect(chimeGain)
      chimeGain.connect(masterGain)

      chimeOsc.start(this.ctx.currentTime)
      chimeOsc.stop(this.ctx.currentTime + 2.6)
    }, 3800)
  }

  stop() {
    if (!this.isPlaying) return
    this.isPlaying = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (this.ctx) {
      this.nodes.forEach(node => {
        try {
          if (node.stop) node.stop()
          node.disconnect()
        } catch (_) {}
      })
      this.nodes = []
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop()
      return false
    } else {
      this.start()
      return true
    }
  }
}

export const zenAudio = new ZenAudioEngine()
