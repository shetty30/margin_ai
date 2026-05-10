import React, { useState, useEffect } from 'react'
import { goals as goalsApi, ai } from '../api/client'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')
const COLORS = ['#7C3AED','#2563EB','#059669','#D97706','#EF4444']
const LIGHTS  = ['#EDE9FE','#DBEAFE','#D1FAE5','#FEF3C7','#FEE2E2']
const EMOJIS  = ['🎯','🏠','✈️','🚗','📚','💍','🏋️','💻','🎓','🏖️','💰','🎁']

function AddGoalModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', emoji: '🎯', target_amount: '', deadline: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const today = new Date().toISOString().split('T')[0]

  const save = async () => {
    if (!form.title.trim()) return setErr('Please enter a goal name')
    if (!form.target_amount || parseFloat(form.target_amount) <= 0) return setErr('Enter a valid target amount')
    if (!form.deadline || form.deadline <= today) return setErr('Pick a future deadline date')
    setSaving(true); setErr('')
    try {
      await goalsApi.create({
        title: form.title.trim(), emoji: form.emoji,
        target_amount: parseFloat(form.target_amount),
        saved_amount: 0, deadline: form.deadline,
      })
      onSaved()
    } catch (e) { setErr(e.response?.data?.detail || 'Failed to create goal') }
    finally { setSaving(false) }
  }

  const inp = { width: '100%', padding: '12px 14px', background: '#F4F2FF', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 13, fontSize: 14, color: '#18181B', fontFamily: 'Urbanist,sans-serif', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }
  const onF = e => { e.target.style.borderColor='rgba(124,58,237,0.50)'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.10)' }
  const onB = e => { e.target.style.borderColor='rgba(124,58,237,0.15)'; e.target.style.boxShadow='none' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="scale-in" style={{ background: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(124,58,237,0.20)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#18181B', letterSpacing: '-0.5px' }}>New Goal</h2>
            <p style={{ fontSize: 12, color: '#A1A1AA', fontWeight: 500, marginTop: 2 }}>Set a savings target to work towards</p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: '#F4F2FF', border: 'none', fontSize: 16, cursor: 'pointer', color: '#71717A' }}>✕</button>
        </div>

        {/* Emoji picker */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, color: '#71717A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 8 }}>Pick an icon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                style={{ width: 40, height: 40, borderRadius: 11, fontSize: 20, cursor: 'pointer', border: `2px solid ${form.emoji === e ? '#7C3AED' : 'transparent'}`, background: form.emoji === e ? '#EDE9FE' : '#F4F2FF', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: '#71717A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>Goal name</label>
          <input style={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Goa Trip, MacBook, Emergency Fund" onFocus={onF} onBlur={onB} />
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: '#71717A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>Target amount</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A1A1AA', fontSize: 18, fontWeight: 700 }}>₹</span>
            <input type="number" min="1" style={{ ...inp, paddingLeft: 36 }} value={form.target_amount}
              onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
              placeholder="50,000" onFocus={onF} onBlur={onB} />
          </div>
          {parseFloat(form.target_amount) > 0 && (
            <p style={{ fontSize: 11, color: '#7C3AED', marginTop: 5, fontWeight: 600 }}>Target: {fmt(form.target_amount)}</p>
          )}
        </div>

        {/* Deadline */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 11, color: '#71717A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>Deadline</label>
          <input type="date" min={today} style={inp} value={form.deadline}
            onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
            onFocus={onF} onBlur={onB} />
        </div>

        {err && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#EF4444', fontWeight: 600 }}>{err}</div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 14, background: '#F4F2FF', border: 'none', fontSize: 14, fontWeight: 700, color: '#71717A', cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary" style={{ flex: 2, padding: '13px', fontSize: 14 }}>
            {saving ? 'Saving…' : `Create ${form.emoji} Goal`}
          </button>
        </div>
      </div>
    </div>
  )
}

function DepositModal({ goal, onClose, onSaved }) {
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const remaining = goal.target - goal.saved

  const save = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    setSaving(true)
    try { await goalsApi.deposit(goal.id, amt); onSaved() }
    catch (e) { alert(e.response?.data?.detail || 'Error') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="scale-in" style={{ background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 360, boxShadow: '0 24px 64px rgba(124,58,237,0.20)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#18181B' }}>{goal.emoji} Add Funds</h2>
            <p style={{ fontSize: 12, color: '#A1A1AA', fontWeight: 500, marginTop: 2 }}>{fmt(goal.saved)} saved · {fmt(remaining)} to go</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: '#F4F2FF', border: 'none', fontSize: 16, cursor: 'pointer', color: '#71717A' }}>✕</button>
        </div>

        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A1A1AA', fontSize: 18, fontWeight: 700 }}>₹</span>
          <input type="number" min="1" autoFocus value={amount} onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()} placeholder="Amount to add"
            style={{ width: '100%', padding: '13px 14px 13px 36px', background: '#F4F2FF', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 13, fontSize: 16, fontWeight: 700, color: '#18181B', fontFamily: 'Urbanist,sans-serif', outline: 'none' }} />
        </div>

        {/* Quick amounts */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {[1000, 5000, 10000].map(q => (
            <button key={q} onClick={() => setAmount(String(q))}
              style={{ flex: 1, padding: '8px', borderRadius: 10, background: '#F4F2FF', border: '1px solid rgba(124,58,237,0.15)', fontSize: 12, fontWeight: 700, color: '#7C3AED', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='#EDE9FE'}
              onMouseLeave={e => e.currentTarget.style.background='#F4F2FF'}>
              +{fmt(q)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 14, background: '#F4F2FF', border: 'none', fontSize: 14, fontWeight: 700, color: '#71717A', cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving || !amount} className="btn-primary" style={{ flex: 2, padding: '12px', fontSize: 14, opacity: (!amount || saving) ? 0.5 : 1 }}>
            {saving ? 'Adding…' : 'Add Funds'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Goals() {
  const [data,        setData]        = useState([])
  const [q,           setQ]           = useState('')
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [showAdd,     setShowAdd]     = useState(false)
  const [depositGoal, setDepositGoal] = useState(null)

  const load = () => goalsApi.list().then(r => setData(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const ask = async () => {
    if (!q.trim()) return
    setLoading(true); setResult(null)
    try { const { data } = await ai.afford(q); setResult(data) }
    catch { setResult({ verdict: 'unknown', headline: 'AI unavailable', reasoning: 'Check your HF_TOKEN or GROQ_API_KEY in .env', tradeoff: '' }) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>

      {showAdd     && <AddGoalModal   onClose={() => setShowAdd(false)}     onSaved={() => { setShowAdd(false); load() }} />}
      {depositGoal && <DepositModal   goal={depositGoal} onClose={() => setDepositGoal(null)} onSaved={() => { setDepositGoal(null); load() }} />}

      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 11, color: '#A1A1AA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 4 }}>{data.length} active</p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#18181B', letterSpacing: '-1px' }}>Goals</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
          Add Goal
        </button>
      </div>

      {/* Goals grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 24 }}>
        {data.map((g, i) => {
          const pct   = Math.min(g.pct, 100)
          const color = COLORS[i % COLORS.length]
          const light = LIGHTS[i % LIGHTS.length]
          return (
            <div key={g.id} className="card fade-up" style={{ padding: 24, animationDelay: `${i * 60}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {g.emoji}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#18181B', marginBottom: 3 }}>{g.title}</p>
                    <p style={{ fontSize: 11, color: '#A1A1AA', fontWeight: 500 }}>Target: {fmt(g.target)} · Due {g.deadline}</p>
                  </div>
                </div>
                <span style={{ fontSize: 22, fontWeight: 900, color }}>{Math.round(pct)}%</span>
              </div>

              <div style={{ height: 8, background: light, borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', background: color, borderRadius: 4, width: `${pct}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 600 }}>
                <span style={{ color: '#71717A' }}>{fmt(g.saved)} saved</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: g.status === 'completed' ? '#059669' : pct >= 80 ? color : '#A1A1AA' }}>
                    {g.status === 'completed' ? '✓ Completed!' : pct >= 80 ? 'Almost there!' : `${fmt(g.target - g.saved)} left`}
                  </span>
                  {g.status !== 'completed' && (
                    <button onClick={() => setDepositGoal(g)}
                      style={{ padding: '5px 10px', borderRadius: 8, background: light, border: `1px solid ${color}30`, fontSize: 11, fontWeight: 700, color, cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = color + '22'}
                      onMouseLeave={e => e.currentTarget.style.background = light}>
                      + Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {data.length === 0 && (
          <div className="card" style={{ padding: 48, textAlign: 'center', gridColumn: 'span 2' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
            <p style={{ color: '#18181B', fontSize: 16, fontWeight: 800, marginBottom: 6 }}>No goals yet</p>
            <p style={{ color: '#A1A1AA', fontSize: 13, fontWeight: 500, marginBottom: 20 }}>Create your first savings goal to start tracking progress</p>
            <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ padding: '11px 24px', fontSize: 14 }}>
              Create your first goal →
            </button>
          </div>
        )}
      </div>

      {/* AI Afford calculator */}
      <div className="card fade-up" style={{ padding: 28, animationDelay: '200ms', border: '1px solid rgba(124,58,237,0.15)', background: 'linear-gradient(135deg,#FAF8FF,#F4F2FF)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2zm0 5v5l3 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#18181B' }}>Can I afford this?</h3>
            <p style={{ fontSize: 12, color: '#71717A', fontWeight: 500 }}>AI checks your budget, goals, and upcoming bills</p>
          </div>
          <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'blink 2s ease-in-out infinite', boxShadow: '0 0 6px rgba(16,185,129,0.50)' }} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()}
            placeholder="e.g. Can I afford a ₹20K Goa trip next month?"
            style={{ flex: 1, padding: '13px 16px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, fontSize: 14, color: '#18181B', fontFamily: 'Urbanist,sans-serif', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={e => { e.target.style.borderColor='rgba(124,58,237,0.40)'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.08)' }}
            onBlur={e  => { e.target.style.borderColor='rgba(0,0,0,0.08)'; e.target.style.boxShadow='none' }} />
          <button className="btn-primary" onClick={ask} disabled={loading} style={{ padding: '13px 22px', fontSize: 14, opacity: loading ? 0.7 : 1 }}>
            {loading ? '…' : 'Ask AI'}
          </button>
        </div>

        {result && (
          <div className="scale-in" style={{
            marginTop: 16,
            background: result.verdict === 'yes' ? 'rgba(16,185,129,0.08)' : result.verdict === 'no' ? 'rgba(239,68,68,0.06)' : 'rgba(124,58,237,0.06)',
            border: `1px solid ${result.verdict === 'yes' ? 'rgba(16,185,129,0.25)' : result.verdict === 'no' ? 'rgba(239,68,68,0.20)' : 'rgba(124,58,237,0.20)'}`,
            borderRadius: 14, padding: '16px 18px',
          }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: result.verdict === 'yes' ? '#059669' : result.verdict === 'no' ? '#EF4444' : '#7C3AED', marginBottom: 8 }}>{result.headline}</p>
            <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.7, fontWeight: 500 }}>{result.reasoning}</p>
            {result.tradeoff && <p style={{ fontSize: 12, color: '#A1A1AA', marginTop: 8 }}>{result.tradeoff}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
