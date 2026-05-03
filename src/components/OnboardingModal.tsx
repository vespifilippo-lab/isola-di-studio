import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, ArrowRight } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function OnboardingModal() {
  const login = useStore((s) => s.login)

  const [username, setUsername] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleBegin() {
    const trimmed = username.trim()
    if (!trimmed) {
      setError('Please enter a username to continue.')
      return
    }
    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters.')
      return
    }
    setError('')
    setSubmitted(true)

    setTimeout(() => login(trimmed), 600)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleBegin()
  }

  return (
    <AnimatePresence>
      {!submitted && (
        <motion.div
          key="onboarding-backdrop"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(10px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <motion.div
            key="onboarding-card"
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0b0f19] border border-white/5 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
            exit={{ opacity: 0, scale: 1.05, y: -20, transition: { duration: 0.3 } }}
          >
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

            <div className="px-8 py-10">
              <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
                <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <BarChart size={28} className="text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">NEXUS LAB</h1>
                <p className="text-sm text-slate-400">Professional productivity analytics.</p>
              </motion.div>

              <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
                <div>
                  <label className="block text-xs font-semibold mb-2 tracking-wider uppercase text-slate-400">
                    Researcher Name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Alex"
                    maxLength={24}
                    autoFocus
                    className={`w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 outline-none transition-all duration-200 bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50'}`}
                  />
                  <AnimatePresence>
                    {error && (
                      <motion.p className="mt-1.5 text-xs text-red-400" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  onClick={handleBegin}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Initialize Lab
                  <ArrowRight size={18} />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
