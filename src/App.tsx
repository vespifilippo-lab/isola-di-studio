import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Timer, Settings, BarChart, Menu, X, BookOpen, LogOut, Loader2 } from 'lucide-react'
import { exit } from '@tauri-apps/plugin-process'
import FocusTimer from './components/FocusTimer'
import SettingsModal from './components/SettingsModal'
import OnboardingModal from './components/OnboardingModal'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import CourseManager from './components/CourseManager'
import Notification, { NotificationType } from './components/Notification'
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

function Sidebar({ currentView, onNavigate, collapsed, onToggle, onOpenSettings, onExit }: any) {
  const { username } = useStore()
  return (
    <aside className={`fixed left-0 top-0 h-full z-40 flex flex-col border-r transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`} style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', backdropFilter: 'blur(10px)' }}>
      <div className="flex items-center gap-3 px-4 py-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] transition-transform hover:rotate-12" style={{ backgroundColor: 'var(--accent-primary)' }}>
          <BarChart size={20} color="#000" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-extrabold text-sm tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>ISOLA LAB</p>
            <p className="text-[10px] font-medium opacity-60 truncate" style={{ color: 'var(--text-secondary)' }}>{username || 'Researcher'}</p>
          </div>
        )}
        <button onClick={onToggle} className="ml-auto flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-8 px-3 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive ? 'shadow-md translate-x-1' : 'hover:bg-white/5'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--accent-glow)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent'
              }}
            >
              <Icon size={20} className={isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
              {!collapsed && <span className="text-sm font-semibold tracking-tight">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-4 space-y-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all ${collapsed ? 'justify-center' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
        >
          <Settings size={20} />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
        
        <button
          onClick={onExit}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 transition-all text-red-400 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Exit App</span>}
        </button>
      </div>
    </aside>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  enter:   { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
  exit:    { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{message: string, type: NotificationType} | null>(null)
  
  const { username, theme } = useStore()

  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({ message, type })
  }

  const handleExit = async () => {
    setLoading(true)
    showNotification('Closing all background processes...', 'info')
    setTimeout(async () => {
      await exit(0)
    }, 1200)
  }

  const viewTitles: Record<View, { title: string, subtitle: string }> = {
    dashboard: { title: 'Analytics Overview', subtitle: 'Track your deep work and optimize your time.' },
    courses: { title: 'Course Manager', subtitle: 'Configure your learning tracks.' },
    timer: { title: 'Focus Session', subtitle: 'Lock in and crush your goals.' },
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-500" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {!username && <OnboardingModal />}
      <Updater />

      <AnimatePresence>
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-white font-medium animate-pulse text-lg">Processing...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        onOpenSettings={() => setSettingsOpen(true)}
        onExit={handleExit}
      />

      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? '72px' : '256px' }}>
        <header data-tauri-drag-region className="flex-shrink-0 backdrop-blur-xl border-b px-10 py-6 flex items-center justify-between z-10" style={{ backgroundColor: 'var(--bg-surface-80)', borderColor: 'var(--border-color)' }}>
          <div className="pointer-events-none">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {viewTitles[currentView].title}
            </h1>
            <p className="text-sm mt-1 font-medium opacity-60" style={{ color: 'var(--text-secondary)' }}>
              {viewTitles[currentView].subtitle}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-gradient-to-br from-transparent via-transparent to-indigo-500/5">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentView} 
              className="h-full max-w-7xl mx-auto" 
              variants={pageVariants} 
              initial="initial" 
              animate="enter" 
              exit="exit"
            >
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
