import React, { useState, useRef, useEffect } from 'react'
import { ai } from '../api/client'

const QUICK = [
  'Where did my salary go this month?',
  'Am I saving enough for my goals?',
  'What is my biggest spending problem?',
  'Can I afford a ₹20K trip next month?',
]

export default function Chat() {
  const [msgs, setMsgs] = useState([{
    role: 'ai',
    text: "Hey! Your financial data is loaded. Ask me anything about your money — I'll answer from your actual numbers, not generic advice.",
  }])
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
      setMsgs(m => [...m, { role: 'ai', text: 'AI unavailable. Check your GEMINI_API_KEY in .env and restart the backend.' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#131313', position: 'relative' }}>

      {/* Header */}
      <div style={{ padding: '26px 28px 18px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#CFF008', animation: 'blink 2s ease-in-out infinite', boxShadow: '0 0 6px rgba(207,240,8,0.50)' }} />
          <span style={{ fontSize: 11, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Context loaded · Live data</span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-1px', color: '#fff' }}>AI Chat</h1>
      </div>

      {/* Quick chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 28px', flexShrink: 0 }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} style={{
            fontSize: 12, padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
            background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.08)',
            color: '#8F8F8F', transition: 'all 0.2s', fontWeight: 600,
            fontFamily: 'Urbanist, sans-serif',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(207,240,8,0.30)'; e.currentTarget.style.color = '#CFF008'; e.currentTarget.style.background = 'rgba(207,240,8,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#8F8F8F'; e.currentTarget.style.background = '#1C1C1C' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 28px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {msgs.map((m, i) => (
          <div key={i} className="fade-up" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', animationDelay: `${i * 30}ms` }}>
            {m.role === 'ai' && (
              <div style={{
                width: 30, height: 30, borderRadius: 10,
                background: '#CFF008',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginRight: 10, marginTop: 4, flexShrink: 0,
                boxShadow: '0 2px 10px rgba(207,240,8,0.25)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M4 17L9 9L13 13L20 5" stroke="#131313" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <div style={{
              maxWidth: '72%', padding: '13px 17px',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              fontSize: 13, lineHeight: 1.70, fontWeight: 500,
              background: m.role === 'user' ? '#CFF008' : '#1C1C1C',
              border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: m.role === 'user' ? '#131313' : '#fff',
              boxShadow: m.role === 'user'
                ? '0 4px 20px rgba(207,240,8,0.25)'
                : '0 2px 8px rgba(0,0,0,0.20)',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: '#CFF008', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 17L9 9L13 13L20 5" stroke="#131313" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px', padding: '13px 17px' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#CFF008', animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottom} style={{ height: 4 }} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 28px 26px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '8px 8px 8px 18px',
          transition: 'border-color 0.2s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(207,240,8,0.30)'}
          onBlurCapture={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
          <input
            ref={inputRef}
            value={inp} onChange={e => setInp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything about your finances..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              fontSize: 14, color: '#fff', lineHeight: 1.5, outline: 'none',
              fontFamily: 'Urbanist, sans-serif', fontWeight: 500,
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !inp.trim()}
            className="btn-primary"
            style={{ padding: '11px 18px', fontSize: 13, opacity: (loading || !inp.trim()) ? 0.4 : 1, borderRadius: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M12 5l7 7-7 7" stroke="#131313" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

    </div>
  )
}
