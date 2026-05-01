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

/* Name-to-style map — mirrors the DB seed colours + reference image palette */
const CAT_STYLES = {
  'Food & Dining': { grad: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', bar: '#8B5CF6', icon: '🍔' },
  'Transport':     { grad: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', bar: '#3B82F6', icon: '🚖' },
  'Shopping':      { grad: 'linear-gradient(135deg,#EC4899,#BE185D)', bar: '#EC4899', icon: '🛒' },
  'Entertainment': { grad: 'linear-gradient(135deg,#10B981,#047857)', bar: '#10B981', icon: '🎮' },
  'Utilities':     { grad: 'linear-gradient(135deg,#F97316,#C2410C)', bar: '#F97316', icon: '🏠' },
  'Health':        { grad: 'linear-gradient(135deg,#06B6D4,#0E7490)', bar: '#06B6D4', icon: '💊' },
  'Misc':          { grad: 'linear-gradient(135deg,#64748B,#334155)', bar: '#64748B', icon: '📦' },
}
/* Fallback palette by index for unknown categories */
const CAT_PALETTE = [
  { grad: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', bar: '#8B5CF6', icon: '🛒' },
  { grad: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', bar: '#3B82F6', icon: '🚗' },
  { grad: 'linear-gradient(135deg,#10B981,#047857)', bar: '#10B981', icon: '💳' },
  { grad: 'linear-gradient(135deg,#F97316,#C2410C)', bar: '#F97316', icon: '🏠' },
]
const getCatStyle = (name, i) => CAT_STYLES[name] || CAT_PALETTE[i % CAT_PALETTE.length]

/* Stable colour per merchant name */
const M_COLORS = ['#8B5CF6','#3B82F6','#10B981','#F97316','#EC4899','#06B6D4','#059669']
const merchantColor = str => {
  if (!str) return M_COLORS[0]
  let h = 0
  for (const c of str) h = ((h << 5) - h) + c.charCodeAt(0)
  return M_COLORS[Math.abs(h) % M_COLORS.length]
}

/* Quick-action link pills */
const ACTIONS = [
  { label:'Transactions', href:'/transactions', d:'M3 6h14M3 10h9M3 14h5' },
  { label:'Goals',        href:'/goals',        d:'M10 3v14M3 10h14' },
  { label:'AI Chat',      href:'/chat',         d:'M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H7l-4 3V4z' },
  { label:'Profile',      href:'/profile',      d:'M10 7a3 3 0 100-6 3 3 0 000 6zm-7 10c0-3.3 3.1-6 7-6s7 2.7 7 6' },
]

export default function Dashboard() {
  const [data,    setData]    = useState(null)
  const [visible, setVisible] = useState(false)
  const [showBal, setShowBal] = useState(true)
  const now = new Date()

  useEffect(() => {
    dashboard.get(now.getFullYear(), now.getMonth() + 1)
      .then(r => { setData(r.data); setTimeout(() => setVisible(true), 80) })
      .catch(() => {})
  }, [])

  /* Skeleton */
  if (!data) return (
    <div style={{ padding: 28 }}>
      <div style={{ height: 200, background: 'linear-gradient(135deg,rgba(5,150,105,0.14),rgba(13,148,136,0.10))', borderRadius: 24, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(5,150,105,0.07),transparent)', animation:'shimmer 1.5s infinite' }} />
      </div>
      {[1,2,3].map(i => (
        <div key={i} style={{ height:90, background:'#fff', borderRadius:16, border:'1px solid var(--rim)', marginBottom:12, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(5,150,105,0.04),transparent)', animation:'shimmer 1.5s infinite' }} />
        </div>
      ))}
    </div>
  )

  const pct       = data.expense_budget > 0 ? Math.round((data.total_spent / data.expense_budget) * 100) : 0
  const remaining = data.expense_budget - data.total_spent
  const month     = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: 28, maxWidth: 960, position: 'relative' }}>

      {/* ── Hero balance card ── */}
      <div className="fade-up" style={{
        background: 'linear-gradient(135deg,#059669 0%,#0D9488 55%,#0891B2 100%)',
        borderRadius: 24, padding: '32px 28px', marginBottom: 20,
        position: 'relative', overflow: 'hidden', color: '#fff',
        boxShadow: '0 20px 60px rgba(5,150,105,0.30)',
      }}>
        <div style={{ position:'absolute', top:-50,  right:-30, width:220, height:220, background:'rgba(255,255,255,0.07)', borderRadius:'50%', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-70, right:90, width:170, height:170, background:'rgba(255,255,255,0.05)', borderRadius:'50%', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:20,  right:160, width:80,  height:80,  background:'rgba(255,255,255,0.06)', borderRadius:'50%', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:600, marginBottom:10 }}>
            Your margin · {month}
          </p>

          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
            <h1 style={{ fontSize:48, fontWeight:800, letterSpacing:'-2px', lineHeight:1 }}>
              {showBal ? <AnimatedNumber value={remaining} /> : '₹ ••••••'}
            </h1>
            <button onClick={() => setShowBal(v => !v)} style={{
              background:'rgba(255,255,255,0.18)', border:'none', borderRadius:8,
              padding:'6px 8px', cursor:'pointer', color:'#fff',
              display:'flex', alignItems:'center',
            }}>
              {showBal
                ? <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="#fff" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" stroke="#fff" strokeWidth="1.5"/></svg>
                : <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 3l14 14M11.4 11.4A2.5 2.5 0 017.6 7.6M6.2 6.2C4.2 7.2 2.8 8.8 2 10c1.5 3.5 4.5 6 8 6 1.5 0 2.9-.4 4.1-1.2M9 4.1C9.3 4 9.7 4 10 4c3.5 0 6.5 2.5 8 6-.6 1.4-1.5 2.6-2.6 3.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
              }
            </button>
          </div>

          <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', marginBottom:22 }}>
            {fmt(data.total_spent)} spent · {fmt(data.expense_budget)} budget · {pct}% used
          </p>

          <div style={{ height:4, background:'rgba(255,255,255,0.22)', borderRadius:2, overflow:'hidden', marginBottom:8 }}>
            <div style={{ height:'100%', background:'rgba(255,255,255,0.9)', borderRadius:2, width: visible ? `${Math.min(pct,100)}%` : '0%', transition:'width 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>{fmt(data.total_spent)} spent</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>{fmt(data.expense_budget)} budget</span>
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="fade-up" style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', animationDelay:'60ms' }}>
        {ACTIONS.map(a => (
          <a key={a.label} href={a.href} style={{
            display:'flex', alignItems:'center', gap:8, padding:'10px 18px',
            borderRadius:12, background:'#fff', border:'1px solid var(--rim)',
            fontSize:13, fontWeight:600, color:'var(--text)',
            textDecoration:'none', transition:'all 0.2s',
            boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(5,150,105,0.3)'; e.currentTarget.style.color='#059669'; e.currentTarget.style.background='rgba(5,150,105,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--rim)';            e.currentTarget.style.color='var(--text)'; e.currentTarget.style.background='#fff' }}
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={a.d} />
            </svg>
            {a.label}
          </a>
        ))}
      </div>

      {/* ── Stats row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12, marginBottom:20 }}>
        {[
          { label:'Income',    value:data.income,         color:'#059669', sub:null },
          { label:'Saved',     value:data.savings_target, color:'#0D9488', sub:`${data.savings_rate}% savings rate` },
          { label:'Daily avg', value:data.daily_avg,      color:data.daily_avg>(data.expense_budget/30)?'#DC2626':'#059669', sub:`of ${fmt(Math.round(data.expense_budget/30))} limit` },
        ].map((s, i) => (
          <div key={s.label} className="card fade-up" style={{ padding:'20px', animationDelay:`${80+i*40}ms` }}>
            <p style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:8, fontWeight:600 }}>{s.label}</p>
            <p style={{ fontSize:22, fontWeight:800, color:s.color, letterSpacing:'-0.5px' }}>
              <AnimatedNumber value={s.value} duration={1000} />
            </p>
            {s.sub && <p style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Coloured category cards (matches reference image style) ── */}
      {data.by_category.length > 0 && (
        <div className="fade-up" style={{ marginBottom:20, animationDelay:'180ms' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <p style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>Spending by category</p>
            <a href="/transactions" style={{ fontSize:12, color:'#059669', textDecoration:'none', fontWeight:600 }}>See all →</a>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:12 }}>
            {data.by_category.slice(0,4).map((cat, i) => {
              const pal    = getCatStyle(cat.name, i)
              const catPct = data.total_spent > 0 ? Math.round(cat.total / data.total_spent * 100) : 0
              return (
                <div key={cat.name} className="fade-up" style={{
                  background: pal.grad, borderRadius:20, padding:'22px 20px',
                  position:'relative', overflow:'hidden', color:'#fff',
                  animationDelay:`${200+i*60}ms`,
                  boxShadow:'0 8px 28px rgba(0,0,0,0.14)',
                }}>
                  <div style={{ position:'absolute', top:-24, right:-24, width:110, height:110, background:'rgba(255,255,255,0.12)', borderRadius:'50%', pointerEvents:'none' }} />
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                    <div style={{ width:40, height:40, borderRadius:13, background:'rgba(255,255,255,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                      {pal.icon}
                    </div>
                    <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.9)' }}>{cat.name}</p>
                  </div>
                  <p style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', marginBottom:10 }}>{fmt(cat.total)}</p>
                  <div style={{ height:3, background:'rgba(255,255,255,0.22)', borderRadius:2, overflow:'hidden', marginBottom:6 }}>
                    <div style={{ height:'100%', background:'rgba(255,255,255,0.75)', borderRadius:2, width:`${catPct}%` }} />
                  </div>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.65)', fontWeight:500 }}>{catPct}% of total spend</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Chart + Top spend row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 220px', gap:12, marginBottom:20 }}>

        {/* Daily bar chart */}
        <div className="card fade-up" style={{ padding:'20px', animationDelay:'300ms' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>Daily spend</p>
            <span className="pill pill-violet">{now.toLocaleString('default',{month:'short'})}</span>
          </div>
          {data.daily_spend.length > 0 ? (
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={data.daily_spend} barSize={6} margin={{top:0,right:0,left:0,bottom:0}}>
                <Bar dataKey="total" radius={[3,3,0,0]}>
                  {data.daily_spend.map((_,i) => (
                    <Cell key={i} fill={i===data.daily_spend.length-1?'#059669':'rgba(5,150,105,0.18)'} />
                  ))}
                </Bar>
                <Tooltip
                  formatter={v => [fmt(v),'Spent']}
                  contentStyle={{background:'#fff',border:'1px solid var(--rim)',borderRadius:10,fontSize:12,color:'var(--text)',boxShadow:'0 4px 16px rgba(0,0,0,0.08)'}}
                  cursor={{fill:'rgba(5,150,105,0.04)'}}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{height:90,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--faint)',fontSize:13}}>No transactions yet</div>
          )}
        </div>

        {/* Top categories mini-list */}
        <div className="card fade-up" style={{ padding:'20px', animationDelay:'340ms' }}>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:14 }}>Top spend</p>
          {data.by_category.length > 0 ? (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {data.by_category.slice(0,4).map((c,i) => {
                const pal  = getCatStyle(c.name, i)
                const pBar = data.total_spent > 0 ? Math.min(c.total/data.total_spent*100,100) : 0
                return (
                  <div key={c.name}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4,alignItems:'center'}}>
                      <span style={{color:'var(--muted)',display:'flex',alignItems:'center',gap:4}}>
                        {pal.icon} {c.name.split(' ')[0]}
                      </span>
                      <span style={{color:'var(--text)',fontWeight:700}}>{fmt(c.total)}</span>
                    </div>
                    <div style={{height:3,background:'rgba(0,0,0,0.06)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',background:pal.bar,borderRadius:2,width:`${pBar}%`,transition:'width 1.2s ease'}} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--faint)',fontSize:12}}>No data yet</div>
          )}
        </div>
      </div>

      {/* ── Recent transactions ── */}
      <div className="card fade-up" style={{ padding:'20px', animationDelay:'380ms' }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>Latest transactions</p>
          <a href="/transactions" style={{fontSize:12,color:'#059669',textDecoration:'none',fontWeight:600}}>See all →</a>
        </div>
        {data.recent_txns.length > 0 ? data.recent_txns.map((t,i) => {
          const col      = merchantColor(t.merchant)
          const initials = (t.merchant||'?').slice(0,2).toUpperCase()
          return (
            <div key={i} className="slide-right" style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'12px 0',
              borderBottom: i < data.recent_txns.length-1 ? '1px solid var(--rim)' : 'none',
              animationDelay:`${400+i*45}ms`,
            }}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{
                  width:40, height:40, borderRadius:13, flexShrink:0,
                  background:`linear-gradient(135deg,${col},${col}bb)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12, fontWeight:700, color:'#fff',
                  boxShadow:`0 4px 12px ${col}40`,
                }}>
                  {initials}
                </div>
                <div>
                  <p style={{fontSize:13,fontWeight:600,color:'var(--text)',marginBottom:2}}>{t.merchant||'Unknown'}</p>
                  <p style={{fontSize:11,color:'var(--muted)'}}>{t.date}</p>
                </div>
              </div>
              <p style={{fontSize:14,fontWeight:700,color:t.amount>0?'#059669':'var(--text)'}}>
                {t.amount>0?'+':'−'}{fmt(t.amount)}
              </p>
            </div>
          )
        }) : (
          <div style={{padding:'32px 0',textAlign:'center',color:'var(--faint)',fontSize:13}}>
            No transactions yet — add your first one
          </div>
        )}
      </div>
    </div>
  )
}
