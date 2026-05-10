import React, { useState, useRef, useEffect } from 'react'
import { ai } from '../api/client'

const QUICK = [
  { label: 'Where did my salary go?', icon: '💸' },
  { label: 'Am I saving enough?',      icon: '🏦' },
  { label: 'Biggest spending problem?', icon: '📊' },
  { label: 'Can I afford a ₹20K trip?', icon: '✈️' },
]

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '4px 2px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
          animation: `blink 1.4s ease-in-out ${i * 0.22}s infinite`,
        }} />
      ))}
    </div>
  )
}

function Message({ m, isLast }) {
  const isAI = m.role === 'ai'
  const time  = m.ts ? new Date(m.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div className="fade-up" style={{
      display: 'flex',
      flexDirection: isAI ? 'row' : 'row-reverse',
      alignItems: 'flex-end',
      gap: 10,
      marginBottom: 4,
    }}>

      {/* Avatar */}
      {isAI && (
        <div style={{
          width: 34, height: 34, borderRadius: 11, flexShrink: 0,
          background: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(124,58,237,0.30)',
          marginBottom: 2,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M4 17L9 9L13 13L20 5" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="20" cy="5" r="1.8" fill="#fff"/>
          </svg>
        </div>
      )}

      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: isAI ? 'flex-start' : 'flex-end' }}>
        <div style={{
          padding: '13px 17px',
          borderRadius: isAI ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
          fontSize: 14, lineHeight: 1.70, fontWeight: 500,
          background: isAI
            ? 'rgba(255,255,255,0.85)'
            : 'linear-gradient(135deg,#7C3AED,#8B5CF6)',
          border: isAI ? '1px solid rgba(255,255,255,0.95)' : 'none',
          color: isAI ? '#18181B' : '#fff',
          boxShadow: isAI
            ? '0 4px 16px rgba(124,58,237,0.07), 0 1px 3px rgba(0,0,0,0.05)'
            : '0 6px 20px rgba(124,58,237,0.35)',
          backdropFilter: isAI ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: isAI ? 'blur(20px)' : 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {m.text}
        </div>
        {time && (
          <span style={{ fontSize: 10, color: '#A1A1AA', fontWeight: 600, paddingLeft: isAI ? 4 : 0, paddingRight: isAI ? 0 : 4 }}>
            {time}
          </span>
        )}
      </div>
    </div>
  )
}

export default function Chat() {
  const [msgs,    setMsgs]    = useState([{
    role: 'ai',
    text: "Hey! 👋 Your financial data is loaded and ready.\n\nAsk me anything about your spending, savings, or goals — I'll answer based on your actual numbers, not generic advice.",
    ts: Date.now(),
  }])
  const [inp,     setInp]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottom   = useRef(null)
  const inputRef = useRef(null)
  const areaRef  = useRef(null)

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  const send = async (text) => {
    const msg = text || inp.trim()
    if (!msg || loading) return
    setInp('')
    setMsgs(m => [...m, { role: 'user', text: msg, ts: Date.now() }])
    setLoading(true)
    try {
      const { data } = await ai.chat(msg)
      setMsgs(m => [...m, { role: 'ai', text: data.reply, ts: Date.now() }])
    } catch {
      setMsgs(m => [...m, { role: 'ai', text: 'AI unavailable. Please check your GEMINI_API_KEY and restart the backend.', ts: Date.now() }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(160deg, #F4F2FF 0%, #EDE9FE 100%)', position: 'relative' }}>

      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 100, left: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(167,139,250,0.07), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* ── Chat header ──────────────────────────────────────── */}
      <div style={{
        padding: '18px 24px 14px',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(124,58,237,0.10)',
        boxShadow: '0 2px 16px rgba(124,58,237,0.06)',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 15,
            background: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(124,58,237,0.30)',
            animation: 'pulse-ring 3s ease-in-out infinite',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 17L9 9L13 13L20 5" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="5" r="2" fill="#fff"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#18181B', letterSpacing: '-0.4px' }}>AI Finance Advisor</h1>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(16,185,129,0.10)',
                border: '1px solid rgba(16,185,129,0.20)',
                borderRadius: 20, padding: '3px 9px',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'blink 2.2s ease-in-out infinite', boxShadow: '0 0 6px rgba(16,185,129,0.60)' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '0.5px' }}>LIVE</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>Gemini 2.0 Flash · Your financial data loaded</p>
          </div>

          {/* Message count badge */}
          {msgs.length > 1 && (
            <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 20, padding: '4px 12px' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED' }}>{msgs.length - 1} msg{msgs.length !== 2 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick chips ───────────────────────────────────────── */}
      {msgs.length === 1 && (
        <div style={{ padding: '16px 24px 4px', flexShrink: 0 }}>
          <p style={{ fontSize: 11, color: '#A1A1AA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Try asking</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK.map(q => (
              <button key={q.label} onClick={() => send(q.label)} style={{
                fontSize: 12, padding: '8px 14px', borderRadius: 20, cursor: 'pointer',
                background: 'rgba(255,255,255,0.80)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.95)',
                color: '#52525B',
                fontWeight: 600, fontFamily: 'Urbanist,sans-serif',
                transition: 'all 0.20s cubic-bezier(0.16,1,0.3,1)',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.30)'
                  e.currentTarget.style.color = '#7C3AED'
                  e.currentTarget.style.background = 'rgba(124,58,237,0.06)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.14)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.95)'
                  e.currentTarget.style.color = '#52525B'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.80)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,58,237,0.06)'
                }}>
                <span>{q.icon}</span>
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages ─────────────────────────────────────────── */}
      <div ref={areaRef} style={{
        flex: 1, overflowY: 'auto', padding: '16px 24px 8px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {msgs.map((m, i) => (
          <Message key={i} m={m} isLast={i === msgs.length - 1} />
        ))}

        {loading && (
          <div className="fade-in" style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 11, flexShrink: 0,
              background: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124,58,237,0.25)',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M4 17L9 9L13 13L20 5" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="5" r="1.8" fill="#fff"/>
              </svg>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.95)',
              borderRadius: '18px 18px 18px 4px',
              padding: '13px 18px',
              boxShadow: '0 4px 16px rgba(124,58,237,0.07)',
            }}>
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottom} style={{ height: 8 }} />
      </div>

      {/* ── Input bar ────────────────────────────────────────── */}
      <div style={{
        padding: '12px 24px 20px', flexShrink: 0,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(124,58,237,0.08)',
      }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          background: 'rgba(255,255,255,0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(124,58,237,0.12)',
          borderRadius: 20, padding: '8px 8px 8px 18px',
          boxShadow: '0 4px 20px rgba(124,58,237,0.08)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.40)'
            e.currentTarget.style.boxShadow   = '0 4px 20px rgba(124,58,237,0.14), 0 0 0 4px rgba(124,58,237,0.06)'
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.12)'
            e.currentTarget.style.boxShadow   = '0 4px 20px rgba(124,58,237,0.08)'
          }}>

          {/* Sparkle icon */}
          <div style={{ color: '#A78BFA', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </div>

          <input
            ref={inputRef}
            value={inp}
            onChange={e => setInp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about your finances…"
            style={{
              flex: 1, background: 'transparent', border: 'none',
              fontSize: 14, color: '#18181B', lineHeight: 1.5,
              outline: 'none', fontFamily: 'Urbanist,sans-serif', fontWeight: 500,
            }}
          />

          <button
            onClick={() => send()}
            disabled={loading || !inp.trim()}
            className="btn-primary"
            style={{
              padding: '10px 16px', fontSize: 13,
              opacity: (loading || !inp.trim()) ? 0.40 : 1,
              borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.20s',
            }}>
            {loading
              ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Send
                </>
            }
          </button>
        </div>
        <p style={{ fontSize: 10, color: '#C4B5FD', textAlign: 'center', marginTop: 8, fontWeight: 600, letterSpacing: '0.2px' }}>
          AI responses are based on your personal financial data
        </p>
      </div>
    </div>
  )
}
