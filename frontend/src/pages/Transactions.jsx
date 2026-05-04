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
        amount: -Math.abs(parseFloat(form.amount)),   // expenses are negative
        merchant:        form.merchant || null,
        category_id:     form.category_id ? Number(form.category_id) : null,
        payment_method:  form.payment_method,
        txn_date:        form.txn_date,
        is_recurring:    form.is_recurring,
        note:            form.note || null,
        source:          'manual',
      }
      const { data } = await txnApi.create(payload)
      onAdded(data)
      onClose()
    } catch (e) {
      setErr(e.response?.data?.detail || 'Failed to save')
    } finally { setSaving(false) }
  }

  /* backdrop click closes */
  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(10,22,40,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="scale-in" style={{ background:'#fff', borderRadius:24, padding:32, width:'100%', maxWidth:480, boxShadow:'0 24px 80px rgba(0,0,0,0.18)' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.5px' }}>Add Transaction</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:10, border:'1px solid var(--rim)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)' }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Amount — most important, shown big */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Amount (₹)</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:20, color:'var(--muted)', fontWeight:300 }}>₹</span>
              <input
                ref={amtRef}
                type="number" min="0.01" step="0.01"
                value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="0.00"
                style={{ paddingLeft:36, fontSize:24, fontWeight:700, height:60, width:'100%', background:'#fff', border:'1px solid var(--rim)', borderRadius:12, color:'var(--text)', outline:'none' }}
                onFocus={e => e.target.style.borderColor='rgba(5,150,105,0.5)'}
                onBlur={e  => e.target.style.borderColor='var(--rim)'}
              />
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Merchant / Description</label>
            <input className="input-field" value={form.merchant} onChange={e => set('merchant', e.target.value)} placeholder="Swiggy, Amazon, Rent…" />
          </div>

          {/* Category + Payment method side by side */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Category</label>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:'1px solid var(--rim)', fontSize:13, color:'var(--text)', background:'#fff', cursor:'pointer', outline:'none' }}>
                <option value="">— pick —</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Payment</label>
              <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)} style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:'1px solid var(--rim)', fontSize:13, color:'var(--text)', background:'#fff', cursor:'pointer', outline:'none' }}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Date</label>
            <input type="date" className="input-field" value={form.txn_date} onChange={e => set('txn_date', e.target.value)} style={{ cursor:'pointer' }} />
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:6 }}>Note <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
            <input className="input-field" value={form.note} onChange={e => set('note', e.target.value)} placeholder="Any note…" />
          </div>

          {/* Recurring toggle */}
          <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none' }}>
            <div onClick={() => set('is_recurring', !form.is_recurring)} style={{
              width:44, height:24, borderRadius:12, background:form.is_recurring?'#059669':'rgba(0,0,0,0.12)',
              position:'relative', transition:'background 0.2s', cursor:'pointer', flexShrink:0,
            }}>
              <div style={{ position:'absolute', top:2, left:form.is_recurring?22:2, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
            <span style={{ fontSize:13, color:'var(--muted)', fontWeight:500 }}>Recurring monthly</span>
          </label>

          {err && <div style={{ background:'rgba(220,38,38,0.06)', border:'1px solid rgba(220,38,38,0.2)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#DC2626' }}>{err}</div>}

          <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop:4, padding:'14px', fontSize:15 }}>
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

  const del    = async (id) => { await txnApi.delete(id); setData(d => d.filter(t => t.id !== id)) }
  const onAdd  = (txn) => setData(d => [txn, ...d])

  const filtered = data.filter(t => {
    const matchFilter = filter === 'All' || t.category?.name === filter
    const matchSearch = !search || t.merchant?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const totalSpent = data.reduce((s, t) => s + (t.amount < 0 ? Math.abs(t.amount) : 0), 0)

  return (
    <div style={{ padding:28, maxWidth:800 }}>
      {modal && <AddModal cats={cats} onClose={() => setModal(false)} onAdded={onAdd} />}

      <div style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <p style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:4, fontWeight:600 }}>
              This month · {fmt(totalSpent)} spent
            </p>
            <h1 style={{ fontSize:32, fontWeight:800, letterSpacing:'-1px' }}>Transactions</h1>
          </div>
          <button
            onClick={() => setModal(true)}
            className="btn-primary"
            style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 20px', fontSize:13, borderRadius:12 }}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            Add Transaction
          </button>
        </div>

        {/* Search + Filters */}
        <div className="fade-up" style={{ marginBottom:16, animationDelay:'60ms' }}>
          <input
            className="input-field" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by merchant…" style={{ marginBottom:12 }}
          />
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                fontSize:12, padding:'5px 14px', borderRadius:20, cursor:'pointer',
                background: filter===f ? 'linear-gradient(135deg,#059669,#0D9488)' : '#fff',
                border:     filter===f ? 'none' : '1px solid var(--rim)',
                color:      filter===f ? '#fff' : 'var(--muted)',
                fontWeight: filter===f ? 600 : 400,
                transition: 'all 0.2s',
                boxShadow:  filter===f ? '0 4px 14px rgba(5,150,105,0.25)' : 'none',
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction list */}
        <div className="card fade-up" style={{ overflow:'hidden', animationDelay:'120ms' }}>
          {filtered.length > 0 ? filtered.map((t, i) => {
            const col = CAT_COLORS[t.category?.name] || '#059669'
            return (
              <div
                key={t.id} className="slide-right"
                style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'14px 18px',
                  borderBottom: i < filtered.length-1 ? '1px solid var(--rim)' : 'none',
                  transition:'background 0.15s', animationDelay:`${i*35}ms`,
                }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(5,150,105,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{
                    width:40, height:40, borderRadius:13, flexShrink:0,
                    background:`${col}14`,
                    border:`1px solid ${col}28`,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:17,
                  }}>
                    {t.category?.icon || '💳'}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:2 }}>{t.merchant || 'Unknown'}</p>
                    <p style={{ fontSize:11, color:'var(--muted)', display:'flex', alignItems:'center', gap:6 }}>
                      {t.category?.name && <span style={{ color:col, fontWeight:600 }}>{t.category.name}</span>}
                      {t.category?.name && <span style={{ color:'var(--faint)' }}>·</span>}
                      {t.payment_method} · {t.txn_date}
                      {t.source==='sms'   && <span style={{ background:'rgba(5,150,105,0.09)', color:'#059669', padding:'1px 6px', borderRadius:4, fontSize:10, fontWeight:600 }}>SMS</span>}
                      {t.is_recurring     && <span style={{ background:'rgba(13,148,136,0.09)', color:'#0D9488', padding:'1px 6px', borderRadius:4, fontSize:10, fontWeight:600 }}>Recurring</span>}
                    </p>
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:t.amount>0?'#059669':'var(--text)' }}>
                    {t.amount>0?'+':'−'}{fmt(t.amount)}
                  </p>
                  <button
                    onClick={() => del(t.id)}
                    style={{ width:28, height:28, borderRadius:8, background:'transparent', border:'none', color:'var(--faint)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', opacity:0, cursor:'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.color='var(--rose)'; e.currentTarget.style.background='var(--rose2)'; e.currentTarget.style.opacity='1' }}
                    onMouseLeave={e => { e.currentTarget.style.color='var(--faint)'; e.currentTarget.style.background='transparent'; e.currentTarget.style.opacity='0' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M4 6h12M8 6V4h4v2M7 10v5M13 10v5M5 6l1 11h8l1-11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
            )
          }) : (
            <div style={{ padding:'48px 0', textAlign:'center' }}>
              <p style={{ fontSize:32, marginBottom:8 }}>💳</p>
              <p style={{ color:'var(--faint)', fontSize:14, fontWeight:500 }}>{search ? 'No results found' : 'No transactions yet'}</p>
              {!search && (
                <button onClick={() => setModal(true)} style={{ marginTop:16, padding:'10px 20px', borderRadius:12, background:'rgba(5,150,105,0.08)', border:'1px solid rgba(5,150,105,0.2)', color:'#059669', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  + Add your first transaction
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
