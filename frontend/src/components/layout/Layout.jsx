import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { profile as profileApi } from '../../api/client'

const NAV = [
  { to: '/', icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>, label: 'Dashboard' },
  { to: '/transactions', icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 6h14M3 10h9M3 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, label: 'Transactions' },
  { to: '/goals', icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M10 3V1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, label: 'Goals' },
  { to: '/chat', icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H7l-4 3V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>, label: 'AI Chat' },
  { to: '/profile', icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, label: 'Profile' },
]

export default function Layout() {
  const nav = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    profileApi.me().then(r => setUser(r.data)).catch(() => {})
  }, [])

  const logout = () => { localStorage.removeItem('margin_token'); nav('/login') }
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'M'

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F6FAF8', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 64, background: '#fff',
        borderRight: '1px solid var(--rim)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0',
        gap: 4, flexShrink: 0, position: 'relative', zIndex: 10,
        boxShadow: '2px 0 12px rgba(5,150,105,0.04)',
      }}>
        {/* Logo */}
        <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg,#059669,#0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 4px 16px rgba(5,150,105,0.30)', flexShrink: 0, animation: 'float 4s ease-in-out infinite' }}>
          <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
            <path d="M3 14L7 8L11 11L17 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="17" cy="4" r="2" fill="#fff"/>
          </svg>
        </div>

        {NAV.map(({ to, icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <div key={to} style={{ position: 'relative' }}
              onMouseEnter={() => setTooltip(label)} onMouseLeave={() => setTooltip(null)}>
              <NavLink to={to} className={`nav-item ${isActive ? 'active' : ''}`} end={to === '/'}>
                {icon}
              </NavLink>
              {tooltip === label && (
                <div style={{
                  position: 'absolute', left: 52, top: '50%', transform: 'translateY(-50%)',
                  background: '#fff', border: '1px solid var(--rim)',
                  borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--text)',
                  whiteSpace: 'nowrap', zIndex: 100,
                  animation: 'fadeIn 0.15s ease',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                  {label}
                </div>
              )}
            </div>
          )
        })}

        <div style={{ flex: 1 }} />

        {/* Avatar */}
        <NavLink to="/profile" style={{ marginBottom: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
            border: '1.5px solid rgba(5,150,105,0.35)',
            boxShadow: '0 0 0 3px rgba(5,150,105,0.08)',
            transition: 'all 0.2s',
          }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#059669,#0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{initials}</div>
            }
          </div>
        </NavLink>

        {/* Logout */}
        <button onClick={logout} style={{
          width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(0,0,0,0.25)', transition: 'all 0.2s', cursor: 'pointer',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--rose)'; e.currentTarget.style.background = 'var(--rose2)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,0,0,0.25)'; e.currentTarget.style.background = 'transparent' }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M13 3h4v14h-4M8 7l-4 3 4 3M4 10h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', background: '#F6FAF8' }}>
        <Outlet />
      </main>
    </div>
  )
}
