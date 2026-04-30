import React, { useState, useEffect } from 'react'
import { transactions as txnApi } from '../api/client'

const fmt = n => '₹' + Math.abs(Number(n)).toLocaleString('en-IN')
const FILTERS = ['All', 'Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Utilities']
const CAT_COLORS = {
  'Food & Dining': '#059669',
  'Transport':     '#0D9488',
  'Shopping':      '#2563EB',
  'Entertainment': '#DC2626',
  'Utilities':     '#D97706',
  'Health':        '#7C3AED',
  'Misc':          '#64748B',
}

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
      <div className="orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle,rgba(5,150,105,0.06),transparent)', top: -50, right: -50 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="fade-up" style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 600 }}>This month</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>Transactions</h1>
        </div>

        <div className="fade-up" style={{ marginBottom: 16, animationDelay: '60ms' }}>
          <input className="input-field" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..." style={{ marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                fontSize: 12, padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
                background: filter === f ? 'linear-gradient(135deg,#059669,#0D9488)' : '#fff',
                border: filter === f ? 'none' : '1px solid var(--rim)',
                color: filter === f ? '#fff' : 'var(--muted)',
                fontWeight: filter === f ? 600 : 400,
                transition: 'all 0.2s',
                boxShadow: filter === f ? '0 4px 14px rgba(5,150,105,0.25)' : 'none',
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
              padding: '14px 18px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--rim)' : 'none',
              transition: 'background 0.15s', animationDelay: `${i * 35}ms`,
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(5,150,105,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  background: t.category?.name ? `${CAT_COLORS[t.category.name] || '#059669'}12` : 'rgba(5,150,105,0.07)',
                  border: `1px solid ${t.category?.name ? `${CAT_COLORS[t.category.name] || '#059669'}25` : 'var(--rim)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  {t.category?.icon || '💳'}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{t.merchant || 'Unknown'}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t.category?.name && <span style={{ color: CAT_COLORS[t.category.name] || '#059669', fontWeight: 600 }}>{t.category.name}</span>}
                    {t.category?.name && <span style={{ color: 'var(--faint)' }}>·</span>}
                    {t.payment_method} · {t.txn_date}
                    {t.source === 'sms' && <span style={{ background: 'rgba(5,150,105,0.09)', color: '#059669', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>SMS</span>}
                    {t.is_recurring && <span style={{ background: 'rgba(5,150,105,0.09)', color: '#0D9488', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>Recurring</span>}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: t.amount > 0 ? '#059669' : 'var(--text)' }}>
                  {t.amount > 0 ? '+' : '−'}{fmt(t.amount)}
                </p>
                <button onClick={() => del(t.id)} style={{
                  width: 28, height: 28, borderRadius: 8, background: 'transparent', border: 'none',
                  color: 'var(--faint)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', opacity: 0, cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--rose)'; e.currentTarget.style.background = 'var(--rose2)'; e.currentTarget.style.opacity = '1' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--faint)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0' }}>
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
