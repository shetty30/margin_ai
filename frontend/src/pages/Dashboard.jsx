import React, { useEffect, useState, useRef } from 'react'
import { dashboard } from '../api/client'
import { BarChart, Bar, Cell, PieChart, Pie, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis } from 'recharts'

const fmt = n => '₹' + Math.abs(Number(n)).toLocaleString('en-IN')

function AnimatedNumber({ value, prefix = '₹', duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef(null)

  useEffect(() => {
    if (!value) return
    const target = Number(value)
    const start = performance.now()
    const step = (ts) => {
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 4)
      setDisplay(Math.round(target * ease))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  return <span>{prefix}{display.toLocaleString('en-IN')}</span>
}

const CATS = ['#7c6cf0','#5b7ef5','#00d4aa','#f25c7a','#f5a623','#a99cf5','#636e72']

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [visible, setVisible] = useState(false)
  const now = new Date()

  useEffect(() => {
    dashboard.get(now.getFullYear(), now.getMonth() + 1)
      .then(r => { setData(r.data); setTimeout(() => setVisible(true), 100) })
      .catch(() => {})
  }, [])

  if (!data) return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 16 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: 180, background: 'var(--glass)', borderRadius: 16, border: '0.5px solid var(--rim)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)', animation: 'shimmer 1.5s infinite' }} />
          </div>
        ))}
      </div>
    </div>
  )

  const pct = data.expense_budget > 0 ? Math.round((data.total_spent / data.expense_budget) * 100) : 0
  const remaining = data.expense_budget - data.total_spent

  return (
    <div style={{ padding: 28, maxWidth: 960, position: 'relative' }}>
      {/* Background orbs */}
      <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(124,108,240,0.07),transparent)', top: -100, right: -100, zIndex: 0 }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle,rgba(0,212,170,0.05),transparent)', bottom: 100, left: -50, zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className={`fade-up`} style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
              Your margin · {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
            <h1 className="syne" style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-1.5px', color: 'var(--text)', lineHeight: 1 }}>
              <AnimatedNumber value={remaining} />
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="pill pill-violet">{pct}% used</div>
            <div className="pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}>{now.getDate()} days in</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="fade-up" style={{ animationDelay: '60ms', marginBottom: 24 }}>
          <div style={{ height: 3, background: 'var(--glass2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: pct > 85 ? 'linear-gradient(90deg,var(--rose),#ff8fa3)' : pct > 60 ? 'linear-gradient(90deg,var(--amber),#ffd280)' : 'linear-gradient(90deg,var(--violet),var(--teal))',
              width: visible ? `${Math.min(pct, 100)}%` : '0%',
              transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--faint)' }}>{fmt(data.total_spent)} spent</span>
            <span style={{ fontSize: 11, color: 'var(--faint)' }}>{fmt(data.expense_budget)} budget</span>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Income', value: data.income, color: 'var(--violet2)', delay: '80ms' },
            { label: 'Saved', value: data.savings_target, color: 'var(--indigo)', delay: '120ms' },
            { label: 'Daily avg', value: data.daily_avg, color: data.daily_avg > (data.expense_budget / 30) ? 'var(--rose)' : 'var(--teal)', delay: '160ms' },
          ].map(s => (
            <div key={s.label} className="card fade-up" style={{ padding: '18px 20px', animationDelay: s.delay }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>{s.label}</p>
              <p className="syne" style={{ fontSize: 22, fontWeight: 600, color: s.color, letterSpacing: '-0.5px' }}>
                <AnimatedNumber value={s.value} duration={1000} />
              </p>
              {s.label === 'Saved' && (
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{data.savings_rate}% rate</p>
              )}
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12, marginBottom: 20 }}>
          {/* Bar chart */}
          <div className="card fade-up" style={{ padding: '18px 20px', animationDelay: '200ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Daily spend</p>
              <span className="pill pill-violet">{now.toLocaleString('default', { month: 'short' })}</span>
            </div>
            {data.daily_spend.length > 0 ? (
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={data.daily_spend} barSize={6} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="total" radius={[3, 3, 0, 0]}>
                    {data.daily_spend.map((_, i) => (
                      <Cell key={i} fill={i === data.daily_spend.length - 1 ? 'var(--violet)' : 'rgba(124,108,240,0.25)'} />
                    ))}
                  </Bar>
                  <Tooltip
                    formatter={v => [fmt(v), 'Spent']}
                    contentStyle={{ background: 'rgba(14,14,26,0.95)', border: '0.5px solid var(--rim2)', borderRadius: 10, fontSize: 12, color: 'var(--text)' }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--faint)', fontSize: 13 }}>
                No transactions yet
              </div>
            )}
          </div>

          {/* Donut */}
          <div className="card fade-up" style={{ padding: '18px 20px', animationDelay: '240ms' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Categories</p>
            {data.by_category.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={80}>
                  <PieChart>
                    <Pie data={data.by_category} cx="50%" cy="50%" innerRadius={22} outerRadius={36} paddingAngle={3} dataKey="total" startAngle={90} endAngle={-270}>
                      {data.by_category.map((_, i) => <Cell key={i} fill={CATS[i % CATS.length]} strokeWidth={0} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                  {data.by_category.slice(0, 3).map((c, i) => (
                    <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: CATS[i], flexShrink: 0 }} />
                        {c.name.split(' ')[0]}
                      </div>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{fmt(c.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--faint)', fontSize: 12 }}>No data</div>
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="card fade-up" style={{ padding: '20px', animationDelay: '280ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Recent transactions</p>
            <a href="/transactions" style={{ fontSize: 12, color: 'var(--violet2)', textDecoration: 'none' }}>View all →</a>
          </div>
          {data.recent_txns.length > 0 ? data.recent_txns.map((t, i) => (
            <div key={i} className="slide-right" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 0', borderBottom: i < data.recent_txns.length - 1 ? '0.5px solid var(--rim)' : 'none',
              animationDelay: `${300 + i * 40}ms`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--glass2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  💳
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{t.merchant || 'Unknown'}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>{t.date}</p>
                </div>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: t.amount > 0 ? 'var(--teal)' : 'var(--text)' }}>
                {t.amount > 0 ? '+' : '−'}{fmt(t.amount)}
              </p>
            </div>
          )) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
              No transactions yet — add your first one
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
