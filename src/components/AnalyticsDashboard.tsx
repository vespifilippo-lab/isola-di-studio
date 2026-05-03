import { useMemo } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'

export default function AnalyticsDashboard() {
  const { sessionHistory, courses } = useStore()

  // ─── 1. Weekly Progress (Bar Chart) ──────────────────────────────────────────
  const weeklyData = useMemo(() => {
    const map: Record<string, number> = {}
    const today = new Date()
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      map[dateStr] = 0
    }

    sessionHistory.forEach((s) => {
      if (map[s.date] !== undefined) {
        map[s.date] += s.duration
      }
    })

    return Object.keys(map).map((date) => {
      const d = new Date(date)
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      return {
        name: dayName,
        hours: Number((map[date] / 60).toFixed(2)) // Convert to hours
      }
    })
  }, [sessionHistory])

  // ─── 2. Course Distribution (Donut Chart) ────────────────────────────────────
  const donutData = useMemo(() => {
    const map: Record<string, number> = {}
    courses.forEach(c => map[c.id] = 0)
    
    sessionHistory.forEach(s => {
      if (s.courseId && map[s.courseId] !== undefined) {
        map[s.courseId] += s.duration
      }
    })

    return courses.map(c => ({
      name: c.name,
      value: map[c.id] || 0,
      color: c.color,
    })).filter(c => c.value > 0)
  }, [courses, sessionHistory])

  const totalMinutes = donutData.reduce((acc, curr) => acc + curr.value, 0)

  // ─── 3. Activity Heatmap (Grid) ──────────────────────────────────────────────
  const heatmapCells = useMemo(() => {
    const map: Record<string, number> = {}
    const today = new Date()
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      map[d.toISOString().slice(0, 10)] = 0
    }
    sessionHistory.forEach((s) => {
      if (map[s.date] !== undefined) map[s.date] += s.duration
    })
    return Object.keys(map).map(date => ({ date, value: map[date] }))
  }, [sessionHistory])

  const getHeatmapColor = (minutes: number) => {
    if (minutes === 0) return 'bg-white/[0.02] border-white/5'
    if (minutes < 30) return 'bg-indigo-900 border-indigo-800'
    if (minutes < 60) return 'bg-indigo-600 border-indigo-500'
    if (minutes < 120) return 'bg-indigo-500 border-indigo-400'
    return 'bg-indigo-400 border-indigo-300'
  }

  return (
    <div className="w-full h-full flex flex-col gap-6">
      
      {/* Top Row: Weekly Progress & Heatmap */}
      <div className="flex-[0.6] flex flex-col lg:flex-row gap-6 min-h-[250px]">
        
        {/* Weekly Progress Bar Chart */}
        <div className="flex-[1.5] border rounded-2xl p-6 relative overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="mb-4 z-10">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Progress</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total hours per day</p>
          </div>
          <div className="flex-1 w-full min-h-0 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} dy={5} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--bg-surface-2)', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                />
                <Bar dataKey="hours" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consistency Heatmap */}
        <div className="flex-1 border rounded-2xl p-6 flex flex-col" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Consistency Matrix</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Last 60 days activity</p>
          </div>
          <div className="flex-1 grid grid-cols-10 grid-rows-6 gap-1.5 content-center">
            {heatmapCells.map((cell, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.005 }}
                key={cell.date} 
                title={`${cell.date}: ${cell.value} mins`}
                className={`w-full aspect-square rounded-[4px] border ${getHeatmapColor(cell.value)} transition-colors hover:ring-2 hover:ring-white/50 cursor-pointer`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Course Distribution */}
      <div className="flex-[0.4] border rounded-2xl p-6 flex flex-col lg:flex-row items-center gap-8 min-h-[200px]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex-1 w-full h-full min-h-[150px] relative">
          <div className="absolute top-0 left-0">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Course Distribution</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Time allocation</p>
          </div>
          {totalMinutes === 0 ? (
             <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    formatter={(val: any) => [`${Math.floor(val/60)}h ${val%60}m`, 'Time']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total</span>
                <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{Math.floor(totalMinutes / 60)}h</span>
              </div>
            </>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex-1 w-full flex flex-col gap-3 justify-center">
          {donutData.length === 0 ? (
            <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>Complete focus sessions to see distribution.</p>
          ) : (
            donutData.map(c => (
              <div key={c.name} className="flex items-center justify-between p-2 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                </div>
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  {((c.value / totalMinutes) * 100).toFixed(1)}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
