import React, { useState, useRef, useEffect } from 'react'
import { ai } from '../api/client'

const QUICK = [
  'Where did my salary go this month?',
  'Am I saving enough for my goals?',
  'What is my biggest spending problem?',
  'Can I afford a ₹20K trip next month?',
]

export default function Chat() {
  const [msgs,    setMsgs]    = useState([{ role: 'ai', text: "Hey! Your financial data is loaded. Ask me anything about your money — I'll answer from your actual numbers, not generic advice." }])
  const [inp,     setInp]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottom   = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = async (text) => {
    const msg = text || inp.trim()
    if (!msg || loading) return
    setInp('')
    setMsgs(m => [...m, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const { data } = await ai.chat(msg)
      setMsgs(m => [...m, { role: 'ai', text: data.reply }])
    } catch {
      setMsgs(m => [...m, { role: 'ai', text: 'AI unavailable. Check GEMINI_API_KEY in .env and restart backend.' }])
    } finally { setLoading(false); inputRef.current?.focus() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F4F2FF' }}>

      {/* Header */}
      <div style={{ padding: '24px 28px 16px', flexShrink: 0, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 17L9 9L13 13L20 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: '#18181B', letterSpacing: '-0.5px' }}>AI Chat</h1>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', animation: 'blink 2s ease-in-out infinite', boxShadow: '0 0 5px rgba(16,185,129,0.50)' }} />
            </div>
            <p style={{ fontSize: 12, color: '#A1A1AA', fontWeight: 500 }}>Context loaded · Live financial data</p>
          </div>
        </div>
      </div>

      {/* Quick chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 28px', flexShrink: 0 }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} style={{
            fontSize: 12, padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
            background: '#fff', border: '1px solid rgba(0,0,0,0.08)', color: '#71717A',
            fontWeight: 600, fontFamily: 'Urbanist,sans-serif', transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(124,58,237,0.35)'; e.currentTarget.style.color='#7C3AED'; e.currentTarget.style.background='rgba(124,58,237,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(0,0,0,0.08)'; e.currentTarget.style.color='#71717A'; e.currentTarget.style.background='#fff' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 28px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {msgs.map((m, i) => (
          <div key={i} className="fade-up" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', animationDelay: `${i * 20}ms` }}>
            {m.role === 'ai' && (
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 4, flexShrink: 0, boxShadow: '0 3px 10px rgba(124,58,237,0.22)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 17L9 9L13 13L20 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
            <div style={{
              maxWidth: '72%', padding: '13px 17px',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              fontSize: 14, lineHeight: 1.65, fontWeight: 500,
              background: m.role === 'user' ? '#7C3AED' : '#fff',
              border: m.role === 'user' ? 'none' : '1px solid rgba(0,0,0,0.07)',
              color: m.role === 'user' ? '#fff' : '#18181B',
              boxShadow: m.role === 'user' ? '0 4px 16px rgba(124,58,237,0.28)' : '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 17L9 9L13 13L20 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '18px 18px 18px 4px', padding: '14px 18px' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#A78BFA', animation: `blink 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottom} style={{ height: 4 }} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 28px 24px', flexShrink: 0, background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#F4F2FF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '8px 8px 8px 18px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
          onFocusCapture={e => { e.currentTarget.style.borderColor='rgba(124,58,237,0.40)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(124,58,237,0.08)' }}
          onBlurCapture={e  => { e.currentTarget.style.borderColor='rgba(0,0,0,0.08)'; e.currentTarget.style.boxShadow='none' }}>
          <input ref={inputRef} value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything about your finances…"
            style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 14, color: '#18181B', lineHeight: 1.5, outline: 'none', fontFamily: 'Urbanist,sans-serif', fontWeight: 500 }} />
          <button onClick={() => send()} disabled={loading || !inp.trim()} className="btn-primary"
            style={{ padding: '11px 18px', fontSize: 13, opacity: (loading || !inp.trim()) ? 0.4 : 1, borderRadius: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
