import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Timer, Settings, BarChart, Menu, X, BookOpen } from 'lucide-react'
import FocusTimer from './components/FocusTimer'
import SettingsModal from './components/SettingsModal'
import OnboardingModal from './components/OnboardingModal'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import CourseManager from './components/CourseManager'
import { useStore } from './store/useStore'
import Updater from './components/Updater'

// ─── View config ───────────────────────────────────────────────────────────────

type View = 'dashboard' | 'courses' | 'timer'

interface NavItem {
  id:          View
  label:       string
  icon:        React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Analytics',   icon: LayoutDashboard },
  { id: 'courses',   label: 'Courses',     icon: BookOpen },
  { id: 'timer',     label: 'Focus Timer', icon: Timer           },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ currentView, onNavigate, collapsed, onToggle, onOpenSettings }: any) {
  const { username } = useStore()
  return (
    <aside className={`fixed left-0 top-0 h-full z-40 flex flex-col border-r transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`} style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl shadow-lg" style={{ backgroundColor: 'var(--accent-primary)' }}>
          <BarChart size={18} color="#000" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-sm tracking-wide truncate" style={{ color: 'var(--text-primary)' }}>NEXUS LAB</p>
            <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{username || 'User'}'s Dashboard</p>
          </div>
        )}
        <button onClick={onToggle} className="ml-auto flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive ? 'border' : 'hover:bg-white/5 border border-transparent'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--accent-glow)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderColor: isActive ? 'var(--accent-primary)' : 'transparent'
              }}
            >
              <Icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={onOpenSettings}
          title="Settings"
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all ${collapsed ? 'justify-center' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
        >
          <Settings size={20} />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
      </div>
    </aside>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' as const } },
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { username, theme } = useStore()

  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  const viewTitles: Record<View, { title: string, subtitle: string }> = {
    dashboard: { title: 'Analytics Overview', subtitle: 'Track your deep work and optimize your time.' },
    courses: { title: 'Course Manager', subtitle: 'Configure your learning tracks.' },
    timer: { title: 'Focus Session', subtitle: 'Lock in and crush your goals.' },
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-300" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {!username && <OnboardingModal />}
      <Updater />

      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? '72px' : '256px' }}>
        <header data-tauri-drag-region className="flex-shrink-0 backdrop-blur-md border-b px-8 py-5 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="pointer-events-none">
            <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {viewTitles[currentView].title}
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {viewTitles[currentView].subtitle}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentView} className="h-full" variants={pageVariants} initial="initial" animate="enter" exit="exit">
              {currentView === 'dashboard' && <AnalyticsDashboard />}
              {currentView === 'courses'   && <CourseManager />}
              {currentView === 'timer'     && <FocusTimer />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
