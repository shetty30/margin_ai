import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api/client'

const features = [
  { icon: '◈', label: 'SMS auto-import', desc: 'UPI transactions logged automatically' },
  { icon: '◎', label: 'AI categorisation', desc: 'Groq instantly tags every expense' },
  { icon: '◉', label: 'Can I afford this?', desc: 'Real answers from your actual data' },
]

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const nav = useNavigate()

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const fn = mode === 'login' ? auth.login : auth.register
      const { data } = await fn(form)
      localStorage.setItem('margin_token', data.access_token)
      localStorage.setItem('margin_user', JSON.stringify(data.user))
      nav(data.user.onboarded ? '/' : '/onboarding')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F6FAF8', position: 'relative', overflow: 'hidden' }}>
      {/* Orbs */}
      <div className="orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle,rgba(5,150,105,0.10),transparent)', top: '-150px', left: '-150px' }} />
      <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(13,148,136,0.07),transparent)', bottom: '-80px', right: '35%' }} />

      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', position: 'relative', zIndex: 1 }}
        className="hidden md:flex">
        <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '100ms' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#059669,#0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(5,150,105,0.30)' }}>
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M3 14L7 8L11 11L17 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="17" cy="4" r="2" fill="#fff"/>
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>margin</span>
              <span style={{ fontSize: 11, marginLeft: 6, padding: '2px 7px', borderRadius: 6, background: 'rgba(5,150,105,0.10)', color: '#059669', fontWeight: 600 }}>AI</span>
            </div>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 16, color: 'var(--text)' }}>
            Know your<br/><span className="gradient-text">margin.</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--muted)', marginBottom: 56, lineHeight: 1.6, fontWeight: 400 }}>
            Income − Savings = what you're<br/>allowed to spend. Nothing more.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {features.map((f, i) => (
              <div key={f.label} className="transition-all duration-500"
                style={{ transitionDelay: `${200 + i * 80}ms`, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateX(-12px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(5,150,105,0.09)', border: '1px solid rgba(5,150,105,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative', zIndex: 1 }}>
        <div className={`w-full transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ transitionDelay: '200ms' }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, justifyContent: 'center' }} className="md:hidden">
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#059669,#0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 14L7 8L11 11L17 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="4" r="2" fill="#fff"/></svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>margin <span style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 400 }}>AI</span></span>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--rim)', borderRadius: 24, padding: 36, boxShadow: '0 8px 40px rgba(5,150,105,0.08)' }}>
            {/* Tab toggle */}
            <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface)', borderRadius: 14, marginBottom: 32 }}>
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 11, fontSize: 13, fontWeight: 600, transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                  background: mode === m ? 'linear-gradient(135deg,#059669,#0D9488)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--muted)',
                  boxShadow: mode === m ? '0 4px 16px rgba(5,150,105,0.28)' : 'none',
                }}>
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mode === 'register' && (
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6, display: 'block', fontWeight: 600 }}>Full name</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Shriya Shetty" required />
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6, display: 'block', fontWeight: 600 }}>Email</label>
                <input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6, display: 'block', fontWeight: 600 }}>Password</label>
                <input className="input-field" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
              </div>

              {err && (
                <div style={{ background: 'var(--rose2)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--rose)' }}>
                  {err}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading}
                style={{ width: '100%', marginTop: 8, padding: '14px', fontSize: 15, opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Please wait...
                  </span>
                ) : mode === 'login' ? 'Sign in →' : 'Create account →'}
              </button>
            </form>

            <p style={{ fontSize: 11, color: 'var(--faint)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
              Income − Savings = Your Margin
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
