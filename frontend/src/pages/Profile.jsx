import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Edit2, Check, X, Trash2 } from 'lucide-react'
import { profile as profileApi } from '../api/client'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')

export default function Profile() {
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    profileApi.get().then(r => { setUser(r.data); setForm(r.data) }).catch(console.error)
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await profileApi.update({
        name: form.name, phone: form.phone, city: form.city,
        occupation: form.occupation, bio: form.bio,
        monthly_income: Number(form.monthly_income),
        savings_target: Number(form.savings_target),
      })
      setUser(data); setEditing(false)
      setMsg('Profile updated'); setTimeout(() => setMsg(''), 3000)
    } catch(e) { setMsg('Failed to save') }
    finally { setSaving(false) }
  }

  const handleAvatarChange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    try {
      const { data } = await profileApi.uploadAvatar(file)
      setUser(u => ({ ...u, avatar_url: data.avatar_url }))
      setMsg('Avatar updated'); setTimeout(() => setMsg(''), 3000)
    } catch(e) { setMsg(e.response?.data?.detail || 'Upload failed') }
    finally { setAvatarLoading(false) }
  }

  const removeAvatar = async () => {
    try {
      await profileApi.deleteAvatar()
      setUser(u => ({ ...u, avatar_url: null }))
      setMsg('Avatar removed'); setTimeout(() => setMsg(''), 3000)
    } catch(e) { setMsg('Failed to remove') }
  }

  if (!user) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-32 rounded-2xl" style={{background:'rgba(255,255,255,0.04)'}}/>
    </div>
  )

  const budget = (user.monthly_income||0) - (user.savings_target||0)
  const savingsRate = user.monthly_income > 0 ? ((user.savings_target/user.monthly_income)*100).toFixed(1) : 0
  const initials = user.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <div className="mb-2">
        <p className="text-white/30 text-xs mb-1">Your account</p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-white">Profile</h1>
          {!editing
            ? <button onClick={()=>setEditing(true)} className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl text-purple2 transition-all" style={{background:'rgba(108,92,231,0.1)',border:'0.5px solid rgba(108,92,231,0.25)'}}>
                <Edit2 size={13}/> Edit
              </button>
            : <div className="flex gap-2">
                <button onClick={()=>{setEditing(false);setForm(user)}} className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl text-white/40" style={{border:'0.5px solid rgba(255,255,255,0.1)'}}>
                  <X size={13}/> Cancel
                </button>
                <button onClick={saveProfile} disabled={saving} className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl text-white font-medium" style={{background:'linear-gradient(135deg,#6c5ce7,#0984e3)'}}>
                  <Check size={13}/> {saving?'Saving...':'Save'}
                </button>
              </div>
          }
        </div>
      </div>

      {msg && (
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="text-xs px-4 py-3 rounded-xl" style={{background:'rgba(0,184,148,0.1)',border:'0.5px solid rgba(0,184,148,0.25)',color:'#00b894'}}>
          {msg}
        </motion.div>
      )}

      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="rounded-2xl p-6" style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.07)'}}>
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center" style={{background:'linear-gradient(135deg,#6c5ce7,#0984e3)'}}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover"/>
                : <span className="text-white text-xl font-medium">{initials}</span>
              }
            </div>
            {avatarLoading && (
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{background:'rgba(0,0,0,0.6)'}}>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              </div>
            )}
            <button onClick={()=>fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-90" style={{background:'linear-gradient(135deg,#6c5ce7,#0984e3)'}}>
              <Camera size={12} color="white"/>
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange}/>
          </div>
          <div className="flex-1 min-w-0">
            {editing
              ? <input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} className="text-lg font-medium text-white bg-transparent border-b pb-1 w-full mb-1" style={{borderColor:'rgba(108,92,231,0.4)'}}/>
              : <h2 className="text-lg font-medium text-white mb-0.5">{user.name}</h2>
            }
            <p className="text-white/40 text-sm">{user.email}</p>
            {user.occupation && <p className="text-white/30 text-xs mt-1">{user.occupation}{user.city ? ` · ${user.city}` : ''}</p>}
            {user.avatar_url && (
              <button onClick={removeAvatar} className="flex items-center gap-1 text-xs mt-2 text-red/50 hover:text-red/80 transition-colors">
                <Trash2 size={11}/> Remove photo
              </button>
            )}
          </div>
        </div>

        {(editing || user.bio) && (
          <div className="mt-4 pt-4" style={{borderTop:'0.5px solid rgba(255,255,255,0.07)'}}>
            {editing
              ? <textarea value={form.bio||''} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Short bio (optional)" rows={2} className="w-full text-sm text-white rounded-xl px-4 py-3 resize-none" style={{background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)'}}/>
              : <p className="text-sm text-white/40">{user.bio}</p>
            }
          </div>
        )}
      </motion.div>

      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.05}} className="rounded-2xl p-5" style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.07)'}}>
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Contact</p>
        <div className="grid grid-cols-2 gap-3">
          {[['phone','Phone','tel'],['city','City','text'],['occupation','Occupation','text']].map(([f,l,t])=>(
            <div key={f}>
              <p className="text-xs text-white/30 mb-1.5">{l}</p>
              {editing
                ? <input type={t} value={form[f]||''} onChange={e=>setForm({...form,[f]:e.target.value})} className="w-full text-sm text-white rounded-xl px-3 py-2.5" style={{background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)'}}/>
                : <p className="text-sm text-white">{user[f] || <span className="text-white/20">—</span>}</p>
              }
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="rounded-2xl p-5" style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.07)'}}>
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Financial setup</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[['monthly_income','Monthly income'],['savings_target','Savings target']].map(([f,l])=>(
            <div key={f}>
              <p className="text-xs text-white/30 mb-1.5">{l}</p>
              {editing
                ? <div className="flex items-center gap-1 rounded-xl px-3 py-2.5" style={{background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.1)'}}>
                    <span className="text-white/30 text-xs">₹</span>
                    <input type="number" value={form[f]||''} onChange={e=>setForm({...form,[f]:e.target.value})} className="flex-1 bg-transparent text-sm text-white"/>
                  </div>
                : <p className="text-sm font-medium text-white">{fmt(user[f]||0)}</p>
              }
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4" style={{borderTop:'0.5px solid rgba(255,255,255,0.07)'}}>
          <div className="text-center">
            <p className="text-base font-medium" style={{color:'#00b894'}}>{fmt(budget)}</p>
            <p className="text-xs text-white/30 mt-0.5">Expense budget</p>
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-purple2">{savingsRate}%</p>
            <p className="text-xs text-white/30 mt-0.5">Savings rate</p>
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-white">{fmt(user.savings_target||0)}</p>
            <p className="text-xs text-white/30 mt-0.5">Protected monthly</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="rounded-xl p-4" style={{background:'rgba(214,48,49,0.06)',border:'0.5px solid rgba(214,48,49,0.15)'}}>
        <p className="text-xs font-medium text-red/70 mb-1">Danger zone</p>
        <p className="text-xs text-white/25 mb-3">Permanently delete your account and all data</p>
        <button className="text-xs px-3 py-2 rounded-xl text-red/60 hover:text-red/80 transition-colors" style={{border:'0.5px solid rgba(214,48,49,0.2)'}}>Delete account</button>
      </motion.div>
    </div>
  )
}
