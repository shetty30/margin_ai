import React, { useState, useEffect } from 'react'
import { goals as goalsApi, ai } from '../api/client'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')
const COLORS = ['#7C3AED','#2563EB','#059669','#D97706','#EF4444']
const LIGHTS  = ['#EDE9FE','#DBEAFE','#D1FAE5','#FEF3C7','#FEE2E2']

export default function Goals() {
  const [data,    setData]    = useState([])
  const [q,       setQ]       = useState('')
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { goalsApi.list().then(r => setData(r.data)).catch(() => {}) }, [])

  const ask = async () => {
    if (!q.trim()) return
    setLoading(true); setResult(null)
    try { const { data } = await ai.afford(q); setResult(data) }
    catch { setResult({ verdict: 'unknown', headline: 'AI unavailable', reasoning: 'Check your GEMINI_API_KEY in .env', tradeoff: '' }) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>

      <div className="fade-up" style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, color: '#A1A1AA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{data.length} active</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#18181B', letterSpacing: '-1px' }}>Goals</h1>
      </div>

      {/* Goals grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 24 }}>
        {data.map((g, i) => {
          const pct   = Math.min(g.pct, 100)
          const color = COLORS[i % COLORS.length]
          const light = LIGHTS[i % LIGHTS.length]
          return (
            <div key={g.id} className="card fade-up" style={{ padding: 24, animationDelay: `${i * 60}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {g.emoji}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#18181B', marginBottom: 3 }}>{g.title}</p>
                    <p style={{ fontSize: 11, color: '#A1A1AA', fontWeight: 500 }}>Target: {fmt(g.target)} · Due {g.deadline}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color }}>{Math.round(pct)}%</span>
                </div>
              </div>

              <div style={{ height: 8, background: light, borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', background: color, borderRadius: 4, width: `${pct}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                <span style={{ color: '#71717A' }}>{fmt(g.saved)} saved</span>
                <span style={{ color: pct >= 100 ? '#059669' : pct >= 80 ? color : '#A1A1AA' }}>
                  {g.status === 'completed' ? '✓ Completed!' : pct >= 80 ? 'Almost there!' : `${fmt(g.target - g.saved)} left`}
                </span>
              </div>
            </div>
          )
        })}
        {data.length === 0 && (
          <div className="card" style={{ padding: 44, textAlign: 'center', gridColumn: 'span 2' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <p style={{ color: '#A1A1AA', fontSize: 14, fontWeight: 600 }}>No goals yet — add your first savings goal</p>
          </div>
        )}
      </div>

      {/* AI Afford calculator */}
      <div className="card fade-up" style={{ padding: 28, animationDelay: '200ms', border: '1px solid rgba(124,58,237,0.15)', background: 'linear-gradient(135deg,#FAF8FF,#F4F2FF)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2zm0 5v5l3 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#18181B' }}>Can I afford this?</h3>
            <p style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>AI checks your budget, goals, and upcoming bills</p>
          </div>
          <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'blink 2s ease-in-out infinite', boxShadow: '0 0 6px rgba(16,185,129,0.50)' }} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()}
            placeholder="e.g. Can I afford a ₹20K Goa trip next month?"
            style={{ flex: 1, padding: '13px 16px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, fontSize: 14, color: '#18181B', fontFamily: 'Urbanist,sans-serif', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
            onFocus={e => { e.target.style.borderColor='rgba(124,58,237,0.40)'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.08)' }}
            onBlur={e  => { e.target.style.borderColor='rgba(0,0,0,0.08)'; e.target.style.boxShadow='none' }} />
          <button className="btn-primary" onClick={ask} disabled={loading} style={{ padding: '13px 22px', whiteSpace: 'nowrap', fontSize: 14, opacity: loading ? 0.7 : 1 }}>
            {loading ? '…' : 'Ask AI'}
          </button>
        </div>

        {result && (
          <div className="scale-in" style={{
            marginTop: 16,
            background: result.verdict === 'yes' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${result.verdict === 'yes' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.20)'}`,
            borderRadius: 14, padding: '16px 18px',
          }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: result.verdict === 'yes' ? '#059669' : '#EF4444', marginBottom: 8 }}>{result.headline}</p>
            <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.7, fontWeight: 500 }}>{result.reasoning}</p>
            {result.tradeoff && <p style={{ fontSize: 12, color: '#A1A1AA', marginTop: 8 }}>{result.tradeoff}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
