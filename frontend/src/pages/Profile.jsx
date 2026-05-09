import React, { useState, useEffect, useRef } from 'react'
import { profile as profileApi } from '../api/client'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')

const inputStyle = {
  width: '100%', padding: '12px 14px',
  background: '#242424', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, fontSize: 13, color: '#fff',
  fontFamily: 'Urbanist, sans-serif', outline: 'none', transition: 'border-color 0.2s',
}

export default function Profile() {
  const [user,          setUser]          = useState(null)
  const [editing,       setEditing]       = useState(false)
  const [form,          setForm]          = useState({})
  const [saving,        setSaving]        = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [toast,         setToast]         = useState('')
  const fileRef = useRef()

  useEffect(() => { profileApi.me().then(r => { setUser(r.data); setForm(r.data) }).catch(() => {}) }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await profileApi.update({
        name: form.name, bio: form.bio, phone: form.phone,
        city: form.city, occupation: form.occupation,
        monthly_income: parseFloat(form.monthly_income) || 0,
        savings_target: parseFloat(form.savings_target) || 0,
      })
      setUser(data); setEditing(false); showToast('Profile updated ✓')
    } catch (e) { showToast(e.response?.data?.detail || 'Error saving') }
    finally { setSaving(false) }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    try {
      const { data } = await profileApi.uploadAvatar(file)
      setUser(u => ({ ...u, avatar_url: data.avatar_url }))
      showToast('Photo updated ✓')
    } catch (e) { showToast(e.response?.data?.detail || 'Upload failed') }
    finally { setAvatarLoading(false) }
  }

  if (!user) return (
    <div style={{ padding: 28 }}>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 20, marginBottom: 12 }} />)}
    </div>
  )

  const initials    = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const budget      = user.monthly_income - user.savings_target
  const savingsRate = user.monthly_income > 0 ? Math.round(user.savings_target / user.monthly_income * 100) : 0

  return (
    <div style={{ padding: 28, maxWidth: 720 }}>

      {toast && (
        <div className="scale-in" style={{
          position: 'fixed', top: 24, right: 24,
          background: 'rgba(207,240,8,0.10)', border: '1px solid rgba(207,240,8,0.28)',
          borderRadius: 14, padding: '12px 20px', fontSize: 13, fontWeight: 700,
          color: '#CFF008', zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.30)',
        }}>
          {toast}
        </div>
      )}

      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1.5px', color: '#fff' }}>Profile</h1>
      </div>

      {/* Profile card */}
      <div className="card fade-up" style={{ padding: 28, marginBottom: 14, animationDelay: '60ms' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22 }}>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 84, height: 84, borderRadius: 24, overflow: 'hidden', border: '2px solid rgba(207,240,8,0.35)', boxShadow: '0 0 0 4px rgba(207,240,8,0.08)' }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: '#CFF008', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: '#131313' }}>{initials}</div>
              }
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={avatarLoading} style={{
              position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%',
              background: '#CFF008', border: '2px solid #131313',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 2px 8px rgba(207,240,8,0.30)',
            }}>
              {avatarLoading
                ? <div style={{ width: 10, height: 10, border: '1.5px solid rgba(19,19,19,0.3)', borderTopColor: '#131313', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                : <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M14 4l2 2-10 10H4v-2L14 4z" stroke="#131313" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatar} />
          </div>

          <div style={{ flex: 1 }}>
            {editing ? (
              <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(207,240,8,0.40)', outline: 'none', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4, width: '100%', paddingBottom: 4, fontFamily: 'Urbanist, sans-serif' }} />
            ) : (
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.5px' }}>{user.name}</h2>
            )}
            <p style={{ fontSize: 13, color: '#8F8F8F', marginBottom: 4, fontWeight: 500 }}>{user.email}</p>
            {!editing && user.occupation && <p style={{ fontSize: 13, color: '#5A5A5A', fontWeight: 500 }}>{user.occupation}{user.city ? ` · ${user.city}` : ''}</p>}
            {editing && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                <input style={inputStyle} value={form.occupation || ''} onChange={e => setForm({ ...form, occupation: e.target.value })} placeholder="Occupation"
                  onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.40)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                <input style={inputStyle} value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City"
                  onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.40)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                <input style={inputStyle} value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone"
                  onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.40)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                <input style={inputStyle} value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Bio"
                  onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.40)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {editing ? (
              <>
                <button onClick={save} disabled={saving} className="btn-primary" style={{ padding: '8px 18px', fontSize: 12 }}>
                  {saving ? '...' : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setForm(user) }} style={{
                  padding: '8px 14px', fontSize: 12, borderRadius: 12,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.10)',
                  color: '#8F8F8F', cursor: 'pointer', fontFamily: 'Urbanist, sans-serif', fontWeight: 600,
                }}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={{
                width: 38, height: 38, borderRadius: 12,
                background: 'rgba(207,240,8,0.08)',
                border: '1px solid rgba(207,240,8,0.20)', color: '#CFF008',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(207,240,8,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(207,240,8,0.08)'}>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M14 4l2 2-10 10H4v-2L14 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Financial profile */}
      <div className="card fade-up" style={{ padding: 26, marginBottom: 14, animationDelay: '120ms' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Financial profile</h3>
          <span className="pill pill-violet">{savingsRate}% savings rate</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Monthly income',  value: editing ? null : fmt(user.monthly_income), field: 'monthly_income', color: '#CFF008' },
            { label: 'Savings target',  value: editing ? null : fmt(user.savings_target), field: 'savings_target', color: '#22D3EE' },
            { label: 'Your margin',     value: fmt(budget), field: null, color: '#A78BFA' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(207,240,8,0.04)', borderRadius: 14, padding: '16px', textAlign: 'center', border: '1px solid rgba(207,240,8,0.08)' }}>
              <p style={{ fontSize: 10, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, fontWeight: 700 }}>{s.label}</p>
              {editing && s.field ? (
                <input type="number" value={form[s.field] || ''} onChange={e => setForm({ ...form, [s.field]: e.target.value })}
                  style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${s.color}40`, outline: 'none', fontSize: 16, fontWeight: 800, color: s.color, textAlign: 'center', width: '100%', paddingBottom: 4, fontFamily: 'Urbanist, sans-serif' }} />
              ) : (
                <p style={{ fontSize: 18, fontWeight: 900, color: s.color, letterSpacing: '-0.3px' }}>{s.value}</p>
              )}
            </div>
          ))}
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', background: '#CFF008', borderRadius: 2, width: `${Math.min(savingsRate / 30 * 100, 100)}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 6px rgba(207,240,8,0.40)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#5A5A5A', fontWeight: 600 }}>
          <span>0%</span><span>target 25%</span><span>30%+</span>
        </div>
      </div>

      {/* Account info */}
      <div className="card fade-up" style={{ padding: 22, animationDelay: '180ms' }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 18 }}>Account</h3>
        {[
          { label: 'Member since', value: new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
          { label: 'AI stack',     value: 'Groq llama-3.1-8b + Gemini 2.0 Flash' },
          { label: 'Status',       value: user.onboarded ? 'Active' : 'Setup incomplete' },
        ].map((row, i) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <span style={{ fontSize: 13, color: '#8F8F8F', fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{row.value}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
