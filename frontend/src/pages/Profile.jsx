import React, { useState, useEffect, useRef } from 'react'
import { profile as profileApi } from '../api/client'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')

export default function Profile() {
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [toast, setToast] = useState('')
  const fileRef = useRef()

  useEffect(() => { profileApi.me().then(r => { setUser(r.data); setForm(r.data) }).catch(() => {}) }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await profileApi.update({ name: form.name, bio: form.bio, phone: form.phone, city: form.city, occupation: form.occupation, monthly_income: parseFloat(form.monthly_income) || 0, savings_target: parseFloat(form.savings_target) || 0 })
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
      {[1, 2, 3].map(i => <div key={i} style={{ height: 120, background: 'var(--glass)', borderRadius: 16, border: '0.5px solid var(--rim)', marginBottom: 12 }} />)}
    </div>
  )

  const initials = user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const budget = user.monthly_income - user.savings_target
  const savingsRate = user.monthly_income > 0 ? Math.round(user.savings_target / user.monthly_income * 100) : 0

  return (
    <div style={{ padding: 28, maxWidth: 720, position: 'relative' }}>
      <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(0,212,170,0.06),transparent)', top: -100, right: -80 }} />

      {toast && (
        <div className="scale-in" style={{ position: 'fixed', top: 24, right: 24, background: 'rgba(0,212,170,0.15)', border: '0.5px solid rgba(0,212,170,0.3)', borderRadius: 12, padding: '12px 20px', fontSize: 13, color: 'var(--teal)', zIndex: 1000, backdropFilter: 'blur(20px)' }}>
          {toast}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="fade-up" style={{ marginBottom: 24 }}>
          <h1 className="syne" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px' }}>Profile</h1>
        </div>

        {/* Profile card */}
        <div className="card fade-up" style={{ padding: 28, marginBottom: 16, animationDelay: '60ms' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 80, height: 80, borderRadius: 22, overflow: 'hidden', border: '2px solid rgba(124,108,240,0.4)', boxShadow: '0 0 0 4px rgba(124,108,240,0.08)' }}>
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,var(--violet),var(--indigo))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600, color: '#fff', fontFamily: 'Syne' }}>{initials}</div>
                }
              </div>
              <button onClick={() => fileRef.current?.click()} disabled={avatarLoading} style={{
                position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--violet),var(--indigo))', border: '2px solid var(--night)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
              }}>
                {avatarLoading
                  ? <div style={{ width: 10, height: 10, border: '1.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  : <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M14 4l2 2-10 10H4v-2L14 4z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                }
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatar} />
            </div>

            <div style={{ flex: 1 }}>
              {editing ? (
                <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(124,108,240,0.4)', outline: 'none', fontSize: 20, fontWeight: 600, color: 'var(--text)', fontFamily: 'Syne', marginBottom: 4, width: '100%', paddingBottom: 4 }} />
              ) : (
                <h2 className="syne" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{user.name}</h2>
              )}
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{user.email}</p>
              {!editing && user.occupation && <p style={{ fontSize: 13, color: 'var(--muted)' }}>{user.occupation}{user.city ? ` · ${user.city}` : ''}</p>}
              {editing && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                  <input className="input-field" value={form.occupation || ''} onChange={e => setForm({ ...form, occupation: e.target.value })} placeholder="Occupation" style={{ padding: '8px 12px', fontSize: 13 }} />
                  <input className="input-field" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" style={{ padding: '8px 12px', fontSize: 13 }} />
                  <input className="input-field" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" style={{ padding: '8px 12px', fontSize: 13 }} />
                  <input className="input-field" value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Bio" style={{ padding: '8px 12px', fontSize: 13 }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {editing ? (
                <>
                  <button onClick={save} disabled={saving} className="btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>
                    {saving ? '...' : 'Save'}
                  </button>
                  <button onClick={() => { setEditing(false); setForm(user) }} className="btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} style={{
                  width: 36, height: 36, borderRadius: 10, background: 'var(--violet3)',
                  border: '0.5px solid rgba(124,108,240,0.3)', color: 'var(--violet2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M14 4l2 2-10 10H4v-2L14 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Financial profile */}
        <div className="card fade-up" style={{ padding: 24, marginBottom: 16, animationDelay: '120ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className="syne" style={{ fontSize: 16, fontWeight: 600 }}>Financial profile</h3>
            <span className="pill pill-teal">{savingsRate}% savings rate</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Monthly income', value: editing ? null : fmt(user.monthly_income), field: 'monthly_income', color: 'var(--violet2)' },
              { label: 'Savings target', value: editing ? null : fmt(user.savings_target), field: 'savings_target', color: 'var(--indigo)' },
              { label: 'Your margin', value: fmt(budget), field: null, color: 'var(--teal)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>{s.label}</p>
                {editing && s.field ? (
                  <input type="number" value={form[s.field] || ''} onChange={e => setForm({ ...form, [s.field]: e.target.value })}
                    style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${s.color}40`, outline: 'none', fontSize: 16, fontWeight: 600, color: s.color, fontFamily: 'Syne', textAlign: 'center', width: '100%', paddingBottom: 4 }} />
                ) : (
                  <p className="syne" style={{ fontSize: 17, fontWeight: 600, color: s.color }}>{s.value}</p>
                )}
              </div>
            ))}
          </div>
          <div style={{ height: 4, background: 'var(--glass2)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,var(--violet),var(--teal))', borderRadius: 2, width: `${Math.min(savingsRate / 30 * 100, 100)}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--faint)' }}>
            <span>0%</span><span>target 25%</span><span>30%+</span>
          </div>
        </div>

        {/* Account info */}
        <div className="card fade-up" style={{ padding: 20, animationDelay: '180ms' }}>
          <h3 className="syne" style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Account</h3>
          {[
            { label: 'Member since', value: new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
            { label: 'AI stack', value: 'Groq llama-3.1-8b + Gemini Flash' },
            { label: 'Status', value: user.onboarded ? 'Active' : 'Setup incomplete' },
          ].map((row, i) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < 2 ? '0.5px solid var(--rim)' : 'none' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{row.label}</span>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
