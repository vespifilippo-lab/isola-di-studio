import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, Coffee, Zap, Clock, ChevronDown } from 'lucide-react'
import { useStore, getTimerDurations, type TimerMode } from '../store/useStore'
import { playTimerDone, playTick } from '../utils/audio'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ─── Mode tab config ──────────────────────────────────────────────────────────

interface ModeConfig {
  id:       TimerMode
  label:    string
  icon:     React.ElementType
  hexColor: string
}

const MODES: ModeConfig[] = [
  { id: 'focus',       label: 'Focus',       icon: Zap,    hexColor: '#4ade80' },
  { id: 'short_break', label: 'Short Break', icon: Coffee, hexColor: '#38bdf8' },
  { id: 'long_break',  label: 'Long Break',  icon: Clock,  hexColor: '#a78bfa' },
]

// ─── SVG Ring ─────────────────────────────────────────────────────────────────

interface ProgressRingProps {
  progress: number   // 0–1
  color:    string
  size?:    number
  stroke?:  number
}

function ProgressRing({ progress, color, size = 280, stroke = 7 }: ProgressRingProps) {
  const radius        = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset        = circumference * (1 - progress)

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={stroke}
      />
      {/* Glow duplicate (blurred) */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke + 4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        opacity={0.18}
        style={{ filter: 'blur(4px)', transition: 'stroke-dashoffset 1s linear' }}
      />
      {/* Main arc */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
      />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FocusTimer() {
  const {
    timeLeft,
    isRunning,
    mode,
    sessionHistory,
    courses,
    activeCourseId,
    setActiveCourse,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    tickTimer,
    setMode,
  } = useStore()

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false)

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevTimeLeft = useRef(timeLeft)
  const sessionDone  = timeLeft === 0

  // Tick every second + audio
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tickTimer()
        playTick()
      }, 1000)
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, tickTimer])

  // Play completion chime when session finishes
  useEffect(() => {
    if (prevTimeLeft.current > 0 && timeLeft === 0) {
      playTimerDone()
    }
    prevTimeLeft.current = timeLeft
  }, [timeLeft])

  const durations   = getTimerDurations(settings)
  const total       = durations[mode]
  const progress    = total > 0 ? (total - timeLeft) / total : 1
  const modeConf    = MODES.find((m) => m.id === mode)!
  const ringColor   = sessionDone ? '#fbbf24' : modeConf.hexColor

  return (
    <div className="max-w-lg mx-auto space-y-8">

      {/* Mode selector */}
      <div className="glass rounded-2xl p-1.5 flex gap-1">
        {MODES.map((m) => {
          const Icon   = m.icon
          const active = mode === m.id
          return (
            <button
              key={m.id}
              id={`timer-mode-${m.id}`}
              onClick={() => setMode(m.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200"
              style={{
                background:   active ? `${m.hexColor}18` : 'transparent',
                color:        active ? m.hexColor         : 'var(--text-muted)',
                border:       `1px solid ${active ? `${m.hexColor}55` : 'transparent'}`,
                boxShadow:    active ? `0 0 12px ${m.hexColor}22` : 'none',
              }}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          )
        })}
      </div>

      {/* Course Selector Dropdown (Only show in Focus Mode) */}
      {mode === 'focus' && (
        <div className="relative z-20 w-48 mx-auto">
          <button 
            onClick={() => !isRunning && setCourseDropdownOpen(!courseDropdownOpen)}
            disabled={isRunning || courses.length === 0}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--bg-surface-2)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-center gap-2 truncate">
              {activeCourseId && courses.find(c => c.id === activeCourseId) ? (
                <>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: courses.find(c => c.id === activeCourseId)?.color }} />
                  <span className="truncate">{courses.find(c => c.id === activeCourseId)?.name}</span>
                </>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Select a Course...</span>
              )}
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} className={`transition-transform ${courseDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {courseDropdownOpen && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-2xl overflow-hidden py-1"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-accent)' }}
            >
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => { setActiveCourse(course.id); setCourseDropdownOpen(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-left transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color }} />
                  <span className="truncate">{course.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timer face */}
      <div className="flex flex-col items-center">
        <div className="relative w-72 h-72 flex items-center justify-center">
          <ProgressRing progress={progress} color={ringColor} size={280} stroke={7} />

          {/* Soft radial glow */}
          <div
            className="absolute w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-500"
            style={{ background: ringColor }}
          />

          {/* Inner face */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <span
              id="timer-display"
              className="font-pixel pixel-shadow"
              style={{
                fontSize:     'clamp(2rem, 5vw, 2.8rem)',
                color:        sessionDone ? '#fbbf24' : 'var(--text-primary)',
                letterSpacing: '0.05em',
              }}
            >
              {formatTime(timeLeft)}
            </span>
            <span
              className="text-[10px] font-semibold tracking-wider"
              style={{ color: ringColor }}
            >
              {sessionDone ? '✦ SESSION COMPLETE ✦' : modeConf.label.toUpperCase()}
            </span>
            {!sessionDone && (
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {isRunning ? '● FOCUSING' : '○ PAUSED'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Session-complete banner */}
      {sessionDone && (
        <div
          className="glass rounded-2xl px-6 py-4 flex items-center gap-4 anim-slide-down"
          style={{ border: '1px solid rgba(251,191,36,0.35)', boxShadow: '0 0 20px rgba(251,191,36,0.15)' }}
        >
          <div className="text-3xl anim-float">🏆</div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--accent-gold)' }}>
              Focus session complete!
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Your time has been logged to your analytics dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        {/* Reset */}
        <button
          id="timer-reset"
          onClick={resetTimer}
          title="Reset"
          className="w-12 h-12 rounded-full glass flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-110"
          style={{ color: 'var(--text-muted)' }}
        >
          <RotateCcw size={18} />
        </button>

        {/* Play / Pause — pixel-bordered */}
        <button
          id={isRunning ? 'timer-pause' : 'timer-start'}
          onClick={isRunning ? pauseTimer : startTimer}
          disabled={sessionDone}
          className="w-20 h-20 rounded-full flex items-center justify-center font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${ringColor}cc, ${ringColor}88)`,
            boxShadow:  `0 0 24px ${ringColor}55, 0 4px 16px rgba(0,0,0,0.4)`,
            border:     `2px solid ${ringColor}88`,
          }}
        >
          {isRunning
            ? <Pause size={26} fill="white" color="white" />
            : <Play  size={26} fill="white" color="white" className="translate-x-0.5" />
          }
        </button>

        {/* Spacer */}
        <div className="w-12 h-12" />
      </div>

      {/* Stats strip */}
      <div
        className="glass rounded-2xl p-4 grid grid-cols-2 gap-4 text-center"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {[
          { label: 'Sessions', value: sessionHistory.length, color: 'var(--text-primary)' },
          { label: 'Total Minutes', value: sessionHistory.reduce((acc, s) => acc + s.duration, 0), color: 'var(--accent-primary)' },
        ].map((s, i) => (
          <div key={s.label} className={i === 1 ? 'border-l' : ''} style={{ borderColor: 'var(--border-color)' }}>
            <p className="font-pixel text-[14px]" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
