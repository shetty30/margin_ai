import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Target, MessageCircle, User, LogOut } from 'lucide-react'

const nav = [
  {to:'/',icon:LayoutDashboard,label:'Dashboard'},
  {to:'/transactions',icon:ArrowLeftRight,label:'Transactions'},
  {to:'/goals',icon:Target,label:'Goals'},
  {to:'/chat',icon:MessageCircle,label:'AI Chat'},
  {to:'/profile',icon:User,label:'Profile'},
]

export default function Layout() {
  const navigate = useNavigate()
  const logout = () => { localStorage.removeItem('margin_token'); navigate('/login') }
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <aside className="w-14 bg-bg2 border-r border-white/[0.07] flex flex-col items-center py-4 gap-1 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg mb-4 flex items-center justify-center" style={{background:'linear-gradient(135deg,#6c5ce7,#0984e3)'}}>
          <span className="text-white font-semibold text-xs">M</span>
        </div>
        {nav.map(({to,icon:Icon,label})=>(
          <NavLink key={to} to={to} end={to==='/'} title={label}
            className={({isActive})=>`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive?'bg-purple/20 text-purple2 border border-purple/30':'text-white/25 hover:text-white/60 hover:bg-white/[0.05]'}`}>
            <Icon size={17}/>
          </NavLink>
        ))}
        <div className="flex-1"/>
        <button onClick={logout} className="w-10 h-10 rounded-xl flex items-center justify-center text-white/20 hover:text-red/60 hover:bg-red/10 transition-all duration-200">
          <LogOut size={15}/>
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto"><Outlet/></main>
    </div>
  )
}
