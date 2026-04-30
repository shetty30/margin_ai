// Transactions.jsx
import React, { useState, useEffect } from 'react'
import { transactions as txnApi } from '../api/client'

const fmt = n => '₹' + Math.abs(Number(n)).toLocaleString('en-IN')
const FILTERS = ['All', 'Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Utilities']
const CAT_COLORS = { 'Food & Dining': '#7c6cf0', 'Transport': '#5b7ef5', 'Shopping': '#00d4aa', 'Entertainment': '#f25c7a', 'Utilities': '#f5a623', 'Health': '#a99cf5', 'Misc': '#636e72' }

export default function Transactions() {
  const [data, setData] = useState([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const now = new Date()

  useEffect(() => {
    txnApi.list(now.getFullYear(), now.getMonth() + 1).then(r => setData(r.data)).catch(() => {})
  }, [])

  const del = async (id) => { await txnApi.delete(id); setData(d => d.filter(t => t.id !== id)) }

  const filtered = data.filter(t => {
    const matchFilter = filter === 'All' || t.category?.name === filter
    const matchSearch = !search || t.merchant?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div style={{ padding: 28, maxWidth: 800 }}>
      <div className="orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle,rgba(91,126,245,0.07),transparent)', top: -50, right: -50 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="fade-up" style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>This month</p>
          <h1 className="syne" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px' }}>Transactions</h1>
        </div>

        <div className="fade-up" style={{ marginBottom: 16, animationDelay: '60ms' }}>
          <input className="input-field" value={search} onChange={e => setSearch(e.target.value)}
            placeholder='Search transactions...' style={{ marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                fontSize: 12, padding: '5px 14px', borderRadius: 20,
                background: filter === f ? 'linear-gradient(135deg,var(--violet),var(--indigo))' : 'var(--glass)',
                border: filter === f ? 'none' : '0.5px solid var(--rim)',
                color: filter === f ? '#fff' : 'var(--muted)', transition: 'all 0.2s',
                boxShadow: filter === f ? '0 4px 14px rgba(124,108,240,0.3)' : 'none',
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="card fade-up" style={{ overflow: 'hidden', animationDelay: '120ms' }}>
          {filtered.length > 0 ? filtered.map((t, i) => (
            <div key={t.id} className="slide-right" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: i < filtered.length - 1 ? '0.5px solid var(--rim)' : 'none',
              transition: 'background 0.15s', animationDelay: `${i * 35}ms`,
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  background: t.category?.name ? `${CAT_COLORS[t.category.name] || '#7c6cf0'}18` : 'var(--glass2)',
                  border: `0.5px solid ${t.category?.name ? `${CAT_COLORS[t.category.name] || '#7c6cf0'}30` : 'var(--rim)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  {t.category?.icon || '💳'}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{t.merchant || 'Unknown'}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t.category?.name && <span style={{ color: CAT_COLORS[t.category.name] || 'var(--muted)' }}>{t.category.name}</span>}
                    {t.category?.name && <span style={{ color: 'var(--rim2)' }}>·</span>}
                    {t.payment_method} · {t.txn_date}
                    {t.source === 'sms' && <span style={{ background: 'var(--teal2)', color: 'var(--teal)', padding: '1px 6px', borderRadius: 4, fontSize: 10 }}>SMS</span>}
                    {t.is_recurring && <span style={{ background: 'var(--violet3)', color: 'var(--violet2)', padding: '1px 6px', borderRadius: 4, fontSize: 10 }}>Recurring</span>}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: t.amount > 0 ? 'var(--teal)' : 'var(--text)', fontFamily: 'Syne' }}>
                  {t.amount > 0 ? '+' : '−'}{fmt(t.amount)}
                </p>
                <button onClick={() => del(t.id)} style={{
                  width: 28, height: 28, borderRadius: 8, background: 'transparent', border: 'none',
                  color: 'var(--rim2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', opacity: 0,
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--rose)'; e.currentTarget.style.background = 'var(--rose2)'; e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--rim2)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0' }}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M4 6h12M8 6V4h4v2M7 10v5M13 10v5M5 6l1 11h8l1-11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          )) : (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
              {search ? 'No results found' : 'No transactions yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
