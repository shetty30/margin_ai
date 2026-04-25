import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { auth } from '../api/client'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({name:'',email:'',password:''})
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const {data} = await (mode==='login' ? auth.login : auth.register)(form)
      localStorage.setItem('margin_token', data.access_token)
      localStorage.setItem('margin_user', JSON.stringify(data.user))
      nav(data.user.onboarded ? '/' : '/onboarding')
    } catch(e){ setErr(e.response?.data?.detail||'Something went wrong') }
    finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{background:'linear-gradient(135deg,#6c5ce7,#0984e3)'}}>
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M3 14 L7 8 L11 11 L17 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="4" r="2" fill="#fff"/></svg>
          </div>
          <div className="text-2xl font-medium text-white tracking-tight">margin <span style={{color:'#6c5ce7'}}>AI</span></div>
          <p className="text-white/30 text-sm mt-1">Income − Savings = Your margin</p>
        </div>
        <div className="rounded-2xl p-6" style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.08)'}}>
          <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{background:'rgba(255,255,255,0.04)'}}>
            {['login','register'].map(m=>(
              <button key={m} onClick={()=>setMode(m)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${mode===m?'text-white':'text-white/30'}`} style={mode===m?{background:'rgba(108,92,231,0.25)',border:'0.5px solid rgba(108,92,231,0.35)'}:{}}>
                {m==='login'?'Sign in':'Create account'}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-3">
            {mode==='register'&&<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" className="w-full rounded-xl px-4 py-3 text-sm text-white" style={{background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)'}} required/>}
            <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full rounded-xl px-4 py-3 text-sm text-white" style={{background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)'}} required/>
            <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Password" className="w-full rounded-xl px-4 py-3 text-sm text-white" style={{background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)'}} required/>
            {err&&<p className="text-red/70 text-xs">{err}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-medium text-white mt-1 disabled:opacity-60 transition-opacity hover:opacity-90" style={{background:'linear-gradient(135deg,#6c5ce7,#0984e3)'}}>
              {loading?'...':(mode==='login'?'Sign in':'Create account')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
