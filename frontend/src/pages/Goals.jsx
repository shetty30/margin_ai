// Goals.jsx
import React, { useState, useEffect } from 'react'
import { goals as goalsApi, ai } from '../api/client'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')
const COLORS = ['var(--violet)', 'var(--indigo)', 'var(--teal)', 'var(--amber)', 'var(--rose)']

export default function Goals() {
  const [data, setData] = useState([])
  const [q, setQ] = useState('')
  const [result, setResult] = useState(null)
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
    <div style={{ padding: 28, maxWidth: 800, position: 'relative' }}>
      <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(124,108,240,0.07),transparent)', top: -100, right: -50 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="fade-up" style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{data.length} active goals</p>
          <h1 className="syne" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px' }}>Goals</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
          {data.map((g, i) => {
            const pct = Math.min(g.pct, 100)
            const color = COLORS[i % COLORS.length]
            return (
              <div key={g.id} className="card fade-up" style={{ padding: 18, animationDelay: `${i * 60}ms` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{g.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)' }}>{fmt(g.target)} · {g.deadline}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color, fontFamily: 'Syne' }}>{Math.round(pct)}%</span>
                </div>
                <div style={{ height: 3, background: 'var(--glass2)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', background: color, borderRadius: 2, width: `${pct}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
                  <span>{fmt(g.saved)} saved</span>
                  <span style={{ color: pct >= 100 ? 'var(--teal)' : pct >= 50 ? color : 'var(--muted)' }}>
                    {g.status === 'completed' ? '✓ Done' : pct >= 80 ? 'Almost there' : 'In progress'}
                  </span>
                </div>
              </div>
            )
          })}
          {data.length === 0 && (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--faint)', fontSize: 13, gridColumn: 'span 2' }}>
              No goals yet — add your first savings goal
            </div>
          )}
        </div>

        {/* Afford calculator */}
        <div className="card fade-up" style={{ padding: 24, animationDelay: '200ms', border: '0.5px solid rgba(124,108,240,0.2)', background: 'rgba(124,108,240,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--violet)', animation: 'blink 2s ease-in-out infinite' }} />
            <p className="syne" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Can I afford this?</p>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>AI checks your budget, goals, and upcoming bills</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input className="input-field" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()}
              placeholder="e.g. Can I afford a ₹20K Goa trip next month?" style={{ flex: 1 }} />
            <button className="btn-primary" onClick={ask} disabled={loading} style={{ padding: '12px 20px', whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1 }}>
              {loading ? '...' : 'Ask AI'}
            </button>
          </div>
          {result && (
            <div className="scale-in" style={{
              background: result.verdict === 'yes' ? 'rgba(0,212,170,0.07)' : 'rgba(242,92,122,0.07)',
              border: `0.5px solid ${result.verdict === 'yes' ? 'rgba(0,212,170,0.25)' : 'rgba(242,92,122,0.25)'}`,
              borderRadius: 12, padding: '14px 16px'
            }}>
              <p className="syne" style={{ fontSize: 15, fontWeight: 600, color: result.verdict === 'yes' ? 'var(--teal)' : 'var(--rose)', marginBottom: 6 }}>{result.headline}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{result.reasoning}</p>
              {result.tradeoff && <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 6 }}>{result.tradeoff}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
