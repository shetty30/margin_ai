import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { profile as profileApi } from '../../api/client'

const NAV = [
  {
    to: '/', label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
        <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
        <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
        <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.7"/>
      </svg>
    ),
  },
  {
    to: '/transactions', label: 'Transactions',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M8 6l4-4 4 4M16 18l-4 4-4-4M12 2v20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/goals', label: 'Goals',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/>
        <path d="M12 3V1M21 12h2M12 21v2M3 12H1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/chat', label: 'AI Chat',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/profile', label: 'Profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Layout() {
  const nav      = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)

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
    <div style={{ display: 'flex', height: '100vh', background: '#F4F2FF', overflow: 'hidden' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: 230, flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid rgba(0,0,0,0.07)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        boxShadow: '2px 0 20px rgba(124,58,237,0.04)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, paddingLeft: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(124,58,237,0.30)',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 17L9 9L13 13L20 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="5" r="2" fill="#fff"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#18181B', letterSpacing: '-0.4px' }}>margin</span>
            <span style={{ fontSize: 10, marginLeft: 5, padding: '2px 6px', borderRadius: 5, background: 'rgba(124,58,237,0.10)', color: '#7C3AED', fontWeight: 700, letterSpacing: '0.4px' }}>AI</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, paddingLeft: 14 }}>Menu</p>
          {NAV.map(({ to, icon, label }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to} end={to === '/'} className={`nav-item ${isActive ? 'active' : ''}`}>
                <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }}>{icon}</span>
                {label}
                {isActive && <span className="nav-dot" />}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom: avatar + logout */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <NavLink to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              border: '2px solid rgba(124,58,237,0.30)',
              boxShadow: '0 0 0 3px rgba(124,58,237,0.08)',
            }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>{initials}</div>
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#18181B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'You'}</p>
              <p style={{ fontSize: 11, color: '#A1A1AA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || ''}</p>
            </div>
          </NavLink>
          <button onClick={logout} style={{
            width: 34, height: 34, borderRadius: 10, background: 'transparent', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#D4D4D8', transition: 'all 0.2s', cursor: 'pointer', flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#D4D4D8'; e.currentTarget.style.background = 'transparent' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M16 3h4v18h-4M10 8l-5 4 5 4M5 12h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', background: '#F4F2FF' }}>
        <Outlet />
      </main>
    </div>
  )
}
