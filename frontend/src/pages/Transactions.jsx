import React, { useState, useEffect, useRef } from 'react'
import { transactions as txnApi, categories as catApi } from '../api/client'

const fmt = n => '₹' + Math.abs(Number(n)).toLocaleString('en-IN')

const CAT_COLORS = {
  'Food & Dining': '#8B5CF6',
  'Transport':     '#3B82F6',
  'Shopping':      '#EC4899',
  'Entertainment': '#10B981',
  'Utilities':     '#F97316',
  'Health':        '#06B6D4',
  'Misc':          '#64748B',
}

const PAYMENT_METHODS = ['UPI', 'Card', 'Cash', 'NEFT', 'Auto-debit', 'Other']
const FILTERS = ['All', 'Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Health']
const today = () => new Date().toISOString().split('T')[0]

/* ── Add Transaction Modal ──────────────────────────────── */
function AddModal({ cats, onClose, onAdded }) {
  const [form, setForm] = useState({
    merchant: '', amount: '', category_id: '',
    payment_method: 'UPI', txn_date: today(),
    is_recurring: false, note: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const amtRef = useRef()

  useEffect(() => { amtRef.current?.focus() }, [])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) { setErr('Enter a valid amount'); return }
    setSaving(true); setErr('')
    try {
      const payload = {
        amount:         -Math.abs(parseFloat(form.amount)),
        merchant:       form.merchant || null,
        category_id:    form.category_id ? Number(form.category_id) : null,
        payment_method: form.payment_method,
        txn_date:       form.txn_date,
        is_recurring:   form.is_recurring,
        note:           form.note || null,
        source:         'manual',
      }
      const { data } = await txnApi.create(payload)
      onAdded(data); onClose()
    } catch (e) { setErr(e.response?.data?.detail || 'Failed to save') }
    finally { setSaving(false) }
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: '#242424', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14, fontSize: 14, color: '#fff', outline: 'none',
    fontFamily: 'Urbanist, sans-serif', transition: 'border-color 0.2s',
  }
  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 7 }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.70)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="scale-in" style={{ background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.60)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Add Transaction</h2>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8F8F8F', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,77,0.12)'; e.currentTarget.style.color = '#FF4D4D' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8F8F8F' }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Amount */}
          <div>
            <label style={labelStyle}>Amount (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 22, color: '#5A5A5A', fontWeight: 400 }}>₹</span>
              <input
                ref={amtRef} type="number" min="0.01" step="0.01"
                value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="0.00"
                style={{ ...inputStyle, paddingLeft: 40, fontSize: 26, fontWeight: 900, height: 64 }}
                onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.50)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label style={labelStyle}>Merchant / Description</label>
            <input style={inputStyle} value={form.merchant} onChange={e => set('merchant', e.target.value)} placeholder="Swiggy, Amazon, Rent…"
              onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.50)'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>

          {/* Category + Payment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">— pick —</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Payment</label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }}
              value={form.txn_date} onChange={e => set('txn_date', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.50)'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>

          {/* Note */}
          <div>
            <label style={labelStyle}>Note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input style={inputStyle} value={form.note} onChange={e => set('note', e.target.value)} placeholder="Any note…"
              onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.50)'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
          </div>

          {/* Recurring toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
            <div onClick={() => set('is_recurring', !form.is_recurring)} style={{
              width: 46, height: 26, borderRadius: 13,
              background: form.is_recurring ? '#CFF008' : 'rgba(255,255,255,0.10)',
              position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
            }}>
              <div style={{ position: 'absolute', top: 3, left: form.is_recurring ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: form.is_recurring ? '#131313' : '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
            </div>
            <span style={{ fontSize: 13, color: '#8F8F8F', fontWeight: 600 }}>Recurring monthly</span>
          </label>

          {err && (
            <div style={{ background: 'rgba(255,77,77,0.10)', border: '1px solid rgba(255,77,77,0.20)', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#FF4D4D' }}>{err}</div>
          )}

          <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 4, padding: '16px', fontSize: 15 }}>
            {saving ? 'Saving…' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────── */
export default function Transactions() {
  const [data,   setData]   = useState([])
  const [cats,   setCats]   = useState([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [modal,  setModal]  = useState(false)
  const now = new Date()

  useEffect(() => {
    txnApi.list(now.getFullYear(), now.getMonth() + 1).then(r => setData(r.data)).catch(() => {})
    catApi.list().then(r => setCats(r.data)).catch(() => {})
  }, [])

  const del   = async (id) => { await txnApi.delete(id); setData(d => d.filter(t => t.id !== id)) }
  const onAdd = (txn) => setData(d => [txn, ...d])

  const filtered = data.filter(t => {
    const mf = filter === 'All' || t.category?.name === filter
    const ms = !search || t.merchant?.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  const totalSpent = data.reduce((s, t) => s + (t.amount < 0 ? Math.abs(t.amount) : 0), 0)

  return (
    <div style={{ padding: 28, maxWidth: 800 }}>
      {modal && <AddModal cats={cats} onClose={() => setModal(false)} onAdded={onAdd} />}

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontSize: 11, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, fontWeight: 700 }}>
            This month · {fmt(totalSpent)} spent
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1.5px', color: '#fff' }}>Transactions</h1>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="#131313" strokeWidth="2.2" strokeLinecap="round"/></svg>
          Add Transaction
        </button>
      </div>

      {/* Search */}
      <div className="fade-up" style={{ marginBottom: 14, animationDelay: '60ms' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by merchant…"
          style={{
            width: '100%', padding: '13px 16px', marginBottom: 12,
            background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, fontSize: 14, color: '#fff',
            fontFamily: 'Urbanist, sans-serif', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.40)'}
          onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
              background: filter === f ? '#CFF008' : '#1C1C1C',
              border:     filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color:      filter === f ? '#131313' : '#8F8F8F',
              fontWeight: filter === f ? 700 : 500,
              fontFamily: 'Urbanist, sans-serif',
              transition: 'all 0.2s',
              boxShadow:  filter === f ? '0 4px 14px rgba(207,240,8,0.20)' : 'none',
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div className="card fade-up" style={{ overflow: 'hidden', animationDelay: '120ms' }}>
        {filtered.length > 0 ? filtered.map((t, i) => {
          const col = CAT_COLORS[t.category?.name] || '#CFF008'
          return (
            <div key={t.id} className="slide-right" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              transition: 'background 0.15s', animationDelay: `${i * 35}ms`,
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(207,240,8,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                  background: col + '18',
                  border: `1px solid ${col}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>
                  {t.category?.icon || '💳'}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{t.merchant || 'Unknown'}</p>
                  <p style={{ fontSize: 11, color: '#5A5A5A', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                    {t.category?.name && <span style={{ color: col, fontWeight: 700 }}>{t.category.name}</span>}
                    {t.category?.name && <span style={{ color: '#2C2C2C' }}>·</span>}
                    {t.payment_method} · {t.txn_date}
                    {t.source === 'sms'   && <span style={{ background: 'rgba(207,240,8,0.12)', color: '#CFF008', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>SMS</span>}
                    {t.is_recurring       && <span style={{ background: 'rgba(34,211,238,0.12)', color: '#22D3EE', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>Recurring</span>}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: t.amount > 0 ? '#CFF008' : '#fff' }}>
                  {t.amount > 0 ? '+' : '−'}{fmt(t.amount)}
                </p>
                <button onClick={() => del(t.id)} style={{
                  width: 30, height: 30, borderRadius: 9, background: 'transparent', border: 'none',
                  color: '#5A5A5A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', opacity: 0, cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#FF4D4D'; e.currentTarget.style.background = 'rgba(255,77,77,0.12)'; e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#5A5A5A'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0' }}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M4 6h12M8 6V4h4v2M7 10v5M13 10v5M5 6l1 11h8l1-11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          )
        }) : (
          <div style={{ padding: '56px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 10 }}>💳</p>
            <p style={{ color: '#5A5A5A', fontSize: 14, fontWeight: 600 }}>{search ? 'No results found' : 'No transactions yet'}</p>
            {!search && (
              <button onClick={() => setModal(true)} style={{
                marginTop: 16, padding: '10px 22px', borderRadius: 14,
                background: 'rgba(207,240,8,0.10)', border: '1px solid rgba(207,240,8,0.22)',
                color: '#CFF008', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Urbanist, sans-serif',
              }}>
                + Add your first transaction
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
