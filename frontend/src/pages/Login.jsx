import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api/client'

const features = [
  { icon: '⚡', label: 'SMS auto-import',   desc: 'UPI transactions logged instantly'    },
  { icon: '🤖', label: 'AI categorisation', desc: 'Every expense tagged automatically'   },
  { icon: '💡', label: 'Can I afford this?', desc: 'Real answers from your actual data'  },
]

export default function Login() {
  const [mode,    setMode]    = useState('login')
  const [form,    setForm]    = useState({ name: '', email: '', password: '' })
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const nav = useNavigate()

  useEffect(() => { setTimeout(() => setMounted(true), 60) }, [])

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const fn = mode === 'login' ? auth.login : auth.register
      const { data } = await fn(form)
      localStorage.setItem('margin_token', data.access_token)
      localStorage.setItem('margin_user', JSON.stringify(data.user))
      nav(data.user.onboarded ? '/' : '/onboarding')
    } catch (e) { setErr(e.response?.data?.detail || 'Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F4F2FF', position: 'relative', overflow: 'hidden' }}>
      {/* Orbs */}
      <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(124,58,237,0.12),transparent)', top: -120, left: -80 }} />
      <div className="orb" style={{ width: 350, height: 350, background: 'radial-gradient(circle,rgba(167,139,250,0.10),transparent)', bottom: -60, right: '35%' }} />

      {/* ── Left panel ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 72px', position: 'relative', zIndex: 1 }}>
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(14px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(124,58,237,0.30)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 17L9 9L13 13L20 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="5" r="2.5" fill="#fff"/>
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#18181B', letterSpacing: '-0.5px' }}>margin</span>
              <span style={{ fontSize: 11, marginLeft: 8, padding: '2px 8px', borderRadius: 6, background: 'rgba(124,58,237,0.12)', color: '#7C3AED', fontWeight: 700 }}>AI</span>
            </div>
          </div>

          <h1 style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2.5px', marginBottom: 16, color: '#18181B' }}>
            Know your<br/><span className="gradient-text">margin.</span>
          </h1>
          <p style={{ fontSize: 17, color: '#71717A', marginBottom: 52, lineHeight: 1.65, maxWidth: 380 }}>
            Income − Savings = what you're allowed<br/>to spend. Nothing more.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {features.map((f, i) => (
              <div key={f.label} style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateX(-12px)', transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${200 + i * 80}ms`, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', border: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, boxShadow: '0 2px 8px rgba(124,58,237,0.08)' }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#18181B', marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: '#71717A' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel / form ─────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: 460, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(14px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 150ms' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 28, padding: 36, boxShadow: '0 20px 60px rgba(124,58,237,0.10)' }}>

            {/* Tab toggle */}
            <div style={{ display: 'flex', gap: 4, padding: 4, background: '#F4F2FF', borderRadius: 16, marginBottom: 30 }}>
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => { setMode(m); setErr('') }} style={{
                  flex: 1, padding: '11px 0', borderRadius: 12, fontSize: 13, fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Urbanist, sans-serif',
                  background: mode === m ? '#7C3AED' : 'transparent',
                  color: mode === m ? '#fff' : '#71717A',
                  boxShadow: mode === m ? '0 4px 14px rgba(124,58,237,0.28)' : 'none',
                }}>
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'register' && (
                <div>
                  <label style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 7, display: 'block', fontWeight: 700 }}>Full name</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 7, display: 'block', fontWeight: 700 }}>Email</label>
                <input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 7, display: 'block', fontWeight: 700 }}>Password</label>
                <input className="input-field" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
              </div>

              {err && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#EF4444' }}>
                  {err}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: 6, padding: '15px', fontSize: 15 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Please wait...
                  </span>
                ) : mode === 'login' ? 'Sign in →' : 'Create account →'}
              </button>
            </form>

            <p style={{ fontSize: 11, color: '#A1A1AA', textAlign: 'center', marginTop: 22, letterSpacing: '0.3px' }}>
              Income − Savings = Your Margin
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
