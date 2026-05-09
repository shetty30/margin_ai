import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api/client'

const features = [
  { icon: '⚡', label: 'SMS auto-import', desc: 'UPI transactions logged instantly' },
  { icon: '◎', label: 'AI categorisation', desc: 'Every expense tagged automatically' },
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
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#131313',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient blobs */}
      <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(207,240,8,0.07),transparent)', top: '-100px', left: '-100px' }} />
      <div className="orb" style={{ width: 350, height: 350, background: 'radial-gradient(circle,rgba(207,240,8,0.05),transparent)', bottom: '-80px', right: '30%' }} />

      {/* ── Left panel ──────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 72px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)',
          transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: '#CFF008',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 28px rgba(207,240,8,0.28)',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 17L9 9L13 13L20 5" stroke="#131313" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="5" r="2.5" fill="#131313"/>
              </svg>
            </div>
            <div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>margin</span>
              <span style={{ fontSize: 11, marginLeft: 8, padding: '2px 8px', borderRadius: 6, background: 'rgba(207,240,8,0.14)', color: '#CFF008', fontWeight: 700, letterSpacing: '0.5px' }}>AI</span>
            </div>
          </div>

          <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.0, letterSpacing: '-2.5px', marginBottom: 16, color: '#fff' }}>
            Know your<br/>
            <span style={{ color: '#CFF008' }}>margin.</span>
          </h1>
          <p style={{ fontSize: 17, color: '#8F8F8F', marginBottom: 56, lineHeight: 1.65, maxWidth: 380 }}>
            Income − Savings = what you're allowed<br/>to spend. Nothing more.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {features.map((f, i) => (
              <div key={f.label} style={{
                opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateX(-12px)',
                transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${200 + i * 80}ms`,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: 'rgba(207,240,8,0.08)',
                  border: '1px solid rgba(207,240,8,0.16)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#CFF008', fontSize: 15, flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: '#8F8F8F' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel / form ───────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 460,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: '100%',
          opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)',
          transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 200ms',
        }}>
          <div style={{
            background: '#1C1C1C',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 28,
            padding: 36,
            boxShadow: '0 24px 80px rgba(0,0,0,0.50)',
          }}>
            {/* Tab toggle */}
            <div style={{ display: 'flex', gap: 4, padding: 4, background: '#242424', borderRadius: 16, marginBottom: 32 }}>
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => { setMode(m); setErr('') }} style={{
                  flex: 1, padding: '11px 0', borderRadius: 12,
                  fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                  border: 'none', cursor: 'pointer', letterSpacing: '0.2px',
                  background: mode === m ? '#CFF008' : 'transparent',
                  color: mode === m ? '#131313' : '#8F8F8F',
                  boxShadow: mode === m ? '0 4px 16px rgba(207,240,8,0.25)' : 'none',
                }}>
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'register' && (
                <div>
                  <label style={{ fontSize: 11, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 7, display: 'block', fontWeight: 700 }}>Full name</label>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 7, display: 'block', fontWeight: 700 }}>Email</label>
                <input
                  className="input-field"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 7, display: 'block', fontWeight: 700 }}>Password</label>
                <input
                  className="input-field"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              {err && (
                <div style={{
                  background: 'rgba(255,77,77,0.10)',
                  border: '1px solid rgba(255,77,77,0.20)',
                  borderRadius: 12, padding: '10px 14px',
                  fontSize: 13, fontWeight: 500, color: '#FF4D4D',
                }}>
                  {err}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: 8, padding: '15px', fontSize: 15, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 15, height: 15, border: '2px solid rgba(19,19,19,0.3)', borderTopColor: '#131313', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Please wait...
                  </span>
                ) : mode === 'login' ? 'Sign in →' : 'Create account →'}
              </button>
            </form>

            <p style={{ fontSize: 11, color: '#5A5A5A', textAlign: 'center', marginTop: 22, letterSpacing: '0.3px' }}>
              Income − Savings = Your Margin
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
