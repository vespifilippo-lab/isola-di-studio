import { useState } from 'react'
import { Plus, Trash2, BookOpen } from 'lucide-react'
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
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
  }

  return (
    <div className="w-full h-full border rounded-2xl p-6 flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
      <div className="mb-6 z-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Course Manager</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Configure your learning tracks</p>
        </div>
        <BookOpen size={20} style={{ color: 'var(--accent-primary)' }} />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0 z-10">
        
        {/* Create Course Form */}
        <form onSubmit={handleAdd} className="flex-1 flex flex-col gap-5 p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Add New Course</h3>
          
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Course Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Advanced Mathematics"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
              style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-accent)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Monthly Goal (Hours)</label>
            <input 
              type="number" 
              min={1}
              max={200}
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors"
              style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border-accent)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Theme Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-white ring-offset-2' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={!name.trim()}
            className="mt-auto w-full disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#000' }}
          >
            <Plus size={16} />
            Create Course
          </button>
        </form>

        {/* Existing Courses List */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Active Courses</h3>
          
          <AnimatePresence mode="popLayout">
            {courses.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm italic text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No courses added yet.
              </motion.div>
            )}
            
            {courses.map((course) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={course.id} 
                className="flex items-center justify-between p-4 rounded-xl border group transition-colors"
                style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: course.color, boxShadow: `0 0 8px ${course.color}88` }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{course.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{course.targetHours}h / month goal</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteCourse(course.id)}
                  className="p-2 rounded-md hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
