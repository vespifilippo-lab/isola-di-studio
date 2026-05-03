import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimerMode = 'focus' | 'short_break' | 'long_break'
export type ThemeId = 'theme-modern-dark' | 'theme-pixel-retro' | 'theme-cyberpunk' | 'theme-cozy-matcha' | 'theme-light'

export const THEMES = [
  { id: 'theme-modern-dark', label: 'Dark Lab', emoji: '🌙', desc: 'Sleek & professional dark mode' },
  { id: 'theme-light',       label: 'Light Lab', emoji: '☀️', desc: 'Clean & minimal light mode' },
  { id: 'theme-cyberpunk',   label: 'Neon Cyber', emoji: '🌆', desc: 'High contrast neon aesthetics' },
  { id: 'theme-cozy-matcha', label: 'Matcha', emoji: '🍵', desc: 'Calming green and earthy tones' },
] as const;

export interface Course {
  id:          string
  name:        string
  color:       string
  targetHours: number
}

export interface SessionEntry {
  id:        string
  date:      string // "YYYY-MM-DD"
  timestamp: number // Exact Unix ms
  duration:  number // Minutes
  courseId:  string | null
}

export interface TimerSettings {
  focusMins:      number
  shortBreakMins: number
  longBreakMins:  number
}

// ─── Store Shape ──────────────────────────────────────────────────────────────

interface AppState {
  // Identity
  username: string | null

  // Data
  courses:        Course[]
  sessionHistory: SessionEntry[]
  activeCourseId: string | null

  // Timer State
  settings:              TimerSettings
  timeLeft:              number
  isRunning:             boolean
  mode:                  TimerMode
  theme:                 ThemeId

  // Actions
  login:           (username: string) => void
  setTheme:        (theme: ThemeId) => void
  addCourse:       (course: Course) => void
  deleteCourse:    (id: string) => void
  setActiveCourse: (id: string | null) => void
  
  updateSettings: (settings: TimerSettings) => void
  startTimer:     () => void
  pauseTimer:     () => void
  resetTimer:     () => void
  tickTimer:      () => void
  setMode:        (mode: TimerMode) => void
}

// ─── Constants & Helpers ──────────────────────────────────────────────────────

const DEFAULT_SETTINGS: TimerSettings = {
  focusMins:      25,
  shortBreakMins:  5,
  longBreakMins:  15,
}

export function getTimerDurations(s: TimerSettings): Record<TimerMode, number> {
  return {
    focus:       s.focusMins      * 60,
    short_break: s.shortBreakMins * 60,
    long_break:  s.longBreakMins  * 60,
  }
}

const todayStr = () => new Date().toISOString().slice(0, 10)

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      username:       null,
      courses:        [
        { id: 'c1', name: 'Computer Science', color: '#3b82f6', targetHours: 20 },
        { id: 'c2', name: 'Mathematics',      color: '#8b5cf6', targetHours: 15 },
      ],
      sessionHistory: [],
      activeCourseId: 'c1',

      settings: DEFAULT_SETTINGS,
      timeLeft: DEFAULT_SETTINGS.focusMins * 60,
      isRunning: false,
      mode: 'focus',
      theme: 'theme-modern-dark',

      login: (username) => set({ username }),
      setTheme: (theme) => set({ theme }),
      
      addCourse: (course) => set((s) => ({ courses: [...s.courses, course] })),
      
      deleteCourse: (id) => set((s) => ({
        courses: s.courses.filter(c => c.id !== id),
        activeCourseId: s.activeCourseId === id ? (s.courses.find(c => c.id !== id)?.id || null) : s.activeCourseId
      })),
      
      setActiveCourse: (id) => set({ activeCourseId: id }),

      updateSettings: (settings) => {
        const durations = getTimerDurations(settings)
        set((s) => ({
          settings,
          timeLeft: s.isRunning ? s.timeLeft : durations[s.mode],
        }))
      },

      startTimer: () => set({ isRunning: true }),
      pauseTimer: () => set({ isRunning: false }),
      resetTimer: () =>
        set((s) => ({
          isRunning: false,
          timeLeft:  getTimerDurations(s.settings)[s.mode],
        })),

      setMode: (mode) =>
        set((s) => ({
          mode,
          isRunning: false,
          timeLeft:  getTimerDurations(s.settings)[mode],
        })),

      tickTimer: () => {
        const { timeLeft, mode, isRunning, settings, activeCourseId } = get()
        if (!isRunning) return

        if (timeLeft <= 1) {
          set({ isRunning: false, timeLeft: 0 })

          if (mode === 'focus') {
            const newSession: SessionEntry = {
              id:        Math.random().toString(36).substr(2, 9),
              date:      todayStr(),
              timestamp: Date.now(),
              duration:  settings.focusMins,
              courseId:  activeCourseId,
            }
            set((s) => ({
              sessionHistory: [...s.sessionHistory, newSession],
            }))
          }
          return
        }

        set({ timeLeft: timeLeft - 1 })
      },
    }),
    {
      name: 'isola-lab-state',
      partialize: (state) => ({
        username:       state.username,
        courses:        state.courses,
        sessionHistory: state.sessionHistory,
        settings:       state.settings,
        theme:          state.theme,
      }),
    }
  )
)
