import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { profile } from '../api/client'

const steps = [
  { id: 0, title: "What's your monthly income?", sub: "Your take-home salary or freelance income", field: "monthly_income", type: "number", placeholder: "65000", prefix: "₹" },
  { id: 1, title: "How much do you want to save?", sub: "This amount is protected first. You spend what's left.", field: "savings_target", type: "number", placeholder: "15000", prefix: "₹" },
  { id: 2, title: "A bit about you", sub: "Optional — helps personalise your experience", multi: true },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ monthly_income:'', savings_target:'', phone:'', city:'', occupation:'' })
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const budget = data.monthly_income && data.savings_target
    ? Number(data.monthly_income) - Number(data.savings_target)
    : null

  const next = async () => {
    if (step < steps.length - 1) { setStep(s => s+1); return }
    setLoading(true)
    try {
      await profile.update({ ...data, monthly_income: Number(data.monthly_income), savings_target: Number(data.savings_target) })
      nav('/')
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const cur = steps[step]

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex gap-1.5 mb-8">
          {steps.map((_,i)=>(
            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500" style={{background: i<=step ? 'linear-gradient(90deg,#6c5ce7,#0984e3)' : 'rgba(255,255,255,0.08)'}}/>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.25}}>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Step {step+1} of {steps.length}</p>
            <h2 className="text-xl font-medium text-white mb-1">{cur.title}</h2>
            <p className="text-white/30 text-sm mb-6">{cur.sub}</p>
            {cur.multi ? (
              <div className="space-y-3">
                {[['phone','Phone number','9876543210'],['city','Your city','Mumbai'],['occupation','Occupation','Software Engineer']].map(([f,pl,ex])=>(
                  <input key={f} value={data[f]} onChange={e=>setData({...data,[f]:e.target.value})} placeholder={pl} className="w-full rounded-xl px-4 py-3 text-sm text-white" style={{background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)'}}/>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-3" style={{background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)'}}>
                  <span className="text-white/40 text-base">{cur.prefix}</span>
                  <input type={cur.type} value={data[cur.field]} onChange={e=>setData({...data,[cur.field]:e.target.value})} placeholder={cur.placeholder} className="flex-1 bg-transparent text-xl font-medium text-white"/>
                </div>
                {budget !== null && step === 1 && (
                  <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="rounded-xl p-4" style={{background:'rgba(0,184,148,0.08)',border:'0.5px solid rgba(0,184,148,0.25)'}}>
                    <p className="text-xs text-green/70 mb-1">Your expense budget</p>
                    <p className="text-2xl font-medium" style={{color:'#00b894'}}>₹{budget.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-white/30 mt-1">This is what you're allowed to spend each month</p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <button onClick={next} disabled={loading || (!cur.multi && !data[cur.field])} className="w-full py-3 rounded-xl text-sm font-medium text-white mt-6 disabled:opacity-40 hover:opacity-90 transition-opacity" style={{background:'linear-gradient(135deg,#6c5ce7,#0984e3)'}}>
          {loading ? 'Saving...' : step === steps.length-1 ? 'Start using Margin AI →' : 'Continue →'}
        </button>
        {step > 0 && <button onClick={()=>setStep(s=>s-1)} className="w-full py-2 text-xs text-white/25 mt-2 hover:text-white/40 transition-colors">← Back</button>}
      </div>
    </div>
  )
}
