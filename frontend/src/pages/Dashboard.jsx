import React, { useEffect, useState } from 'react'
import { dashboard } from '../api/client'
import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const fmt = n => '₹' + Math.abs(Number(n)).toLocaleString('en-IN')

function AnimatedNumber({ value, duration = 1200 }) {
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
  return <span>₹{display.toLocaleString('en-IN')}</span>
}

const CAT_STYLES = {
  'Food & Dining': { bg: '#6D28D9', icon: '🍔' },
  'Transport':     { bg: '#1D4ED8', icon: '🚖' },
  'Shopping':      { bg: '#BE185D', icon: '🛒' },
  'Entertainment': { bg: '#047857', icon: '🎮' },
  'Utilities':     { bg: '#C2410C', icon: '🏠' },
  'Health':        { bg: '#0E7490', icon: '💊' },
  'Misc':          { bg: '#334155', icon: '📦' },
}
const CAT_PALETTE = [
  { bg: '#6D28D9', icon: '🛒' },
  { bg: '#1D4ED8', icon: '🚗' },
  { bg: '#047857', icon: '💳' },
  { bg: '#C2410C', icon: '🏠' },
]
const getCatStyle = (name, i) => CAT_STYLES[name] || CAT_PALETTE[i % CAT_PALETTE.length]

const M_COLORS = ['#CFF008', '#22D3EE', '#F59E0B', '#FF4D4D', '#A78BFA', '#34D399', '#FB923C']
const merchantColor = str => {
  if (!str) return M_COLORS[0]
  let h = 0
  for (const c of str) h = ((h << 5) - h) + c.charCodeAt(0)
  return M_COLORS[Math.abs(h) % M_COLORS.length]
}

const ACTIONS = [
  { label: 'Add Transaction', href: '/transactions', icon: 'M12 5v14M5 12h14' },
  { label: 'Goals',           href: '/goals',        icon: 'M12 3v18M3 12h18' },
  { label: 'AI Chat',         href: '/chat',         icon: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H8l-4 3.5V6z' },
  { label: 'Profile',         href: '/profile',      icon: 'M12 8a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm-7 12c0-3.9 3.1-7 7-7s7 3.1 7 7' },
]

export default function Dashboard() {
  const [data,    setData]    = useState(null)
  const [err,     setErr]     = useState(false)
  const [visible, setVisible] = useState(false)
  const [showBal, setShowBal] = useState(true)
  const now = new Date()

  useEffect(() => {
    dashboard.get(now.getFullYear(), now.getMonth() + 1)
      .then(r => { setData(r.data); setTimeout(() => setVisible(true), 80) })
      .catch(() => setErr(true))
  }, [])

  if (err) return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Dashboard unavailable</p>
      <p style={{ fontSize: 13, color: '#8F8F8F', textAlign: 'center' }}>Backend may be offline. Make sure START_APP.bat is running.</p>
      <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>Refresh</button>
    </div>
  )

  if (!data) return (
    <div style={{ padding: 28 }}>
      {[240, 90, 90, 90].map((h, i) => (
        <div key={i} className="skeleton" style={{ height: h, borderRadius: 20, marginBottom: 12 }} />
      ))}
    </div>
  )

  const pct       = data.expense_budget > 0 ? Math.round((data.total_spent / data.expense_budget) * 100) : 0
  const remaining = data.expense_budget - data.total_spent
  const month     = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: 28, maxWidth: 960 }}>

      {/* ── Hero balance card ───────────────────────────────── */}
      <div className="fade-up" style={{
        background: '#1C1C1C',
        border: '1px solid rgba(207,240,8,0.20)',
        borderRadius: 24, padding: '32px 28px', marginBottom: 16,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 0 60px rgba(207,240,8,0.06)',
      }}>
        {/* Lime glow orb */}
        <div style={{ position: 'absolute', top: -80, right: -60, width: 280, height: 280, background: 'radial-gradient(circle,rgba(207,240,8,0.10),transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: 120, width: 180, height: 180, background: 'radial-gradient(circle,rgba(207,240,8,0.06),transparent)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: 12 }}>
            YOUR MARGIN · {month.toUpperCase()}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-2.5px', lineHeight: 1, color: '#CFF008' }}>
              {showBal ? <AnimatedNumber value={remaining} /> : '₹ ••••••'}
            </h1>
            <button onClick={() => setShowBal(v => !v)} style={{
              background: 'rgba(207,240,8,0.10)', border: '1px solid rgba(207,240,8,0.20)',
              borderRadius: 8, padding: '7px 9px', cursor: 'pointer', color: '#CFF008',
              display: 'flex', alignItems: 'center', transition: 'all 0.2s',
            }}>
              {showBal
                ? <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                : <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 3l14 14M11.4 11.4A2.5 2.5 0 017.6 7.6M6.2 6.2C4.2 7.2 2.8 8.8 2 10c1.5 3.5 4.5 6 8 6 1.5 0 2.9-.4 4.1-1.2M9 4.1C9.3 4 9.7 4 10 4c3.5 0 6.5 2.5 8 6-.6 1.4-1.5 2.6-2.6 3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              }
            </button>
          </div>

          <p style={{ fontSize: 13, color: '#5A5A5A', marginBottom: 24, fontWeight: 500 }}>
            {fmt(data.total_spent)} spent · {fmt(data.expense_budget)} budget · {pct}% used
          </p>

          <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', background: '#CFF008', borderRadius: 2, width: visible ? `${Math.min(pct, 100)}%` : '0%', transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 8px rgba(207,240,8,0.40)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#5A5A5A', fontWeight: 600 }}>{fmt(data.total_spent)} spent</span>
            <span style={{ fontSize: 11, color: '#5A5A5A', fontWeight: 600 }}>{fmt(data.expense_budget)} budget</span>
          </div>
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────────────── */}
      <div className="fade-up" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', animationDelay: '60ms' }}>
        {ACTIONS.map(a => (
          <a key={a.label} href={a.href} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
            borderRadius: 12, background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12, fontWeight: 700, color: '#8F8F8F',
            textDecoration: 'none', transition: 'all 0.2s',
            letterSpacing: '0.2px',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(207,240,8,0.30)'; e.currentTarget.style.color = '#CFF008'; e.currentTarget.style.background = 'rgba(207,240,8,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#8F8F8F'; e.currentTarget.style.background = '#1C1C1C' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={a.icon} />
            </svg>
            {a.label}
          </a>
        ))}
      </div>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Income',    value: data.income,         color: '#CFF008' },
          { label: 'Saved',     value: data.savings_target, color: '#22D3EE', sub: `${data.savings_rate}% savings rate` },
          { label: 'Daily avg', value: data.daily_avg,      color: data.daily_avg > (data.expense_budget / 30) ? '#FF4D4D' : '#CFF008', sub: `of ${fmt(Math.round(data.expense_budget / 30))} limit` },
        ].map((s, i) => (
          <div key={s.label} className="card fade-up" style={{ padding: '22px 20px', animationDelay: `${80 + i * 40}ms` }}>
            <p style={{ fontSize: 11, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, fontWeight: 700 }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: s.color, letterSpacing: '-0.5px' }}>
              <AnimatedNumber value={s.value} duration={1000} />
            </p>
            {s.sub && <p style={{ fontSize: 11, color: '#5A5A5A', marginTop: 4, fontWeight: 500 }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Category spending cards ──────────────────────────── */}
      {data.by_category.length > 0 && (
        <div className="fade-up" style={{ marginBottom: 16, animationDelay: '180ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Spending by category</p>
            <a href="/transactions" style={{ fontSize: 12, color: '#CFF008', textDecoration: 'none', fontWeight: 700 }}>See all →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
            {data.by_category.slice(0, 4).map((cat, i) => {
              const pal    = getCatStyle(cat.name, i)
              const catPct = data.total_spent > 0 ? Math.round(cat.total / data.total_spent * 100) : 0
              return (
                <div key={cat.name} className="fade-up" style={{
                  background: pal.bg, borderRadius: 20, padding: '22px 20px',
                  position: 'relative', overflow: 'hidden', color: '#fff',
                  animationDelay: `${200 + i * 60}ms`,
                  boxShadow: `0 8px 32px ${pal.bg}44`,
                }}>
                  <div style={{ position: 'absolute', top: -28, right: -28, width: 120, height: 120, background: 'rgba(255,255,255,0.10)', borderRadius: '50%', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {pal.icon}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{cat.name}</p>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 12 }}>{fmt(cat.total)}</p>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.20)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', background: 'rgba(255,255,255,0.80)', borderRadius: 2, width: `${catPct}%` }} />
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.60)', fontWeight: 600 }}>{catPct}% of total spend</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Chart + Top spend ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12, marginBottom: 16 }}>

        <div className="card fade-up" style={{ padding: '20px', animationDelay: '300ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Daily spend</p>
            <span className="pill pill-violet">{now.toLocaleString('default', { month: 'short' })}</span>
          </div>
          {data.daily_spend.length > 0 ? (
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={data.daily_spend} barSize={6} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Bar dataKey="total" radius={[3, 3, 0, 0]}>
                  {data.daily_spend.map((_, i) => (
                    <Cell key={i} fill={i === data.daily_spend.length - 1 ? '#CFF008' : 'rgba(207,240,8,0.18)'} />
                  ))}
                </Bar>
                <Tooltip
                  formatter={v => [fmt(v), 'Spent']}
                  contentStyle={{ background: '#242424', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12, color: '#fff' }}
                  cursor={{ fill: 'rgba(207,240,8,0.04)' }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A5A5A', fontSize: 13 }}>No transactions yet</div>
          )}
        </div>

        <div className="card fade-up" style={{ padding: '20px', animationDelay: '340ms' }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Top spend</p>
          {data.by_category.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data.by_category.slice(0, 4).map((c, i) => {
                const pal  = getCatStyle(c.name, i)
                const pBar = data.total_spent > 0 ? Math.min(c.total / data.total_spent * 100, 100) : 0
                return (
                  <div key={c.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5, alignItems: 'center' }}>
                      <span style={{ color: '#8F8F8F', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {pal.icon} {c.name.split(' ')[0]}
                      </span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{fmt(c.total)}</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: pal.bg, borderRadius: 2, width: `${pBar}%`, transition: 'width 1.2s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A5A5A', fontSize: 12 }}>No data yet</div>
          )}
        </div>
      </div>

      {/* ── Recent transactions ───────────────────────────────── */}
      <div className="card fade-up" style={{ padding: '20px', animationDelay: '380ms' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Latest transactions</p>
          <a href="/transactions" style={{ fontSize: 12, color: '#CFF008', textDecoration: 'none', fontWeight: 700 }}>See all →</a>
        </div>
        {data.recent_txns.length > 0 ? data.recent_txns.map((t, i) => {
          const col      = merchantColor(t.merchant)
          const initials = (t.merchant || '?').slice(0, 2).toUpperCase()
          return (
            <div key={i} className="slide-right" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 0',
              borderBottom: i < data.recent_txns.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              animationDelay: `${400 + i * 45}ms`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                  background: col + '22',
                  border: `1px solid ${col}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: col,
                }}>
                  {initials}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{t.merchant || 'Unknown'}</p>
                  <p style={{ fontSize: 11, color: '#5A5A5A', fontWeight: 500 }}>{t.date}</p>
                </div>
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: t.amount > 0 ? '#CFF008' : '#fff' }}>
                {t.amount > 0 ? '+' : '−'}{fmt(t.amount)}
              </p>
            </div>
          )
        }) : (
          <div style={{ padding: '32px 0', textAlign: 'center', color: '#5A5A5A', fontSize: 13 }}>
            No transactions yet — add your first one
          </div>
        )}
      </div>

    </div>
  )
}
