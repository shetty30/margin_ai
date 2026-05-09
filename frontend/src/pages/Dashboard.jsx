import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboard } from '../api/client'
import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis } from 'recharts'

const fmt = n => '₹' + Math.abs(Number(n)).toLocaleString('en-IN')

function AnimatedNumber({ value, duration = 1200, prefix = '₹' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!value && value !== 0) return
    const target = Number(value)
    const start  = performance.now()
    const step   = ts => {
      const p    = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setDisplay(Math.round(target * ease))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  return <span>{prefix}{display.toLocaleString('en-IN')}</span>
}

const CAT_STYLES = {
  'Food & Dining': { bg: '#7C3AED', light: '#EDE9FE', icon: '🍔' },
  'Transport':     { bg: '#2563EB', light: '#DBEAFE', icon: '🚖' },
  'Shopping':      { bg: '#DB2777', light: '#FCE7F3', icon: '🛒' },
  'Entertainment': { bg: '#059669', light: '#D1FAE5', icon: '🎮' },
  'Utilities':     { bg: '#D97706', light: '#FEF3C7', icon: '🏠' },
  'Health':        { bg: '#0891B2', light: '#CFFAFE', icon: '💊' },
  'Misc':          { bg: '#525252', light: '#F5F5F5', icon: '📦' },
}
const CAT_PALETTE = [
  { bg: '#7C3AED', light: '#EDE9FE', icon: '🛒' },
  { bg: '#2563EB', light: '#DBEAFE', icon: '🚗' },
  { bg: '#059669', light: '#D1FAE5', icon: '💳' },
  { bg: '#D97706', light: '#FEF3C7', icon: '🏠' },
]
const getCat = (name, i) => CAT_STYLES[name] || CAT_PALETTE[i % CAT_PALETTE.length]

const M_COLORS = ['#7C3AED','#2563EB','#059669','#D97706','#DB2777','#0891B2','#525252']
const merchantColor = str => {
  if (!str) return M_COLORS[0]
  let h = 0; for (const c of str) h = ((h << 5) - h) + c.charCodeAt(0)
  return M_COLORS[Math.abs(h) % M_COLORS.length]
}

const now = new Date()
const month = now.toLocaleString('default', { month: 'long', year: 'numeric' })

export default function Dashboard() {
  const [data,    setData]    = useState(null)
  const [err,     setErr]     = useState(false)
  const [visible, setVisible] = useState(false)
  const [showBal, setShowBal] = useState(true)

  useEffect(() => {
    dashboard.get(now.getFullYear(), now.getMonth() + 1)
      .then(r => { setData(r.data); setTimeout(() => setVisible(true), 80) })
      .catch(() => setErr(true))
  }, [])

  if (err) return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>⚠️</div>
      <p style={{ fontSize: 17, fontWeight: 700, color: '#18181B' }}>Dashboard unavailable</p>
      <p style={{ fontSize: 13, color: '#71717A', textAlign: 'center', maxWidth: 300 }}>The backend may be offline. Make sure START_APP.bat is running, then refresh.</p>
      <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding: '11px 28px', fontSize: 14 }}>Refresh page</button>
    </div>
  )

  if (!data) return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[180, 110, 110].map((h, i) => <div key={i} className="skeleton" style={{ height: h }} />)}
    </div>
  )

  const pct       = data.expense_budget > 0 ? Math.round((data.total_spent / data.expense_budget) * 100) : 0
  const remaining = data.expense_budget - data.total_spent
  const overBudget = remaining < 0

  return (
    <div style={{ padding: '28px 32px', maxWidth: 980 }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: '#A1A1AA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{month}</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#18181B', letterSpacing: '-1px' }}>Dashboard</h1>
        </div>
        <Link to="/transactions">
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
            Add Transaction
          </button>
        </Link>
      </div>

      {/* ── Top row: Balance hero + 3 stats ─────────────────── */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 14, marginBottom: 20, animationDelay: '40ms' }}>

        {/* Main balance card */}
        <div style={{
          background: 'linear-gradient(135deg,#7C3AED 0%,#A78BFA 100%)',
          borderRadius: 22, padding: '26px 24px', color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(124,58,237,0.28)',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.10)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 50, width: 100, height: 100, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Your Margin</p>
              <button onClick={() => setShowBal(v => !v)} style={{ background: 'rgba(255,255,255,0.20)', border: 'none', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                {showBal
                  ? <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="#fff" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" stroke="#fff" strokeWidth="1.5"/></svg>
                  : <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M3 3l14 14M9 4.1C9.3 4 9.7 4 10 4c3.5 0 6.5 2.5 8 6-.6 1.4-1.5 2.6-2.6 3.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                }
              </button>
            </div>
            <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 18 }}>
              {showBal ? <AnimatedNumber value={Math.abs(remaining)} prefix={overBudget ? '-₹' : '₹'} /> : '₹ ••••••'}
            </div>
            {/* Progress bar */}
            <div style={{ height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', background: '#fff', borderRadius: 2, width: visible ? `${Math.min(pct, 100)}%` : '0%', transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
              <span>{pct}% used</span>
              <span>{fmt(data.expense_budget)} budget</span>
            </div>
          </div>
        </div>

        {/* 3 stat cards */}
        {[
          { label: 'Monthly Income',  value: data.income,         color: '#7C3AED', icon: '💰', sub: 'take-home' },
          { label: 'Saved',           value: data.savings_target, color: '#059669', icon: '🏦', sub: `${data.savings_rate}% rate` },
          { label: 'Daily Average',   value: data.daily_avg,      color: data.daily_avg > (data.expense_budget / 30) ? '#EF4444' : '#2563EB', icon: '📅', sub: `of ${fmt(Math.round(data.expense_budget / 30))} limit` },
        ].map((s, i) => (
          <div key={s.label} className="card" style={{ padding: '20px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: '#A1A1AA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</p>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, color: s.color, letterSpacing: '-0.5px', marginBottom: 4 }}>
              <AnimatedNumber value={s.value} duration={1000} />
            </p>
            <p style={{ fontSize: 11, color: '#A1A1AA', fontWeight: 600 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Category spending cards ──────────────────────────── */}
      {data.by_category.length > 0 && (
        <div className="fade-up" style={{ marginBottom: 20, animationDelay: '100ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#18181B' }}>Spending breakdown</h2>
            <Link to="/transactions" style={{ fontSize: 12, color: '#7C3AED', textDecoration: 'none', fontWeight: 700 }}>See all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {data.by_category.slice(0, 4).map((cat, i) => {
              const pal    = getCat(cat.name, i)
              const catPct = data.total_spent > 0 ? Math.round(cat.total / data.total_spent * 100) : 0
              return (
                <div key={cat.name} className="card fade-up" style={{ padding: '20px 18px', animationDelay: `${120 + i * 50}ms` }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: pal.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>
                    {pal.icon}
                  </div>
                  <p style={{ fontSize: 12, color: '#71717A', fontWeight: 600, marginBottom: 6 }}>{cat.name}</p>
                  <p style={{ fontSize: 20, fontWeight: 900, color: pal.bg, letterSpacing: '-0.5px', marginBottom: 10 }}>{fmt(cat.total)}</p>
                  <div style={{ height: 4, background: '#F4F2FF', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: pal.bg, borderRadius: 2, width: `${catPct}%`, transition: 'width 1.2s ease 0.3s' }} />
                  </div>
                  <p style={{ fontSize: 11, color: '#A1A1AA', marginTop: 5, fontWeight: 600 }}>{catPct}% of spend</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Chart + Recent transactions ─────────────────────── */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 14, animationDelay: '180ms' }}>

        {/* Daily spend chart */}
        <div className="card" style={{ padding: '22px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#18181B' }}>Daily spending</h3>
            <span className="pill pill-violet">{now.toLocaleString('default', { month: 'short' })}</span>
          </div>
          {data.daily_spend.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={data.daily_spend} barSize={8} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {data.daily_spend.map((_, i) => (
                    <Cell key={i} fill={i === data.daily_spend.length - 1 ? '#7C3AED' : '#EDE9FE'} />
                  ))}
                </Bar>
                <Tooltip
                  formatter={v => [fmt(v), 'Spent']}
                  contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, fontSize: 12, color: '#18181B', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: 'rgba(124,58,237,0.05)' }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A1A1AA', fontSize: 13, flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 28 }}>📊</span>
              No transactions yet
            </div>
          )}

          {/* Top spend mini list */}
          {data.by_category.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {data.by_category.slice(0, 3).map((c, i) => {
                const pal  = getCat(c.name, i)
                const pBar = data.total_spent > 0 ? Math.min(c.total / data.total_spent * 100, 100) : 0
                return (
                  <div key={c.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: '#71717A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>{pal.icon} {c.name}</span>
                      <span style={{ color: '#18181B', fontWeight: 700 }}>{fmt(c.total)}</span>
                    </div>
                    <div style={{ height: 4, background: '#F4F2FF', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: pal.bg, borderRadius: 2, width: `${pBar}%`, transition: 'width 1.2s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card" style={{ padding: '22px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#18181B' }}>Recent transactions</h3>
            <Link to="/transactions" style={{ fontSize: 12, color: '#7C3AED', textDecoration: 'none', fontWeight: 700 }}>View all →</Link>
          </div>

          {data.recent_txns.length > 0 ? data.recent_txns.map((t, i) => {
            const col      = merchantColor(t.merchant)
            const initials = (t.merchant || '?').slice(0, 2).toUpperCase()
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 0',
                borderBottom: i < data.recent_txns.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                    background: col + '18', border: `1.5px solid ${col}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: col,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#18181B', marginBottom: 2 }}>{t.merchant || 'Unknown'}</p>
                    <p style={{ fontSize: 11, color: '#A1A1AA', fontWeight: 500 }}>{t.date}</p>
                  </div>
                </div>
                <p style={{ fontSize: 14, fontWeight: 800, color: t.amount > 0 ? '#059669' : '#18181B' }}>
                  {t.amount > 0 ? '+' : '−'}{fmt(t.amount)}
                </p>
              </div>
            )
          }) : (
            <div style={{ paddingTop: 32, textAlign: 'center', color: '#A1A1AA', fontSize: 13 }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>💳</p>
              No transactions yet
            </div>
          )}

          {data.recent_txns.length === 0 && (
            <div style={{ marginTop: 20 }}>
              <Link to="/transactions">
                <button className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 13 }}>
                  + Add your first transaction
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
