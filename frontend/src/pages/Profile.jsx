import React, { useState, useEffect, useRef } from 'react'
import { profile as profileApi } from '../api/client'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')

export default function Profile() {
  const [user,          setUser]          = useState(null)
  const [editing,       setEditing]       = useState(false)
  const [form,          setForm]          = useState({})
  const [saving,        setSaving]        = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [toast,         setToast]         = useState('')
  const fileRef = useRef()

  useEffect(() => { profileApi.me().then(r => { setUser(r.data); setForm(r.data) }).catch(() => {}) }, [])

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await profileApi.update({ name: form.name, bio: form.bio, phone: form.phone, city: form.city, occupation: form.occupation, monthly_income: parseFloat(form.monthly_income) || 0, savings_target: parseFloat(form.savings_target) || 0 })
      setUser(data); setEditing(false); showToast('Profile updated ✓')
    } catch (e) { showToast(e.response?.data?.detail || 'Error saving') }
    finally { setSaving(false) }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setAvatarLoading(true)
    try {
      const { data } = await profileApi.uploadAvatar(file)
      setUser(u => ({ ...u, avatar_url: data.avatar_url })); showToast('Photo updated ✓')
    } catch (e) { showToast(e.response?.data?.detail || 'Upload failed') }
    finally { setAvatarLoading(false) }
  }

  if (!user) return (
    <div style={{ padding: 32 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, marginBottom: 14 }} />)}
    </div>
  )

  const initials    = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const budget      = user.monthly_income - user.savings_target
  const savingsRate = user.monthly_income > 0 ? Math.round(user.savings_target / user.monthly_income * 100) : 0

  const inp = { width: '100%', padding: '11px 13px', background: '#F4F2FF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 13, color: '#18181B', fontFamily: 'Urbanist,sans-serif', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }
  const onF = e => { e.target.style.borderColor='rgba(124,58,237,0.50)'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.10)' }
  const onB = e => { e.target.style.borderColor='rgba(0,0,0,0.08)'; e.target.style.boxShadow='none' }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 740 }}>

      {toast && (
        <div className="scale-in" style={{ position: 'fixed', top: 24, right: 24, background: '#fff', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 14, padding: '13px 22px', fontSize: 13, fontWeight: 700, color: '#7C3AED', zIndex: 1000, boxShadow: '0 8px 32px rgba(124,58,237,0.15)' }}>
          ✓ {toast}
        </div>
      )}

      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#18181B', letterSpacing: '-1px' }}>Profile</h1>
      </div>

      {/* Profile card */}
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
            <button onClick={() => fileRef.current?.click()} disabled={avatarLoading} style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%', background: '#7C3AED', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,0.30)' }}>
              {avatarLoading
                ? <div style={{ width: 10, height: 10, border: '1.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                : <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M14 4l2 2-10 10H4v-2L14 4z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatar} />
          </div>

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

      {/* Financial profile */}
      <div className="card fade-up" style={{ padding: 26, marginBottom: 16, animationDelay: '100ms' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#18181B' }}>Financial profile</h3>
          <span className="pill pill-violet">{savingsRate}% savings rate</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Monthly income',  value: editing ? null : fmt(user.monthly_income), field: 'monthly_income', color: '#7C3AED' },
            { label: 'Savings target',  value: editing ? null : fmt(user.savings_target), field: 'savings_target', color: '#059669' },
            { label: 'Your margin',     value: fmt(budget), field: null, color: '#2563EB' },
          ].map(s => (
            <div key={s.label} style={{ background: '#F4F2FF', borderRadius: 14, padding: '16px', textAlign: 'center', border: '1px solid rgba(124,58,237,0.08)' }}>
              <p style={{ fontSize: 10, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, fontWeight: 700 }}>{s.label}</p>
              {editing && s.field
                ? <input type="number" value={form[s.field] || ''} onChange={e => setForm({ ...form, [s.field]: e.target.value })} style={{ background: 'transparent', border: 'none', borderBottom: `2px solid ${s.color}`, outline: 'none', fontSize: 17, fontWeight: 800, color: s.color, textAlign: 'center', width: '100%', paddingBottom: 4, fontFamily: 'Urbanist,sans-serif' }} />
                : <p style={{ fontSize: 19, fontWeight: 900, color: s.color, letterSpacing: '-0.3px' }}>{s.value}</p>
              }
            </div>
          ))}
        </div>
        <div style={{ height: 6, background: '#EDE9FE', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#7C3AED,#A78BFA)', borderRadius: 3, width: `${Math.min(savingsRate / 30 * 100, 100)}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#A1A1AA', fontWeight: 600 }}>
          <span>0%</span><span>Target 25%</span><span>30%+</span>
        </div>
      </div>

      {/* Account info */}
      <div className="card fade-up" style={{ padding: 22, animationDelay: '150ms' }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#18181B', marginBottom: 18 }}>Account details</h3>
        {[
          { label: 'Member since', value: new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
          { label: 'AI stack',     value: 'Groq llama-3.1-8b + Gemini 2.0 Flash' },
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
