import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { profile as profileApi } from '../../api/client'

const NAV = [
  {
    to: '/', label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="13" y="3" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="3" y="13" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
        <rect x="13" y="13" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
  },
  {
    to: '/transactions', label: 'Transactions',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16M4 12h10M4 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/goals', label: 'Goals',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M12 4V2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/chat', label: 'AI Chat',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H8l-4 3.5V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/profile', label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Layout() {
  const nav = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    profileApi.me().then(r => setUser(r.data)).catch(() => {})
  }, [])

  const logout = () => {
    localStorage.removeItem('margin_token')
    localStorage.removeItem('margin_user')
    nav('/login')
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'M'

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#131313', overflow: 'hidden' }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside style={{
        width: 68, flexShrink: 0,
        background: '#1C1C1C',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '20px 0', gap: 4,
        position: 'relative', zIndex: 10,
      }}>

        {/* Logo mark */}
        <div style={{
          width: 40, height: 40, borderRadius: 13,
          background: '#CFF008',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, flexShrink: 0,
          boxShadow: '0 4px 20px rgba(207,240,8,0.30)',
          animation: 'limeGlow 3s ease-in-out infinite',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 17L9 9L13 13L20 5" stroke="#131313" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="20" cy="5" r="2.5" fill="#131313"/>
          </svg>
        </div>

        {/* Nav links */}
        {NAV.map(({ to, icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <div key={to} style={{ position: 'relative' }}
              onMouseEnter={() => setTooltip(label)}
              onMouseLeave={() => setTooltip(null)}>
              <NavLink to={to} className={`nav-item ${isActive ? 'active' : ''}`} end={to === '/'}>
                {icon}
              </NavLink>
              {tooltip === label && (
                <div style={{
                  position: 'absolute', left: 56, top: '50%', transform: 'translateY(-50%)',
                  background: '#2C2C2C', border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 10, padding: '6px 12px',
                  fontSize: 12, fontWeight: 600, color: '#fff',
                  whiteSpace: 'nowrap', zIndex: 100,
                  animation: 'fadeIn 0.15s ease',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.40)',
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
            width: 34, height: 34, borderRadius: '50%', overflow: 'hidden',
            border: '2px solid rgba(207,240,8,0.40)',
            boxShadow: '0 0 0 3px rgba(207,240,8,0.08)',
            transition: 'all 0.2s',
          }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (
                <div style={{
                  width: '100%', height: '100%',
                  background: '#CFF008',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#131313',
                }}>
                  {initials}
                </div>
              )
            }
          </div>
        </NavLink>

        {/* Logout */}
        <button onClick={logout} style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.25)', transition: 'all 0.2s', cursor: 'pointer',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FF4D4D'; e.currentTarget.style.background = 'rgba(255,77,77,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M16 3h4v18h-4M10 8l-5 4 5 4M5 12h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', background: '#131313' }}>
        <Outlet />
      </main>
    </div>
  )
}
