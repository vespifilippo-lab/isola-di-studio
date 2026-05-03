import { useState } from 'react'
import { Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react'
import { useStore, type Course } from '../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', 
  '#d946ef', '#f43f5e', '#64748b'
]

export default function CourseManager() {
  const { courses, addCourse, deleteCourse, activeCourseId, setActiveCourse } = useStore()
  
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[6])
  const [target, setTarget] = useState(10)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!name.trim()) {
      setError('Please enter a course name.')
      return
    }
    
    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      color,
      targetHours: target
    }
    
    addCourse(newCourse)
    if (!activeCourseId) setActiveCourse(newCourse.id)
    
    setName('')
    setTarget(10)
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <div className="w-full h-full border rounded-[2rem] p-8 flex flex-col relative overflow-hidden shadow-xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
      <div className="mb-8 z-10 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>Course Repository</h2>
          <p className="text-sm font-medium opacity-60" style={{ color: 'var(--text-secondary)' }}>Manage your academic or professional tracks.</p>
        </div>
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <BookOpen size={24} className="text-indigo-400" />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-10 min-h-0 z-10">
        
        {/* Create Course Form */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 p-8 rounded-[1.5rem] border shadow-inner" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--text-secondary)' }}>Add New Track</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest opacity-50" style={{ color: 'var(--text-secondary)' }}>Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null) }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Quantum Physics"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${error ? 'border-red-500/50 ring-2 ring-red-500/10' : 'focus:ring-2 focus:ring-indigo-500/20'}`}
                style={{ backgroundColor: 'var(--bg-base)', borderColor: error ? undefined : 'var(--border-accent)', color: 'var(--text-primary)' }}
              />
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 mt-2 text-red-400">
                    <AlertCircle size={12} />
                    <span className="text-[10px] font-bold">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest opacity-50" style={{ color: 'var(--text-secondary)' }}>Monthly Goal (Hours)</label>
              <input 
                type="number" 
                min={1}
                max={200}
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
                onKeyDown={handleKeyDown}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-accent)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-3 uppercase tracking-widest opacity-50" style={{ color: 'var(--text-secondary)' }}>Palette</label>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-all hover:scale-110 active:scale-95 ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0b0f19]' : 'opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => handleAdd()}
            className="mt-auto w-full group overflow-hidden relative text-sm font-bold py-4 rounded-xl transition-all active:scale-[0.98]"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#000' }}
          >
            <div className="flex items-center justify-center gap-2 relative z-10">
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              <span>Initialize Track</span>
            </div>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>

        {/* Existing Courses List */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 mb-2" style={{ color: 'var(--text-secondary)' }}>Active Tracks</h3>
          
          <AnimatePresence mode="popLayout">
            {courses.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                  <BookOpen size={24} />
                </div>
                <p className="text-sm font-medium italic">No research tracks defined.</p>
              </motion.div>
            )}
            
            {courses.map((course) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={course.id} 
                className="flex items-center justify-between p-5 rounded-2xl border group transition-all hover:translate-x-1"
                style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]" style={{ backgroundColor: course.color, boxShadow: `0 0 15px ${course.color}44` }} />
                  <div>
                    <p className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{course.name}</p>
                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Target: {course.targetHours}h / month</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteCourse(course.id)}
                  className="p-2.5 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
