import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { profile as profileApi } from '../../api/client'

const NAV = [
  {
    to: '/', label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    to: '/transactions', label: 'Transactions',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M8 6l4-4 4 4M16 18l-4 4-4-4M12 2v20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/income', label: 'Income',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/goals', label: 'Goals',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 3V1M21 12h2M12 21v2M3 12H1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/chat', label: 'AI Chat',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
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

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside style={{
        width: 210, flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid rgba(0,0,0,0.07)',
        display: 'flex', flexDirection: 'column',
        padding: '22px 14px 20px',
        boxShadow: '2px 0 20px rgba(124,58,237,0.04)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124,58,237,0.28)', flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M4 17L9 9L13 13L20 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="5" r="2" fill="#fff"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#18181B', letterSpacing: '-0.4px' }}>margin</span>
            <span style={{ fontSize: 10, marginLeft: 5, padding: '2px 6px', borderRadius: 5, background: 'rgba(124,58,237,0.10)', color: '#7C3AED', fontWeight: 700, letterSpacing: '0.4px' }}>AI</span>
          </div>
        </div>

        {/* Profile card */}
        <NavLink to="/profile" style={{ textDecoration: 'none', marginTop: 22 }}>
          <div style={{
            background: 'rgba(124,58,237,0.04)',
            border: '1px solid rgba(124,58,237,0.12)',
            borderRadius: 18, padding: '18px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            transition: 'all 0.2s', cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.22)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(124,58,237,0.04)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.12)' }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%', overflow: 'hidden',
              border: '2.5px solid rgba(124,58,237,0.30)',
              boxShadow: '0 0 0 5px rgba(124,58,237,0.08)',
            }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>{initials}</div>
              }
            </div>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#18181B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Profile'}</p>
              <p style={{ fontSize: 11, color: '#A1A1AA', fontWeight: 500, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || ''}</p>
            </div>
          </div>
        </NavLink>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Sign out */}
        <button onClick={logout} title="Sign out" style={{
          width: '100%', padding: '10px', borderRadius: 12,
          background: 'transparent', border: '1px solid rgba(0,0,0,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          color: '#A1A1AA', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Urbanist,sans-serif', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color='#EF4444'; e.currentTarget.style.borderColor='rgba(239,68,68,0.25)'; e.currentTarget.style.background='rgba(239,68,68,0.05)' }}
          onMouseLeave={e => { e.currentTarget.style.color='#A1A1AA'; e.currentTarget.style.borderColor='rgba(0,0,0,0.07)'; e.currentTarget.style.background='transparent' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M16 3h4v18h-4M10 8l-5 4 5 4M5 12h13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign out
        </button>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Top header with centered nav ──────────────────────── */}
        <header style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 24px',
          height: 64, flexShrink: 0,
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(124,58,237,0.08)',
          boxShadow: '0 1px 16px rgba(124,58,237,0.06)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>

          {/* Left — date */}
          <p style={{ fontSize: 13, color: '#71717A', fontWeight: 600 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>

          {/* Center — glassmorphism nav pill */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.14)',
            borderRadius: 16, padding: '4px',
            gap: 2,
            boxShadow: '0 2px 12px rgba(124,58,237,0.08)',
          }}>
            {NAV.map(({ to, icon, label }) => {
              const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
              return (
                <NavLink
                  key={to} to={to} end={to === '/'}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 12,
                    fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.18s',
                    background: isActive ? '#7C3AED' : 'transparent',
                    color: isActive ? '#fff' : '#71717A',
                    boxShadow: isActive ? '0 3px 10px rgba(124,58,237,0.30)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background='rgba(124,58,237,0.10)'; e.currentTarget.style.color='#7C3AED' } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#71717A' } }}>
                    <span style={{ opacity: isActive ? 1 : 0.65, display: 'flex' }}>{icon}</span>
                    {label}
                  </div>
                </NavLink>
              )
            })}
          </div>

          {/* Right — bell + profile chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>

            <button style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.18s', color: '#7C3AED',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.12)'; e.currentTarget.style.transform='scale(1.05)' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(124,58,237,0.06)'; e.currentTarget.style.transform='scale(1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <NavLink to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 12px 5px 5px',
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.14)',
                borderRadius: 40, cursor: 'pointer', transition: 'all 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(124,58,237,0.06)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(124,58,237,0.30)' }}>
                  {user?.avatar_url
                    ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>{initials}</div>
                  }
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#18181B', whiteSpace: 'nowrap' }}>{user?.name?.split(' ')[0] || 'Profile'}</span>
              </div>
            </NavLink>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', position: 'relative', background: '#F4F2FF' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
