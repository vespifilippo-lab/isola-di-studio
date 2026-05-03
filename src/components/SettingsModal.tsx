import { useState } from 'react'
import { X, Clock, Save, Palette, Check } from 'lucide-react'
import { useStore, THEMES, type TimerSettings } from '../store/useStore'

// ─── Number Slider ─────────────────────────────────────────────────────────────

interface SliderProps {
  id:      string
  label:   string
  value:   number
  min:     number
  max:     number
  step?:   number
  unit?:   string
  onChange:(v: number) => void
}

function DurationSlider({ id, label, value, min, max, step = 1, unit = 'min', onChange }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
        <span
          className="font-pixel text-[10px] px-2 py-1 rounded"
          style={{
            color:      'var(--accent-primary)',
            background: 'rgba(255,255,255,0.05)',
            border:     '1px solid var(--border-accent)',
          }}
        >
          {value} {unit}
        </span>
      </div>
      {/* Quick-pick buttons */}
      <div className="flex gap-2">
        {[min, Math.round((min + max) / 2), max].map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className="flex-1 py-1 text-[10px] rounded transition-all duration-150 hover:scale-105 active:scale-95"
            style={{
              background:   value === preset ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              color:        value === preset ? '#000' : 'var(--text-muted)',
              border:       `1px solid ${value === preset ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              fontFamily:   'monospace',
              borderRadius: '6px',
            }}
          >
            {preset}
          </button>
        ))}
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent-primary)] h-1.5 rounded-full cursor-pointer"
        style={{ accentColor: 'var(--accent-primary)' }}
      />
      <div className="flex justify-between text-[9px]" style={{ color: 'var(--text-muted)' }}>
        <span>{min} min</span>
        <span>{max} min</span>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, theme, updateSettings, setTheme } = useStore()

  const [local, setLocal] = useState<TimerSettings>({ ...settings })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    updateSettings(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }


  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade-in"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal panel */}
      <div
        className="w-full max-w-md glass rounded-2xl overflow-hidden anim-slide-down"
        style={{ border: '1px solid var(--border-accent)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div>
            <h2 className="font-pixel text-[10px]" style={{ color: 'var(--accent-primary)' }}>
              SETTINGS
            </h2>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Customise your focus environment
            </p>
          </div>
          <button
            id="settings-close"
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">

          {/* ── Timer Durations ── */}
          <section className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
              <span className="font-pixel text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                TIMER DURATIONS
              </span>
            </div>

            <DurationSlider
              id="setting-focus"
              label="Focus Session"
              value={local.focusMins}
              min={5}
              max={60}
              onChange={(v) => setLocal((p) => ({ ...p, focusMins: v }))}
            />
            <DurationSlider
              id="setting-short-break"
              label="Short Break"
              value={local.shortBreakMins}
              min={1}
              max={15}
              onChange={(v) => setLocal((p) => ({ ...p, shortBreakMins: v }))}
            />
            <DurationSlider
              id="setting-long-break"
              label="Long Break"
              value={local.longBreakMins}
              min={5}
              max={60}
              onChange={(v) => setLocal((p) => ({ ...p, longBreakMins: v }))}
            />
          </section>

          {/* Divider */}
          <div className="h-px" style={{ background: 'var(--border-color)' }} />

          {/* ── Theme Picker ── */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Palette size={14} style={{ color: 'var(--accent-primary)' }} />
              <span className="font-pixel text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                THEME
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((t) => {
                const isActive = theme === t.id
                return (
                  <button
                    key={t.id}
                    id={`theme-select-${t.id}`}
                    onClick={() => setTheme(t.id)}
                    className={`
                      relative flex flex-col items-start gap-1 p-3 rounded-xl text-left
                      transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    `}
                    style={{
                      background:  isActive ? 'var(--bg-surface-2)' : 'rgba(255,255,255,0.03)',
                      border:      `2px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      borderRadius: '12px',
                    }}
                  >
                    {isActive && (
                      <span
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent-primary)' }}
                      >
                        <Check size={11} color="#000" strokeWidth={3} />
                      </span>
                    )}
                    <span className="text-xl">{t.emoji}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {t.label}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {t.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Timer resets when durations change
          </p>
          <button
            id="settings-save"
            onClick={handleSave}
            className="
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              transition-all duration-200 hover:scale-105 active:scale-95
            "
            style={{
              background: saved ? 'rgba(74,222,128,0.2)' : 'var(--accent-primary)',
              color:      saved ? 'var(--accent-primary)' : '#000',
              border:     saved ? '1px solid var(--accent-primary)' : 'none',
            }}
          >
            {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  )
}
