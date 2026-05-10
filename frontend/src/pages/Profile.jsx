import React, { useState, useEffect, useRef } from 'react'
import { profile as profileApi, income as incomeApi } from '../api/client'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')

export default function Profile() {
  const [user,          setUser]          = useState(null)
  const [editing,       setEditing]       = useState(false)
  const [form,          setForm]          = useState({})
  const [saving,        setSaving]        = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [toast,         setToast]         = useState('')
  const [actualIncome,  setActualIncome]  = useState(0)
  const fileRef = useRef()

  const now = new Date()

  useEffect(() => {
    profileApi.me()
      .then(r => { setUser(r.data); setForm(r.data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    incomeApi.list(now.getFullYear(), now.getMonth() + 1)
      .then(r => setActualIncome(r.data.reduce((s, t) => s + parseFloat(t.amount), 0)))
      .catch(() => {})
  }, [])

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        name:           form.name,
        bio:            form.bio,
        phone:          form.phone,
        city:           form.city,
        occupation:     form.occupation,
        monthly_income: parseFloat(form.monthly_income) || 0,
        savings_target: parseFloat(form.savings_target) || 0,
      }
      const { data } = await profileApi.update(payload)
      setUser(data); setForm(data); setEditing(false); showToast('Profile updated')
    } catch (e) { showToast(e.response?.data?.detail || 'Error saving') }
    finally { setSaving(false) }
  }

  // Sync planned income from actual transactions
  const syncIncome = async () => {
    if (!actualIncome) return
    setSaving(true)
    try {
      const { data } = await profileApi.update({ monthly_income: actualIncome })
      setUser(data); setForm(f => ({ ...f, monthly_income: actualIncome }))
      showToast('Income synced from transactions')
    } catch { showToast('Sync failed') }
    finally { setSaving(false) }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setAvatarLoading(true)
    try {
      const { data } = await profileApi.uploadAvatar(file)
      setUser(u => ({ ...u, avatar_url: data.avatar_url })); showToast('Photo updated')
    } catch (e) { showToast(e.response?.data?.detail || 'Upload failed') }
    finally { setAvatarLoading(false) }
  }

  if (!user) return (
    <div style={{ padding: 32 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, marginBottom: 14 }} />)}
    </div>
  )

  const initials     = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const displayIncome = actualIncome > 0 ? actualIncome : (user.monthly_income || 0)
  const budget        = displayIncome - (user.savings_target || 0)
  const savingsRate   = displayIncome > 0 ? Math.round((user.savings_target || 0) / displayIncome * 100) : 0

  const inp = {
    width: '100%', padding: '11px 13px',
    background: '#F4F2FF', border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12, fontSize: 13, color: '#18181B',
    fontFamily: 'Urbanist,sans-serif', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const onF = e => { e.target.style.borderColor='rgba(124,58,237,0.50)'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.10)' }
  const onB = e => { e.target.style.borderColor='rgba(0,0,0,0.08)'; e.target.style.boxShadow='none' }

  const memberSince = (() => {
    try { return new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) }
    catch { return '—' }
  })()

  return (
    <div style={{ padding: '28px 32px', maxWidth: 740 }}>

      {/* Toast */}
      {toast && (
        <div className="scale-in" style={{ position: 'fixed', top: 24, right: 24, background: '#fff', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 14, padding: '13px 22px', fontSize: 13, fontWeight: 700, color: '#7C3AED', zIndex: 1000, boxShadow: '0 8px 32px rgba(124,58,237,0.15)' }}>
          {toast}
        </div>
      )}

      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#18181B', letterSpacing: '-1px' }}>Profile</h1>
      </div>

      {/* ── Profile card ──────────────────────────────────── */}
      <div className="card fade-up" style={{ padding: 28, marginBottom: 16, animationDelay: '50ms' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22 }}>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 82, height: 82, borderRadius: 22, overflow: 'hidden', border: '2.5px solid rgba(124,58,237,0.25)', boxShadow: '0 0 0 4px rgba(124,58,237,0.08)' }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff' }}>{initials}</div>
              }
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={avatarLoading} style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: '#7C3AED', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,0.30)' }}>
              {avatarLoading
                ? <div style={{ width: 10, height: 10, border: '1.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                : <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M14 4l2 2-10 10H4v-2L14 4z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatar} />
          </div>

          {/* Name & fields */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing
              ? <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} style={{ background: 'transparent', border: 'none', borderBottom: '2px solid #7C3AED', outline: 'none', fontSize: 22, fontWeight: 800, color: '#18181B', marginBottom: 4, width: '100%', paddingBottom: 4, fontFamily: 'Urbanist,sans-serif' }} />
              : <h2 style={{ fontSize: 24, fontWeight: 800, color: '#18181B', marginBottom: 4, letterSpacing: '-0.4px' }}>{user.name}</h2>
            }
            <p style={{ fontSize: 13, color: '#A1A1AA', marginBottom: 4, fontWeight: 500 }}>{user.email}</p>
            {!editing && user.occupation && <p style={{ fontSize: 13, color: '#71717A', fontWeight: 500 }}>{user.occupation}{user.city ? ` · ${user.city}` : ''}</p>}
            {editing && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                {[['occupation','Occupation'],['city','City'],['phone','Phone'],['bio','Bio']].map(([k,pl]) => (
                  <input key={k} style={inp} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={pl} onFocus={onF} onBlur={onB} />
                ))}
              </div>
            )}
          </div>

          {/* Edit / Save buttons */}
          <div style={{ flexShrink: 0, display: 'flex', gap: 8 }}>
            {editing ? (
              <>
                <button onClick={save} disabled={saving} className="btn-primary" style={{ padding: '9px 18px', fontSize: 13 }}>{saving ? '…' : 'Save'}</button>
                <button onClick={() => { setEditing(false); setForm(user) }} style={{ padding: '9px 14px', fontSize: 13, borderRadius: 12, background: 'transparent', border: '1px solid rgba(0,0,0,0.10)', color: '#71717A', cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontWeight: 600 }}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(124,58,237,0.08)'}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M14 4l2 2-10 10H4v-2L14 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Financial profile ─────────────────────────────── */}
      <div className="card fade-up" style={{ padding: 26, marginBottom: 16, animationDelay: '100ms' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#18181B' }}>Financial profile</h3>
            <p style={{ fontSize: 11, color: '#A1A1AA', marginTop: 3, fontWeight: 500 }}>
              {actualIncome > 0 ? 'Income synced from your transactions this month' : 'Set your planned income and savings target'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Sync button — only when actual income exists and differs from profile */}
            {actualIncome > 0 && actualIncome !== (user.monthly_income || 0) && !editing && (
              <button onClick={syncIncome} disabled={saving} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: 'rgba(5,150,105,0.10)', color: '#059669',
                border: '1px solid rgba(5,150,105,0.25)', cursor: 'pointer',
                fontFamily: 'Urbanist,sans-serif', transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(5,150,105,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(5,150,105,0.10)'}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M4 4v6h6M20 20v-6h-6M20 10A8 8 0 004 14M4 14a8 8 0 0016-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Sync from transactions
              </button>
            )}
            <span className="pill pill-violet">{savingsRate}% savings rate</span>
          </div>
        </div>

        {/* 3 stat boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>

          {/* Actual income — always read-only, pulled from transactions */}
          <div style={{ background: '#F4F2FF', borderRadius: 14, padding: '16px', textAlign: 'center', border: '1px solid rgba(124,58,237,0.08)', position: 'relative' }}>
            <p style={{ fontSize: 10, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6, fontWeight: 700 }}>Monthly income</p>
            <p style={{ fontSize: 19, fontWeight: 900, color: '#7C3AED', letterSpacing: '-0.3px', marginBottom: 4 }}>{fmt(displayIncome)}</p>
            <p style={{ fontSize: 10, color: actualIncome > 0 ? '#059669' : '#A1A1AA', fontWeight: 600 }}>
              {actualIncome > 0 ? 'from Income page' : 'add via Income page'}
            </p>
          </div>

          {/* Savings target — editable */}
          <div style={{ background: '#F4F2FF', borderRadius: 14, padding: '16px', textAlign: 'center', border: '1px solid rgba(124,58,237,0.08)' }}>
            <p style={{ fontSize: 10, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6, fontWeight: 700 }}>Savings target</p>
            {editing
              ? <input type="number" value={form.savings_target ?? ''} onChange={e => setForm({ ...form, savings_target: e.target.value })}
                  style={{ background: 'transparent', border: 'none', borderBottom: '2px solid #059669', outline: 'none', fontSize: 17, fontWeight: 800, color: '#059669', textAlign: 'center', width: '100%', paddingBottom: 4, fontFamily: 'Urbanist,sans-serif' }} />
              : <p style={{ fontSize: 19, fontWeight: 900, color: '#059669', letterSpacing: '-0.3px' }}>{fmt(user.savings_target || 0)}</p>
            }
            <p style={{ fontSize: 10, color: '#A1A1AA', fontWeight: 600, marginTop: 4 }}>per month</p>
          </div>

          {/* Margin — computed */}
          <div style={{ background: budget >= 0 ? '#F0FDF4' : '#FEF2F2', borderRadius: 14, padding: '16px', textAlign: 'center', border: `1px solid ${budget >= 0 ? 'rgba(5,150,105,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
            <p style={{ fontSize: 10, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6, fontWeight: 700 }}>Your margin</p>
            <p style={{ fontSize: 19, fontWeight: 900, color: budget >= 0 ? '#2563EB' : '#EF4444', letterSpacing: '-0.3px' }}>{budget >= 0 ? '' : '−'}{fmt(Math.abs(budget))}</p>
            <p style={{ fontSize: 10, color: '#A1A1AA', fontWeight: 600, marginTop: 4 }}>to spend freely</p>
          </div>
        </div>

        {/* Savings rate bar */}
        <div style={{ height: 6, background: '#EDE9FE', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#7C3AED,#A78BFA)', borderRadius: 3, width: `${Math.min(savingsRate / 30 * 100, 100)}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#A1A1AA', fontWeight: 600 }}>
          <span>0%</span><span>Target 25%</span><span>30%+</span>
        </div>
      </div>

      {/* ── Account details ───────────────────────────────── */}
      <div className="card fade-up" style={{ padding: 22, animationDelay: '150ms' }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#18181B', marginBottom: 18 }}>Account details</h3>
        {[
          { label: 'Member since', value: memberSince },
          { label: 'AI stack',     value: 'Qwen2.5-7B-Instruct · DistilBERT NLI' },
          { label: 'Status',       value: user.onboarded ? '✓ Active' : 'Setup incomplete' },
        ].map((row, i) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
            <span style={{ fontSize: 13, color: '#71717A', fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontSize: 13, color: '#18181B', fontWeight: 700 }}>{row.value}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
