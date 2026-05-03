import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, ArrowRight, AlertCircle } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function OnboardingModal() {
  const login = useStore((s) => s.login)

  const [username, setUsername] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleBegin() {
    const trimmed = username.trim()
    if (!trimmed) {
      setError('A researcher name is required.')
      return
    }
    if (trimmed.length < 2) {
      setError('Identity must be at least 2 characters.')
      return
    }
    setError('')
    setSubmitted(true)

    setTimeout(() => login(trimmed), 800)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleBegin()
  }

  return (
    <AnimatePresence>
      {!submitted && (
        <motion.div
          key="onboarding-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: 'rgba(2, 6, 23, 0.98)', backdropFilter: 'blur(12px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <motion.div
            key="onboarding-card"
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-[#0b0f19] border border-white/5 shadow-[0_0_100px_rgba(79,70,229,0.15)]"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 30, stiffness: 200 } }}
            exit={{ opacity: 0, scale: 1.05, y: -40, transition: { duration: 0.4 } }}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

            <div className="px-12 py-16">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
                <div className="mx-auto mb-6 w-20 h-20 rounded-[2rem] flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                  <BarChart size={32} className="text-indigo-400" />
                </div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">ISOLA LAB</h1>
                <p className="text-base text-slate-400 font-medium">Quantify your focus. Optimize your mind.</p>
              </motion.div>

              <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }}>
                <div>
                  <label className="block text-[10px] font-bold mb-3 tracking-[0.3em] uppercase text-indigo-400/80 text-center">
                    Initialize Research Identity
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your name..."
                    maxLength={24}
                    autoFocus
                    className={`w-full px-6 py-5 rounded-2xl text-center text-xl font-bold text-white placeholder-slate-700 outline-none transition-all duration-300 bg-white/[0.03] border ${error ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/10 focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-indigo-500/10'}`}
                  />
                  <AnimatePresence>
                    {error && (
                      <motion.div className="mt-3 flex items-center justify-center gap-2 text-red-400" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AlertCircle size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  onClick={handleBegin}
                  className="group relative w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-white transition-all duration-300 bg-indigo-600 hover:bg-indigo-500 shadow-[0_20px_40px_rgba(79,70,229,0.25)] hover:shadow-[0_25px_50px_rgba(79,70,229,0.4)] overflow-hidden"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 text-lg">ENTER LABORATORY</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </motion.div>
            </div>

            <div className="px-12 py-6 bg-white/[0.02] border-t border-white/5 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Version 0.1.0 // Deep Work Analytics Protocol</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
