import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api/client'

/* ── Decorative SVG panels ───────────────────────────────────────── */
const LeftDecor = () => (
  <svg width="340" height="520" viewBox="0 0 340 520" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', userSelect: 'none' }}>
    {/* Wavy lines */}
    <path d="M20 120 Q 60 90 100 120 Q 140 150 180 120 Q 220 90 260 120" stroke="rgba(124,58,237,0.18)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M10 145 Q 50 115 90 145 Q 130 175 170 145 Q 210 115 250 145" stroke="rgba(124,58,237,0.10)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Abstract rectangle cluster */}
    <rect x="30" y="200" width="80" height="100" rx="8" stroke="rgba(124,58,237,0.20)" strokeWidth="1.5" fill="none"/>
    <rect x="50" y="220" width="80" height="100" rx="8" stroke="rgba(124,58,237,0.12)" strokeWidth="1.5" fill="none"/>
    <rect x="38" y="210" width="80" height="100" rx="8" fill="rgba(124,58,237,0.05)" stroke="none"/>
    {/* Dotted grid */}
    {[0,1,2,3,4].map(row => [0,1,2,3].map(col => (
      <circle key={`${row}-${col}`} cx={160 + col * 18} cy={360 + row * 18} r="2" fill="rgba(124,58,237,0.18)"/>
    )))}
    {/* Large faint circle */}
    <circle cx="60" cy="420" r="55" stroke="rgba(124,58,237,0.10)" strokeWidth="1.5" fill="none"/>
    <circle cx="60" cy="420" r="35" stroke="rgba(124,58,237,0.07)" strokeWidth="1.5" fill="none"/>
    {/* Small accent dots */}
    <circle cx="220" cy="80" r="4" fill="rgba(124,58,237,0.20)"/>
    <circle cx="240" cy="72" r="2.5" fill="rgba(124,58,237,0.14)"/>
    <circle cx="200" cy="88" r="2.5" fill="rgba(124,58,237,0.14)"/>
    {/* Corner squiggle */}
    <path d="M280 460 C 290 440 310 450 300 430 C 290 410 315 420 310 400" stroke="rgba(124,58,237,0.16)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Small outlined rectangle */}
    <rect x="220" y="300" width="46" height="38" rx="6" stroke="rgba(124,58,237,0.18)" strokeWidth="1.5" fill="none"/>
    <line x1="228" y1="314" x2="258" y2="314" stroke="rgba(124,58,237,0.18)" strokeWidth="1.2"/>
    <line x1="228" y1="322" x2="250" y2="322" stroke="rgba(124,58,237,0.12)" strokeWidth="1.2"/>
  </svg>
)

const RightDecor = () => (
  <svg width="340" height="520" viewBox="0 0 340 520" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', userSelect: 'none' }}>
    {/* Person sitting on box illustration */}
    {/* Box/platform */}
    <rect x="180" y="310" width="110" height="72" rx="8" fill="rgba(124,58,237,0.07)" stroke="rgba(124,58,237,0.18)" strokeWidth="1.5"/>
    <rect x="196" y="326" width="30" height="24" rx="4" fill="rgba(124,58,237,0.12)" stroke="rgba(124,58,237,0.20)" strokeWidth="1.2"/>
    {/* Laptop on lap */}
    <rect x="210" y="262" width="66" height="42" rx="5" fill="rgba(124,58,237,0.06)" stroke="rgba(124,58,237,0.22)" strokeWidth="1.5"/>
    <rect x="214" y="266" width="58" height="30" rx="3" fill="rgba(124,58,237,0.10)" stroke="none"/>
    <line x1="204" y1="304" x2="282" y2="304" stroke="rgba(124,58,237,0.22)" strokeWidth="1.5"/>
    {/* Person body */}
    <path d="M238 260 C 238 248 252 242 258 250 C 264 258 268 270 260 278 C 252 286 240 280 238 268 Z" fill="rgba(124,58,237,0.10)" stroke="rgba(124,58,237,0.22)" strokeWidth="1.3"/>
    {/* Head */}
    <circle cx="255" cy="236" r="20" fill="rgba(124,58,237,0.07)" stroke="rgba(124,58,237,0.22)" strokeWidth="1.5"/>
    {/* Hair */}
    <path d="M236 228 C 236 216 244 208 255 208 C 266 208 274 216 274 228" fill="rgba(124,58,237,0.16)" stroke="none"/>
    <path d="M274 228 C 276 234 278 240 272 244" stroke="rgba(124,58,237,0.22)" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    {/* Legs */}
    <path d="M244 278 L 238 312 L 228 312" stroke="rgba(124,58,237,0.20)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M262 278 L 268 312 L 282 312" stroke="rgba(124,58,237,0.20)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Arm to laptop */}
    <path d="M240 262 C 228 264 218 268 216 275" stroke="rgba(124,58,237,0.20)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

    {/* Wavy lines top right */}
    <path d="M60 100 Q 100 70 140 100 Q 180 130 220 100 Q 260 70 300 100" stroke="rgba(124,58,237,0.16)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M70 122 Q 110 92 150 122 Q 190 152 230 122" stroke="rgba(124,58,237,0.10)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

    {/* Dotted grid bottom left */}
    {[0,1,2,3,4].map(row => [0,1,2,3].map(col => (
      <circle key={`r${row}c${col}`} cx={18 + col * 18} cy={360 + row * 18} r="2" fill="rgba(124,58,237,0.18)"/>
    )))}

    {/* Abstract rect cluster top */}
    <rect x="30" y="160" width="72" height="90" rx="8" stroke="rgba(124,58,237,0.18)" strokeWidth="1.5" fill="none"/>
    <rect x="44" y="174" width="72" height="90" rx="8" fill="rgba(124,58,237,0.04)" stroke="rgba(124,58,237,0.10)" strokeWidth="1.5"/>

    {/* Accent dots */}
    <circle cx="110" cy="58" r="4" fill="rgba(124,58,237,0.22)"/>
    <circle cx="124" cy="50" r="2.5" fill="rgba(124,58,237,0.14)"/>
    <circle cx="96" cy="66" r="2.5" fill="rgba(124,58,237,0.14)"/>

    {/* Squiggle bottom */}
    <path d="M50 460 C 60 440 80 450 70 430 C 60 410 82 420 78 400" stroke="rgba(124,58,237,0.16)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

    {/* Small chart bars — finance motif */}
    <rect x="290" y="380" width="12" height="30" rx="3" fill="rgba(124,58,237,0.14)" stroke="rgba(124,58,237,0.20)" strokeWidth="1"/>
    <rect x="306" y="368" width="12" height="42" rx="3" fill="rgba(124,58,237,0.20)" stroke="rgba(124,58,237,0.25)" strokeWidth="1"/>
    <rect x="322" y="374" width="12" height="36" rx="3" fill="rgba(124,58,237,0.14)" stroke="rgba(124,58,237,0.20)" strokeWidth="1"/>
    <line x1="288" y1="412" x2="336" y2="412" stroke="rgba(124,58,237,0.20)" strokeWidth="1.2"/>
  </svg>
)

/* ── Feature icon SVGs (no emojis) ──────────────────────────────── */
const IconSMS = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M8 9h8M8 13h5M5 3h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconAI = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L13.4 8.6L20 10L13.4 11.4L12 18L10.6 11.4L4 10L10.6 8.6L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const features = [
  { Icon: IconSMS,   label: 'SMS auto-import',   desc: 'UPI transactions logged instantly'   },
  { Icon: IconAI,    label: 'AI categorisation',  desc: 'Every expense tagged automatically'  },
  { Icon: IconChart, label: 'Spending insights',  desc: 'Real answers from your actual data'  },
]

/* ── Main component ─────────────────────────────────────────────── */
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#EEE9FF',
      position: 'relative',
      overflow: 'hidden',
      padding: '32px 16px',
    }}>

      {/* Subtle radial glow behind card */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

      {/* Decorative panels */}
      <LeftDecor />
      <RightDecor />

      {/* ── Logo above card ─────────────────────────────────── */}
      <div style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(-10px)',
        transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, position: 'relative', zIndex: 10,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(124,58,237,0.30)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 17L9 9L13 13L20 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="20" cy="5" r="2.5" fill="#fff"/>
          </svg>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#18181B', letterSpacing: '-1px' }}>margin</span>
          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(124,58,237,0.14)', color: '#7C3AED', fontWeight: 800, letterSpacing: '0.5px' }}>AI</span>
        </div>
      </div>

      {/* ── Auth card ───────────────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 440,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(16px)',
        transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 80ms',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 28,
          padding: '36px 38px',
          boxShadow: '0 24px 64px rgba(124,58,237,0.13), 0 2px 12px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#18181B', letterSpacing: '-0.8px', marginBottom: 8 }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p style={{ fontSize: 14, color: '#71717A', fontWeight: 500 }}>
              {mode === 'login'
                ? 'Enter your details to access your dashboard'
                : 'Start tracking your margin today'}
            </p>
          </div>

          {/* Tab toggle */}
          <div style={{ display: 'flex', gap: 4, padding: 4, background: '#F0EEFF', borderRadius: 16, marginBottom: 28 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setErr('') }} style={{
                flex: 1, padding: '11px 0', borderRadius: 12, fontSize: 13, fontWeight: 700,
                border: 'none', cursor: 'pointer', transition: 'all 0.22s', fontFamily: 'Urbanist, sans-serif',
                background: mode === m ? '#7C3AED' : 'transparent',
                color: mode === m ? '#fff' : '#71717A',
                boxShadow: mode === m ? '0 4px 14px rgba(124,58,237,0.28)' : 'none',
              }}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              {mode === 'login' && (
                <p style={{ fontSize: 12, color: '#A1A1AA', marginTop: 7, textAlign: 'right', cursor: 'pointer', fontWeight: 500 }}>
                  Having trouble signing in?
                </p>
              )}
            </div>

            {err && (
              <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#EF4444' }}>
                {err}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: 4, padding: '15px', fontSize: 15, borderRadius: 16 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Please wait...
                </span>
              ) : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {/* Footer tagline */}
          <p style={{ fontSize: 11, color: '#C4C4CC', textAlign: 'center', marginTop: 24, letterSpacing: '0.4px', fontWeight: 600 }}>
            Income − Savings = Your Margin
          </p>
        </div>
      </div>

      {/* ── Feature chips below card ─────────────────────────── */}
      <div style={{
        display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(10px)',
        transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 220ms',
        position: 'relative', zIndex: 10,
      }}>
        {features.map(({ Icon, label, desc }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(124,58,237,0.14)',
            borderRadius: 40,
            padding: '8px 16px 8px 10px',
            boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(124,58,237,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', flexShrink: 0 }}>
              <Icon />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#18181B', lineHeight: 1.2 }}>{label}</div>
              <div style={{ fontSize: 11, color: '#71717A', lineHeight: 1.2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
