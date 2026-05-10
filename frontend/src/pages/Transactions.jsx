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

/* ─────────────────────────────────────────────────────────────────
   Add / SMS Modal — two tabs: Manual | Paste SMS
───────────────────────────────────────────────────────────────── */
function AddModal({ cats, onClose, onAdded }) {
  const [tab,    setTab]    = useState('manual')   // 'manual' | 'sms'

  /* Manual form state */
  const [form,   setForm]   = useState({ merchant: '', amount: '', category_id: '', payment_method: 'UPI', txn_date: today(), is_recurring: false, note: '' })
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')
  const amtRef = useRef()
  useEffect(() => { if (tab === 'manual') amtRef.current?.focus() }, [tab])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  /* SMS parser state */
  const [smsText,   setSmsText]   = useState('')
  const [parsing,   setParsing]   = useState(false)
  const [parsed,    setParsed]    = useState(null)    // result from API
  const [smsErr,    setSmsErr]    = useState('')
  const [smsDate,   setSmsDate]   = useState(today())
  const [smsSaving, setSmsSaving] = useState(false)
  const smsRef = useRef()
  useEffect(() => { if (tab === 'sms') smsRef.current?.focus() }, [tab])

  const field = {
    width: '100%', padding: '12px 14px',
    background: '#F4F2FF', border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12, fontSize: 14, color: '#18181B',
    fontFamily: 'Urbanist,sans-serif', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const onF = e => { e.target.style.borderColor='rgba(124,58,237,0.50)'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.10)' }
  const onB = e => { e.target.style.borderColor='rgba(0,0,0,0.08)'; e.target.style.boxShadow='none' }

  /* ── Submit manual ── */
  const submitManual = async (e) => {
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

  /* ── Parse SMS ── */
  const parseSMS = async () => {
    if (!smsText.trim()) { setSmsErr('Paste a bank SMS first'); return }
    setParsing(true); setSmsErr(''); setParsed(null)
    try {
      const { data } = await txnApi.parseSMS(smsText.trim())
      if (!data.parsed) {
        setSmsErr("Couldn't extract transaction details — try a debit/UPI SMS from your bank.")
        return
      }
      setParsed(data)
    } catch { setSmsErr('Parsing failed. Check your backend is running.') }
    finally { setParsing(false) }
  }

  /* ── Save parsed SMS transaction ── */
  const saveParsed = async () => {
    if (!parsed) return
    setSmsSaving(true); setSmsErr('')
    try {
      // Find category id from name
      const catMatch = cats.find(c => c.name === parsed.category)
      const { data } = await txnApi.create({
        amount:         -Math.abs(parseFloat(parsed.amount)),
        merchant:       parsed.merchant || null,
        category_id:    catMatch?.id || null,
        payment_method: parsed.payment_method || 'UPI',
        txn_date:       smsDate,
        is_recurring:   false,
        note:           null,
        source:         'sms',
      })
      onAdded(data); onClose()
    } catch (e) { setSmsErr(e.response?.data?.detail || 'Failed to save') }
    finally { setSmsSaving(false) }
  }

  const catColor = parsed ? getCatColor(parsed.category) : {}

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.30)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="scale-in" style={{ background: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 500, boxShadow: '0 24px 80px rgba(124,58,237,0.16)', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#18181B', letterSpacing: '-0.5px' }}>Add Transaction</h2>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717A', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#EF4444' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#71717A' }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, background: '#F4F2FF', borderRadius: 14, padding: 4, marginBottom: 24 }}>
          {[
            { id: 'manual', label: 'Manual entry', icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            )},
            { id: 'sms', label: 'Paste bank SMS', icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
            )},
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setErr(''); setSmsErr('') }} style={{
              flex: 1, padding: '10px 12px', borderRadius: 11, border: 'none', cursor: 'pointer',
              fontFamily: 'Urbanist,sans-serif', fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transition: 'all 0.18s',
              background: tab === t.id ? '#7C3AED' : 'transparent',
              color:      tab === t.id ? '#fff'    : '#71717A',
              boxShadow:  tab === t.id ? '0 3px 12px rgba(124,58,237,0.28)' : 'none',
            }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ══ MANUAL TAB ══ */}
        {tab === 'manual' && (
          <form onSubmit={submitManual} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
        )}

        {/* ══ SMS TAB ══ */}
        {tab === 'sms' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* How-to hint */}
            <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.14)', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1, color: '#7C3AED' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', marginBottom: 3 }}>How to use</p>
                <p style={{ fontSize: 11, color: '#71717A', lineHeight: 1.6 }}>
                  Open your bank SMS app → copy a debit/UPI message → paste it below. The AI will extract the amount, merchant, and category automatically.
                </p>
              </div>
            </div>

            {/* SMS paste area */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 7 }}>Bank SMS text</label>
              <textarea
                ref={smsRef}
                value={smsText}
                onChange={e => { setSmsText(e.target.value); setParsed(null); setSmsErr('') }}
                placeholder={'Paste your bank SMS here…\n\nExample:\nINR 1500.00 debited from your account ending 4321 to Swiggy via UPI on 10-05-2026'}
                rows={5}
                style={{ ...field, resize: 'vertical', lineHeight: 1.6, fontSize: 13 }}
                onFocus={onF} onBlur={onB}
              />
            </div>

            {/* Parse button */}
            {!parsed && (
              <button onClick={parseSMS} disabled={parsing || !smsText.trim()} className="btn-primary" style={{ padding: '13px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {parsing ? (
                  <>
                    <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    Parsing…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L13.4 8.6L20 10L13.4 11.4L12 18L10.6 11.4L4 10L10.6 8.6L12 2Z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Parse with AI
                  </>
                )}
              </button>
            )}

            {/* Error */}
            {smsErr && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#EF4444' }}>
                {smsErr}
              </div>
            )}

            {/* ── Parsed result preview ── */}
            {parsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Success banner */}
                <div style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.20)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#059669" strokeWidth="1.8" strokeLinecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>Transaction extracted successfully</p>
                </div>

                {/* Extracted data card */}
                <div style={{ background: '#F4F2FF', borderRadius: 16, padding: '18px 20px', border: '1px solid rgba(124,58,237,0.10)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                    {/* Amount */}
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Amount</p>
                      <p style={{ fontSize: 22, fontWeight: 900, color: '#EF4444', letterSpacing: '-0.5px' }}>−{fmt(parsed.amount)}</p>
                    </div>

                    {/* Category */}
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Category</p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: catColor.light, color: catColor.bg, padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {parsed.category}
                      </span>
                    </div>

                    {/* Merchant */}
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Merchant</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#18181B' }}>{parsed.merchant || '—'}</p>
                    </div>

                    {/* Payment method */}
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Via</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#18181B' }}>{parsed.payment_method}</p>
                    </div>
                  </div>
                </div>

                {/* Date picker (SMS often has no year, let user confirm) */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 7 }}>Confirm transaction date</label>
                  <input type="date" value={smsDate} onChange={e => setSmsDate(e.target.value)}
                    style={{ ...field, colorScheme: 'light', cursor: 'pointer' }} onFocus={onF} onBlur={onB} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setParsed(null); setSmsText('') }} style={{ flex: 1, padding: '12px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.10)', background: 'transparent', fontSize: 13, fontWeight: 700, color: '#71717A', cursor: 'pointer', fontFamily: 'Urbanist,sans-serif' }}>
                    Parse another
                  </button>
                  <button onClick={saveParsed} disabled={smsSaving} className="btn-primary" style={{ flex: 2, padding: '12px', fontSize: 14 }}>
                    {smsSaving ? 'Saving…' : 'Save Transaction'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Main Transactions page
───────────────────────────────────────────────────────────────── */
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
        <div style={{ display: 'flex', gap: 10 }}>
          {/* SMS quick-launch */}
          <button onClick={() => setModal(true)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '11px 18px', borderRadius: 14, fontSize: 13, fontWeight: 700,
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.20)',
            color: '#7C3AED', cursor: 'pointer', fontFamily: 'Urbanist,sans-serif',
            transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.14)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(124,58,237,0.08)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
            Import SMS
          </button>
          <button onClick={() => setModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
            Add Transaction
          </button>
        </div>
      </div>

      {/* Search + filter */}
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

      {/* Transactions list */}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#18181B' }}>{t.merchant || 'Unknown'}</p>
                    {t.source === 'sms' && (
                      <span style={{ fontSize: 9, fontWeight: 800, background: 'rgba(124,58,237,0.10)', color: '#7C3AED', padding: '2px 6px', borderRadius: 5, letterSpacing: '0.4px' }}>SMS</span>
                    )}
                  </div>
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
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 6l4-4 4 4M16 18l-4 4-4-4M12 2v20" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p style={{ color: '#18181B', fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{search ? 'No results found' : 'No transactions yet'}</p>
            <p style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 18 }}>{search ? 'Try a different search' : 'Add manually or paste a bank SMS to get started'}</p>
            {!search && (
              <button onClick={() => setModal(true)} style={{ padding: '10px 22px', borderRadius: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.20)', color: '#7C3AED', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Urbanist,sans-serif' }}>
                + Add your first transaction
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
