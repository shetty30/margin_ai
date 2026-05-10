import React, { useState, useEffect, useRef } from 'react'
import { income as incomeApi } from '../api/client'

const fmt    = n => '₹' + Number(n).toLocaleString('en-IN')
const today  = () => new Date().toISOString().split('T')[0]
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const SOURCES = [
  { label: 'Salary',      color: '#7C3AED' },
  { label: 'Freelance',   color: '#059669' },
  { label: 'Business',    color: '#2563EB' },
  { label: 'Investment',  color: '#D97706' },
  { label: 'Rental',      color: '#DC2626' },
  { label: 'Gift',        color: '#7C3AED' },
  { label: 'Other',       color: '#71717A' },
]

/* ── Add Income Modal ────────────────────────────────────────────── */
function AddModal({ onClose, onSave }) {
  const [form, setForm] = useState({ merchant: '', amount: '', txn_date: today(), is_recurring: false, note: '' })
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)
  const firstRef = useRef()

  useEffect(() => { firstRef.current?.focus() }, [])

  const inp = {
    width: '100%', padding: '11px 13px',
    background: '#F4F2FF', border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12, fontSize: 13, color: '#18181B',
    fontFamily: 'Urbanist,sans-serif', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const focus = e => { e.target.style.borderColor='rgba(124,58,237,0.5)'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.10)' }
  const blur  = e => { e.target.style.borderColor='rgba(0,0,0,0.08)';    e.target.style.boxShadow='none' }

  const save = async () => {
    if (!form.merchant.trim())      return setErr('Please enter an income source')
    const amt = parseFloat(form.amount)
    if (!amt || amt <= 0)           return setErr('Please enter a valid amount')
    if (!form.txn_date)             return setErr('Please pick a date')
    setBusy(true)
    try {
      await incomeApi.create({ merchant: form.merchant.trim(), amount: amt, txn_date: form.txn_date, is_recurring: form.is_recurring, note: form.note.trim() || null, payment_method: 'Other' })
      onSave()
    } catch (e) { setErr(e.response?.data?.detail || 'Failed to save') }
    finally { setBusy(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pop-in" style={{ background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.14)', margin: 16 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#18181B', letterSpacing: '-0.4px' }}>Add Income</h2>
            <p style={{ fontSize: 12, color: '#A1A1AA', marginTop: 2 }}>Record a new income entry</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717A', fontSize: 16 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Source quick-pick */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 8 }}>Source type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SOURCES.map(s => (
                <button key={s.label} onClick={() => setForm(f => ({ ...f, merchant: s.label }))}
                  style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                    background: form.merchant === s.label ? s.color : 'transparent',
                    color:      form.merchant === s.label ? '#fff' : s.color,
                    borderColor: s.color + '40',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Source name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>Source name</label>
            <input ref={firstRef} style={inp} value={form.merchant} onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))} placeholder="e.g. Salary — Infosys, Freelance project" onFocus={focus} onBlur={blur}/>
          </div>

          {/* Amount */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>Amount</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 700, color: '#7C3AED' }}>₹</span>
              <input style={{ ...inp, paddingLeft: 28 }} type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" onFocus={focus} onBlur={blur}/>
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>Date received</label>
            <input style={inp} type="date" value={form.txn_date} onChange={e => setForm(f => ({ ...f, txn_date: e.target.value }))} onFocus={focus} onBlur={blur}/>
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>Note <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input style={inp} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Any notes..." onFocus={focus} onBlur={blur}/>
          </div>

          {/* Recurring toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F4F2FF', borderRadius: 12, padding: '12px 14px' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#18181B' }}>Recurring income</p>
              <p style={{ fontSize: 11, color: '#71717A' }}>Monthly fixed income (salary, rent, etc.)</p>
            </div>
            <div onClick={() => setForm(f => ({ ...f, is_recurring: !f.is_recurring }))} style={{
              width: 44, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s', position: 'relative', flexShrink: 0,
              background: form.is_recurring ? '#7C3AED' : '#D4D4D8',
            }}>
              <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: '#fff', top: 3, transition: 'left 0.2s', left: form.is_recurring ? 22 : 3, boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }}/>
            </div>
          </div>

          {err && <p style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, background: 'rgba(239,68,68,0.07)', padding: '9px 12px', borderRadius: 10 }}>{err}</p>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.10)', background: 'transparent', fontSize: 14, fontWeight: 700, color: '#71717A', cursor: 'pointer', fontFamily: 'Urbanist,sans-serif' }}>Cancel</button>
            <button onClick={save} disabled={busy} className="btn-primary" style={{ flex: 2, padding: '12px' }}>
              {busy ? 'Saving…' : 'Add Income'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function Income() {
  const now   = new Date()
  const [year,    setYear]    = useState(now.getFullYear())
  const [month,   setMonth]   = useState(now.getMonth() + 1)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [toast,   setToast]   = useState('')

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await incomeApi.list(year, month)
      setEntries(data)
    } catch { setEntries([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [year, month])

  const remove = async (id) => {
    try { await incomeApi.delete(id); setEntries(e => e.filter(x => x.id !== id)); showToast('Entry removed') }
    catch { showToast('Failed to delete') }
  }

  const total   = entries.reduce((s, e) => s + parseFloat(e.amount), 0)
  const avg     = entries.length ? total / entries.length : 0
  const maxAmt  = entries.length ? Math.max(...entries.map(e => parseFloat(e.amount))) : 1

  const prevMonth = () => { if (month === 1) { setYear(y => y-1); setMonth(12) } else setMonth(m => m-1) }
  const nextMonth = () => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()+1
    if (isCurrentMonth) return
    if (month === 12) { setYear(y => y+1); setMonth(1) } else setMonth(m => m+1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()+1

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>

      {toast && (
        <div className="scale-in" style={{ position: 'fixed', top: 24, right: 24, background: '#fff', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 14, padding: '13px 22px', fontSize: 13, fontWeight: 700, color: '#059669', zIndex: 1000, boxShadow: '0 8px 32px rgba(16,185,129,0.15)' }}>
          {toast}
        </div>
      )}

      {modal && <AddModal onClose={() => setModal(false)} onSave={() => { setModal(false); load(); showToast('Income added') }} />}

      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#18181B', letterSpacing: '-1px' }}>Income</h1>
          <p style={{ fontSize: 13, color: '#71717A', marginTop: 4, fontWeight: 500 }}>Track all your income sources</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
          Add Income
        </button>
      </div>

      {/* Month selector */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, animationDelay: '40ms' }}>
        <button onClick={prevMonth} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717A', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background='#F4F2FF'; e.currentTarget.style.color='#7C3AED' }}
          onMouseLeave={e => { e.currentTarget.style.background='#fff';    e.currentTarget.style.color='#71717A' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#18181B', minWidth: 110, textAlign: 'center', letterSpacing: '-0.3px' }}>
          {months[month-1]} {year}
        </span>
        <button onClick={nextMonth} disabled={isCurrentMonth} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: isCurrentMonth ? '#F4F2FF' : '#fff', cursor: isCurrentMonth ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCurrentMonth ? '#D4D4D8' : '#71717A', transition: 'all 0.15s', opacity: isCurrentMonth ? 0.5 : 1 }}
          onMouseEnter={e => { if (!isCurrentMonth) { e.currentTarget.style.background='#F4F2FF'; e.currentTarget.style.color='#7C3AED' } }}
          onMouseLeave={e => { if (!isCurrentMonth) { e.currentTarget.style.background='#fff';    e.currentTarget.style.color='#71717A' } }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Summary cards */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24, animationDelay: '80ms' }}>
        {[
          { label: 'Total income',    value: fmt(total),        sub: `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`, color: '#059669', bg: 'rgba(5,150,105,0.08)' },
          { label: 'Largest entry',   value: entries.length ? fmt(maxAmt) : '—', sub: entries.find(e => parseFloat(e.amount) === maxAmt)?.merchant || '—', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
          { label: 'Average entry',   value: entries.length ? fmt(avg) : '—',    sub: 'per source', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '20px 22px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: s.color, letterSpacing: '-0.5px', marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#71717A', fontWeight: 600 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Entries list */}
      <div className="card fade-up" style={{ padding: 0, overflow: 'hidden', animationDelay: '120ms' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#18181B' }}>Income entries</h3>
          <span className="pill pill-teal">{months[month-1]} {year}</span>
        </div>

        {loading ? (
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }}/>)}
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(5,150,105,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#18181B', marginBottom: 6 }}>No income recorded</p>
            <p style={{ fontSize: 13, color: '#71717A', marginBottom: 20 }}>Add your salary, freelance earnings, or any other income</p>
            <button onClick={() => setModal(true)} className="btn-primary" style={{ padding: '11px 24px', fontSize: 13 }}>Add your first income</button>
          </div>
        ) : (
          <div>
            {entries.map((entry, i) => {
              const pct = Math.round((parseFloat(entry.amount) / maxAmt) * 100)
              return (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 22px',
                  borderBottom: i < entries.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(5,150,105,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>

                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(5,150,105,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#18181B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.merchant || 'Income'}</p>
                      {entry.is_recurring && <span className="pill pill-violet" style={{ fontSize: 10 }}>Recurring</span>}
                    </div>
                    {/* Bar */}
                    <div style={{ height: 4, background: '#E8E4FF', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#059669,#34D399)', borderRadius: 2, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}/>
                    </div>
                    <p style={{ fontSize: 11, color: '#A1A1AA', marginTop: 4, fontWeight: 500 }}>
                      {new Date(entry.txn_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      {entry.note ? ` · ${entry.note}` : ''}
                    </p>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 17, fontWeight: 900, color: '#059669', letterSpacing: '-0.3px' }}>+{fmt(entry.amount)}</p>
                  </div>

                  {/* Delete */}
                  <button onClick={() => remove(entry.id)} style={{ width: 30, height: 30, borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4D4D8', flexShrink: 0, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#EF4444' }}
                    onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#D4D4D8' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              )
            })}

            {/* Total row */}
            <div style={{ padding: '14px 22px', background: 'rgba(5,150,105,0.05)', borderTop: '1px solid rgba(5,150,105,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#71717A' }}>Total for {months[month-1]}</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#059669', letterSpacing: '-0.4px' }}>+{fmt(total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
