let ctx = null
let master = null
let nodes = []
let chimeTimer = null

const stopNode = (n) => { try { n.stop?.() } catch {} try { n.disconnect?.() } catch {} }

export function stopAmbient() {
  if (chimeTimer) window.clearInterval(chimeTimer)
  chimeTimer = null
  nodes.forEach(stopNode)
  nodes = []
  if (master) {
    try { master.disconnect() } catch {}
    master = null
  }
}

export async function startAmbient() {
  if (nodes.length) return
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return
  ctx = ctx || new AudioContext()
  if (ctx.state === 'suspended') await ctx.resume()

  master = ctx.createGain()
  master.gain.value = 0.045
  master.connect(ctx.destination)

  const createDrone = (frequency, type, detune = 0) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    osc.type = type
    osc.frequency.value = frequency
    osc.detune.value = detune
    filter.type = 'lowpass'
    filter.frequency.value = 520
    gain.gain.value = 0.34
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    osc.start()
    nodes.push(osc, gain, filter)
  }

  createDrone(110, 'sine', -8)
  createDrone(164.81, 'sine', 5)
  createDrone(220, 'triangle', -3)

  const shimmer = () => {
    if (!ctx || !master) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const frequencies = [523.25, 659.25, 783.99, 880, 987.77]
    osc.frequency.value = frequencies[Math.floor(Math.random() * frequencies.length)]
    osc.type = 'sine'
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.8)
    osc.connect(gain)
    gain.connect(master)
    osc.start()
    osc.stop(ctx.currentTime + 3)
  }

  chimeTimer = window.setInterval(shimmer, 6500)
  shimmer()
}
