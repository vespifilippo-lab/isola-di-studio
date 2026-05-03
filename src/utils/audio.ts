/**
 * useAudio — Web Audio API sound effects
 *
 * No external assets needed; all sounds are synthesised with the Web Audio API.
 * The AudioContext is created lazily on first call to avoid the browser's
 * autoplay policy restriction.
 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ramp(
  param:     AudioParam,
  startVal:  number,
  endVal:    number,
  startTime: number,
  endTime:   number,
) {
  param.setValueAtTime(startVal, startTime)
  param.linearRampToValueAtTime(endVal, endTime)
}

// ─── Sound definitions ────────────────────────────────────────────────────────

/** Three descending tones — signals timer completion */
export function playTimerDone() {
  const c   = getCtx()
  const now = c.currentTime

  const notes = [
    { freq: 880, start: 0,    dur: 0.15 },
    { freq: 660, start: 0.18, dur: 0.15 },
    { freq: 440, start: 0.36, dur: 0.30 },
  ]

  notes.forEach(({ freq, start, dur }) => {
    const osc  = c.createOscillator()
    const gain = c.createGain()

    osc.type      = 'sine'
    osc.frequency.setValueAtTime(freq, now + start)

    ramp(gain.gain, 0.0,  0.35, now + start,             now + start + 0.01)
    ramp(gain.gain, 0.35, 0.0,  now + start + dur - 0.02, now + start + dur)

    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(now + start)
    osc.stop(now  + start + dur + 0.05)
  })
}


/** Soft tick — every second while timer is running (optional) */
export function playTick() {
  const c   = getCtx()
  const now = c.currentTime

  const buf    = c.createBuffer(1, c.sampleRate * 0.03, c.sampleRate)
  const data   = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 5)
  }
  const src  = c.createBufferSource()
  const gain = c.createGain()
  src.buffer = buf
  gain.gain.setValueAtTime(0.06, now)
  src.connect(gain)
  gain.connect(c.destination)
  src.start(now)
}

