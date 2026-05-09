import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profile as profileApi } from '../api/client'

const STEPS = [
  { title: 'Welcome',    sub: "Let's set up your financial profile",       emoji: '👋' },
  { title: 'Income',     sub: 'Your take-home pay every month',            emoji: '💰' },
  { title: 'Savings',    sub: 'This gets protected first, every month',    emoji: '🏦' },
  { title: "You're set", sub: 'Your margin is calculated and ready',       emoji: '✓'  },
]

export default function Onboarding() {
  const [step,    setStep]    = useState(0)
  const [form,    setForm]    = useState({ city: '', occupation: '', monthly_income: '', savings_target: '' })
  const [loading, setLoading] = useState(false)
  const nav     = useNavigate()
  const income  = parseFloat(form.monthly_income) || 0
  const savings = parseFloat(form.savings_target) || 0
  const margin  = income - savings
  const savRate = income > 0 ? Math.round(savings / income * 100) : 0

  const canNext = () => {
    if (step === 1) return income > 0
    if (step === 2) return savings > 0 && savings < income
    return true
  }

  const next = async () => {
    if (step < 3) { setStep(s => s + 1); return }
    setLoading(true)
    try { await profileApi.onboard({ city: form.city, occupation: form.occupation, monthly_income: income, savings_target: savings }); nav('/') }
    catch (e) { alert(e.response?.data?.detail || 'Error') }
    finally { setLoading(false) }
  }

  const inp = { width: '100%', padding: '14px 18px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, fontSize: 15, color: '#18181B', fontFamily: 'Urbanist,sans-serif', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }
  const onF = e => { e.target.style.borderColor='rgba(124,58,237,0.50)'; e.target.style.boxShadow='0 0 0 4px rgba(124,58,237,0.10)' }
  const onB = e => { e.target.style.borderColor='rgba(0,0,0,0.08)'; e.target.style.boxShadow='none' }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(124,58,237,0.10),transparent)', top: -150, right: -80 }} />
      <div className="orb" style={{ width: 350, height: 350, background: 'radial-gradient(circle,rgba(167,139,250,0.08),transparent)', bottom: -80, left: -60 }} />

      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 44 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, overflow: 'hidden', background: '#E4DFFF' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#7C3AED,#A78BFA)', width: i <= step ? '100%' : '0%', transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          ))}
        </div>

        <div key={step} className="fade-up">
          {/* Step badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff', boxShadow: '0 4px 14px rgba(124,58,237,0.28)' }}>{step + 1}</div>
            <span style={{ fontSize: 11, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Step {step + 1} of {STEPS.length}</span>
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1.5px', color: '#18181B', marginBottom: 8 }}>{STEPS[step].title}</h1>
          <p style={{ fontSize: 16, color: '#71717A', marginBottom: 36, fontWeight: 500 }}>{STEPS[step].sub}</p>

          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['city','City (optional)','Mumbai'],['occupation','What do you do?','Finance Student']].map(([k,l,pl]) => (
                <div key={k}>
                  <label style={{ fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, display: 'block', fontWeight: 700 }}>{l}</label>
                  <input style={inp} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={pl} onFocus={onF} onBlur={onB} />
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#A1A1AA', fontSize: 24 }}>₹</span>
                <input type="number" value={form.monthly_income} onChange={e => setForm({ ...form, monthly_income: e.target.value })}
                  style={{ ...inp, paddingLeft: 46, fontSize: 32, fontWeight: 900, height: 76 }} placeholder="65,000" onFocus={onF} onBlur={onB} />
              </div>
              {income > 0 && <p style={{ fontSize: 13, color: '#71717A', marginTop: 10, fontWeight: 600 }}>₹{income.toLocaleString('en-IN')} per month</p>}
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#A1A1AA', fontSize: 24 }}>₹</span>
                <input type="number" value={form.savings_target} onChange={e => setForm({ ...form, savings_target: e.target.value })}
                  style={{ ...inp, paddingLeft: 46, fontSize: 32, fontWeight: 900, height: 76 }} placeholder="15,000" onFocus={onF} onBlur={onB} />
              </div>
              {savings > 0 && income > 0 && (
                <div style={{ marginTop: 18, background: '#fff', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 18, padding: '20px 22px', boxShadow: '0 4px 20px rgba(124,58,237,0.08)' }}>
                  {[['Income', `₹${income.toLocaleString('en-IN')}`, '#18181B'],['Savings', `−₹${savings.toLocaleString('en-IN')}`, '#059669']].map(([l,v,c]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                      <span style={{ color: '#71717A', fontWeight: 500 }}>{l}</span>
                      <span style={{ color: c, fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: 'rgba(124,58,237,0.12)', marginBottom: 14 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                    <span style={{ color: '#18181B', fontWeight: 700 }}>Your margin</span>
                    <span style={{ fontSize: 24, fontWeight: 900, color: '#7C3AED' }}>₹{margin.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ marginTop: 14, height: 6, background: '#EDE9FE', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#7C3AED,#A78BFA)', borderRadius: 3, width: `${Math.min(savRate / 30 * 100, 100)}%` }} />
                  </div>
                  <p style={{ fontSize: 11, color: '#A1A1AA', marginTop: 6, fontWeight: 600 }}>{savRate}% savings rate</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 34, animation: 'float 3s ease-in-out infinite', color: '#fff', boxShadow: '0 12px 36px rgba(124,58,237,0.30)' }}>✓</div>
              <p style={{ fontSize: 17, color: '#71717A', lineHeight: 1.7, fontWeight: 500 }}>
                Your spending margin is<br/>
                <span style={{ color: '#7C3AED', fontWeight: 900, fontSize: 26 }}>₹{margin.toLocaleString('en-IN')}/month</span><br/>
                That's what you're allowed to spend.
              </p>
            </div>
          )}
        </div>

        <button className="btn-primary" onClick={next} disabled={!canNext() || loading}
          style={{ width: '100%', marginTop: 36, padding: '17px', fontSize: 16, fontWeight: 800 }}>
          {loading ? 'Setting up…' : step === 3 ? 'Open dashboard →' : 'Continue →'}
        </button>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{ width: '100%', marginTop: 12, padding: '12px', fontSize: 13, color: '#A1A1AA', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Urbanist,sans-serif', fontWeight: 600 }}>
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
