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
    text: "Hey! Your financial data is loaded. Ask me anything about your money — I'll answer from your actual numbers, not generic advice."
  }])
  const [inp, setInp] = useState('')
  const [loading, setLoading] = useState(false)
  const bottom = useRef(null)
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F6FAF8', position: 'relative' }}>
      <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(5,150,105,0.06),transparent)', top: -100, right: -50, pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ padding: '24px 28px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', animation: 'blink 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Context loaded · Live data</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.8px' }}>AI Chat</h1>
      </div>

      {/* Quick chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 28px 16px', flexShrink: 0 }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} style={{
            fontSize: 12, padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
            background: '#fff', border: '1px solid var(--rim)',
            color: 'var(--muted)', transition: 'all 0.2s', fontWeight: 500,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(5,150,105,0.35)'; e.currentTarget.style.color = '#059669'; e.currentTarget.style.background = 'rgba(5,150,105,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--rim)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = '#fff' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} className="fade-up" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', animationDelay: `${i * 30}ms` }}>
            {m.role === 'ai' && (
              <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg,#059669,#0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 4, flexShrink: 0, boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}>
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M3 14L7 8L11 11L17 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
            <div style={{
              maxWidth: '72%', padding: '12px 16px',
              borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              fontSize: 13, lineHeight: 1.65,
              background: m.role === 'user'
                ? 'linear-gradient(135deg,#059669,#0D9488)'
                : '#fff',
              border: m.role === 'user' ? 'none' : '1px solid var(--rim)',
              color: m.role === 'user' ? '#fff' : 'var(--text)',
              boxShadow: m.role === 'user'
                ? '0 4px 20px rgba(5,150,105,0.28)'
                : '0 2px 8px rgba(0,0,0,0.04)',
              fontWeight: 500,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg,#059669,#0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M3 14L7 8L11 11L17 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ background: '#fff', border: '1px solid var(--rim)', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottom} style={{ height: 8 }} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 28px 24px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          background: '#fff', border: '1px solid var(--rim)',
          borderRadius: 14, padding: '8px 8px 8px 16px',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <input ref={inputRef} value={inp} onChange={e => setInp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything about your finances..."
            style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 14, color: 'var(--text)', lineHeight: 1.5, outline: 'none' }} />
          <button onClick={() => send()} disabled={loading || !inp.trim()} className="btn-primary"
            style={{ padding: '10px 18px', fontSize: 13, opacity: (loading || !inp.trim()) ? 0.4 : 1, borderRadius: 10 }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 10h14M10 3l7 7-7 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
