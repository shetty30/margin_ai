import React, { useState, useEffect, useRef } from 'react'
import { transactions as txnApi, categories as catApi } from '../api/client'

const fmt = n => '₹' + Math.abs(Number(n)).toLocaleString('en-IN')

const CAT_COLORS = {
  'Food & Dining': { bg: '#7C3AED', light: '#EDE9FE' },
  'Transport':     { bg: '#2563EB', light: '#DBEAFE' },
  'Shopping':      { bg: '#DB2777', light: '#FCE7F3' },
  'Entertainment': { bg: '#059669', light: '#D1FAE5' },
  'Utilities':     { bg: '#D97706', light: '#FEF3C7' },
  'Health':        { bg: '#0891B2', light: '#CFFAFE' },
  'Misc':          { bg: '#525252', light: '#F5F5F5' },
}
const getCatColor = name => CAT_COLORS[name] || { bg: '#7C3AED', light: '#EDE9FE' }

const PAYMENT_METHODS = ['UPI', 'Card', 'Cash', 'NEFT', 'Auto-debit', 'Other']
const FILTERS = ['All', 'Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Health']
const today = () => new Date().toISOString().split('T')[0]

/* ── Add Modal ──────────────────────────────────────────── */
function AddModal({ cats, onClose, onAdded }) {
  const [form, setForm] = useState({ merchant: '', amount: '', category_id: '', payment_method: 'UPI', txn_date: today(), is_recurring: false, note: '' })
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
      const { data } = await txnApi.create({
        amount: -Math.abs(parseFloat(form.amount)), merchant: form.merchant || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        payment_method: form.payment_method, txn_date: form.txn_date,
        is_recurring: form.is_recurring, note: form.note || null, source: 'manual',
      })
      onAdded(data); onClose()
    } catch (e) { setErr(e.response?.data?.detail || 'Failed to save') }
    finally { setSaving(false) }
  }

  const field = { width: '100%', padding: '12px 14px', background: '#F4F2FF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 14, color: '#18181B', fontFamily: 'Urbanist,sans-serif', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }
  const onF = e => { e.target.style.borderColor='rgba(124,58,237,0.50)'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.10)' }
  const onB = e => { e.target.style.borderColor='rgba(0,0,0,0.08)'; e.target.style.boxShadow='none' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.30)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="scale-in" style={{ background: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(124,58,237,0.16)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#18181B', letterSpacing: '-0.5px' }}>Add Transaction</h2>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717A', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#EF4444' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#71717A' }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Amount */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 7 }}>Amount (₹)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 22, color: '#A1A1AA' }}>₹</span>
              <input ref={amtRef} type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00"
                style={{ ...field, paddingLeft: 42, fontSize: 28, fontWeight: 900, height: 66 }} onFocus={onF} onBlur={onB} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 7 }}>Merchant / Description</label>
            <input style={field} value={form.merchant} onChange={e => set('merchant', e.target.value)} placeholder="Swiggy, Amazon, Rent…" onFocus={onF} onBlur={onB} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 7 }}>Category</label>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={{ ...field, cursor: 'pointer' }} onFocus={onF} onBlur={onB}>
                <option value="">— pick —</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 7 }}>Payment</label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)} style={{ ...field, cursor: 'pointer' }} onFocus={onF} onBlur={onB}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 7 }}>Date</label>
            <input type="date" style={{ ...field, colorScheme: 'light', cursor: 'pointer' }} value={form.txn_date} onChange={e => set('txn_date', e.target.value)} onFocus={onF} onBlur={onB} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 7 }}>Note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input style={field} value={form.note} onChange={e => set('note', e.target.value)} placeholder="Any note…" onFocus={onF} onBlur={onB} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
            <div onClick={() => set('is_recurring', !form.is_recurring)} style={{ width: 46, height: 26, borderRadius: 13, background: form.is_recurring ? '#7C3AED' : '#E4E4E7', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: form.is_recurring ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
            <span style={{ fontSize: 13, color: '#71717A', fontWeight: 600 }}>Recurring monthly</span>
          </label>

          {err && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#EF4444' }}>{err}</div>}

          <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 4, padding: '15px', fontSize: 15 }}>
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

  const del   = async id => { await txnApi.delete(id); setData(d => d.filter(t => t.id !== id)) }
  const onAdd = txn => setData(d => [txn, ...d])

  const filtered = data.filter(t => {
    const mf = filter === 'All' || t.category?.name === filter
    const ms = !search || t.merchant?.toLowerCase().includes(search.toLowerCase())
    return mf && ms
  })

  const totalSpent = data.reduce((s, t) => s + (t.amount < 0 ? Math.abs(t.amount) : 0), 0)

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>
      {modal && <AddModal cats={cats} onClose={() => setModal(false)} onAdded={onAdd} />}

      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 26 }}>
        <div>
          <p style={{ fontSize: 12, color: '#A1A1AA', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{fmt(totalSpent)} spent this month</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#18181B', letterSpacing: '-1px' }}>Transactions</h1>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
          Add Transaction
        </button>
      </div>

      {/* Search */}
      <div className="fade-up" style={{ marginBottom: 16, animationDelay: '50ms' }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A1A1AA' }}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7"/><path d="M16.5 16.5l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions…"
            style={{ width: '100%', padding: '12px 14px 12px 40px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, fontSize: 14, color: '#18181B', fontFamily: 'Urbanist,sans-serif', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
            onFocus={e => { e.target.style.borderColor='rgba(124,58,237,0.40)'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.08)' }}
            onBlur={e  => { e.target.style.borderColor='rgba(0,0,0,0.08)'; e.target.style.boxShadow='none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
              background: filter === f ? '#7C3AED' : '#fff',
              border:     filter === f ? 'none' : '1px solid rgba(0,0,0,0.08)',
              color:      filter === f ? '#fff' : '#71717A',
              fontWeight: filter === f ? 700 : 500,
              fontFamily: 'Urbanist,sans-serif',
              transition: 'all 0.18s',
              boxShadow:  filter === f ? '0 4px 14px rgba(124,58,237,0.22)' : 'none',
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="card fade-up" style={{ overflow: 'hidden', animationDelay: '100ms' }}>
        {filtered.length > 0 ? filtered.map((t, i) => {
          const { bg, light } = getCatColor(t.category?.name)
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9F8FF'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
                  {t.category?.icon || '💳'}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#18181B', marginBottom: 3 }}>{t.merchant || 'Unknown'}</p>
                  <p style={{ fontSize: 11, color: '#A1A1AA', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t.category?.name && <span style={{ color: bg }}>{t.category.name}</span>}
                    {t.category?.name && <span>·</span>}
                    {t.payment_method} · {t.txn_date}
                    {t.is_recurring && <span style={{ background: 'rgba(124,58,237,0.10)', color: '#7C3AED', padding: '1px 6px', borderRadius: 5, fontSize: 10, fontWeight: 700 }}>Recurring</span>}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: t.amount > 0 ? '#059669' : '#18181B' }}>
                  {t.amount > 0 ? '+' : '−'}{fmt(t.amount)}
                </p>
                <button onClick={() => del(t.id)} style={{ width: 30, height: 30, borderRadius: 9, background: 'transparent', border: 'none', color: '#D4D4D8', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.color='#EF4444'; e.currentTarget.style.background='rgba(239,68,68,0.10)' }}
                  onMouseLeave={e => { e.currentTarget.style.color='#D4D4D8'; e.currentTarget.style.background='transparent' }}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M4 6h12M8 6V4h4v2M7 10v5M13 10v5M5 6l1 11h8l1-11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          )
        }) : (
          <div style={{ padding: '56px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 10 }}>💳</p>
            <p style={{ color: '#A1A1AA', fontSize: 14, fontWeight: 600 }}>{search ? 'No results found' : 'No transactions yet'}</p>
            {!search && (
              <button onClick={() => setModal(true)} style={{ marginTop: 16, padding: '10px 22px', borderRadius: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.20)', color: '#7C3AED', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif' }}>
                + Add your first transaction
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
