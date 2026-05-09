import React, { useState, useEffect } from 'react'
import { goals as goalsApi, ai } from '../api/client'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')
const COLORS = ['#CFF008', '#22D3EE', '#A78BFA', '#F59E0B', '#FF4D4D']

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
    <div style={{ padding: 28, maxWidth: 800 }}>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, fontWeight: 700 }}>{data.length} active goals</p>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1.5px', color: '#fff' }}>Goals</h1>
      </div>

      {/* Goals grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
        {data.map((g, i) => {
          const pct   = Math.min(g.pct, 100)
          const color = COLORS[i % COLORS.length]
          return (
            <div key={g.id} className="card fade-up" style={{ padding: 22, animationDelay: `${i * 60}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{g.emoji} {g.title}</p>
                  <p style={{ fontSize: 11, color: '#8F8F8F', fontWeight: 500 }}>{fmt(g.target)} · {g.deadline}</p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 900, color }}>{Math.round(pct)}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', background: color, borderRadius: 2, width: `${pct}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s', boxShadow: `0 0 8px ${color}60` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8F8F8F', fontWeight: 600 }}>
                <span>{fmt(g.saved)} saved</span>
                <span style={{ color: pct >= 100 ? '#CFF008' : pct >= 50 ? color : '#5A5A5A' }}>
                  {g.status === 'completed' ? '✓ Done' : pct >= 80 ? 'Almost there!' : 'In progress'}
                </span>
              </div>
            </div>
          )
        })}
        {data.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: '#5A5A5A', fontSize: 14, fontWeight: 600, gridColumn: 'span 2' }}>
            No goals yet — add your first savings goal
          </div>
        )}
      </div>

      {/* Afford calculator */}
      <div className="fade-up card" style={{ padding: 28, animationDelay: '200ms', border: '1px solid rgba(207,240,8,0.16)', background: 'rgba(207,240,8,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CFF008', animation: 'blink 2s ease-in-out infinite', boxShadow: '0 0 6px rgba(207,240,8,0.50)' }} />
          <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>Can I afford this?</p>
        </div>
        <p style={{ fontSize: 13, color: '#8F8F8F', marginBottom: 20, fontWeight: 500 }}>AI checks your budget, goals, and upcoming bills</p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input
            value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ask()}
            placeholder="e.g. Can I afford a ₹20K Goa trip next month?"
            style={{
              flex: 1, padding: '13px 16px',
              background: '#242424', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, fontSize: 14, color: '#fff',
              fontFamily: 'Urbanist, sans-serif', outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.40)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
          <button className="btn-primary" onClick={ask} disabled={loading}
            style={{ padding: '13px 22px', whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1, fontSize: 14 }}>
            {loading ? '...' : 'Ask AI'}
          </button>
        </div>

        {result && (
          <div className="scale-in" style={{
            background: result.verdict === 'yes' ? 'rgba(207,240,8,0.06)' : 'rgba(255,77,77,0.06)',
            border: `1px solid ${result.verdict === 'yes' ? 'rgba(207,240,8,0.22)' : 'rgba(255,77,77,0.22)'}`,
            borderRadius: 14, padding: '16px 18px',
          }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: result.verdict === 'yes' ? '#CFF008' : '#FF4D4D', marginBottom: 8 }}>{result.headline}</p>
            <p style={{ fontSize: 13, color: '#8F8F8F', lineHeight: 1.7, fontWeight: 500 }}>{result.reasoning}</p>
            {result.tradeoff && <p style={{ fontSize: 12, color: '#5A5A5A', marginTop: 8 }}>{result.tradeoff}</p>}
          </div>
        )}
      </div>

    </div>
  )
}
