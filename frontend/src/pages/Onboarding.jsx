import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profile as profileApi } from '../api/client'

const STEPS = [
  { title: 'Welcome',   sub: "Let's set up your financial profile" },
  { title: 'Income',    sub: 'Your take-home pay this month' },
  { title: 'Savings',   sub: 'This gets protected first, every month' },
  { title: "You're set", sub: 'Your margin is ready' },
]

export default function Onboarding() {
  const [step,    setStep]    = useState(0)
  const [form,    setForm]    = useState({ city: '', occupation: '', monthly_income: '', savings_target: '' })
  const [loading, setLoading] = useState(false)
  const nav  = useNavigate()
  const user = JSON.parse(localStorage.getItem('margin_user') || '{}')
  const income  = parseFloat(form.monthly_income) || 0
  const savings = parseFloat(form.savings_target) || 0
  const margin  = income - savings
  const savRate = income > 0 ? Math.round(savings / income * 100) : 0

  const canNext = () => {
    if (step === 1) return form.monthly_income && income > 0
    if (step === 2) return form.savings_target && savings > 0 && savings < income
    return true
  }

  const next = async () => {
    if (step < 3) { setStep(s => s + 1); return }
    setLoading(true)
    try {
      await profileApi.onboard({ city: form.city, occupation: form.occupation, monthly_income: income, savings_target: savings })
      nav('/')
    } catch (e) { alert(e.response?.data?.detail || 'Error') }
    finally { setLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    background: '#1C1C1C', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, fontSize: 15, color: '#fff',
    fontFamily: 'Urbanist, sans-serif', outline: 'none', transition: 'border-color 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#131313', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient */}
      <div className="orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle,rgba(207,240,8,0.07),transparent)', top: -200, right: -100 }} />
      <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(207,240,8,0.04),transparent)', bottom: -100, left: -50 }} />

      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 48 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
              <div style={{ height: '100%', background: '#CFF008', width: i <= step ? '100%' : '0%', transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)', boxShadow: i <= step ? '0 0 6px rgba(207,240,8,0.50)' : 'none' }} />
            </div>
          ))}
        </div>

        <div key={step} className="fade-up">
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: '#CFF008',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 900, color: '#131313',
              boxShadow: '0 2px 10px rgba(207,240,8,0.28)',
            }}>{step + 1}</div>
            <span style={{ fontSize: 11, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Step {step + 1} of {STEPS.length}</span>
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-1.5px', color: '#fff', marginBottom: 8 }}>{STEPS[step].title}</h1>
          <p style={{ fontSize: 16, color: '#8F8F8F', marginBottom: 36, fontWeight: 500 }}>{STEPS[step].sub}</p>

          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, display: 'block', fontWeight: 700 }}>City (optional)</label>
                <input style={inputStyle} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Mumbai"
                  onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.40)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#8F8F8F', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, display: 'block', fontWeight: 700 }}>What do you do?</label>
                <input style={inputStyle} value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} placeholder="Finance Student"
                  onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.40)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#5A5A5A', fontSize: 22, fontWeight: 400 }}>₹</span>
                <input type="number" value={form.monthly_income} onChange={e => setForm({ ...form, monthly_income: e.target.value })}
                  style={{ ...inputStyle, paddingLeft: 44, fontSize: 28, fontWeight: 900, height: 72 }} placeholder="65,000"
                  onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.40)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
              {income > 0 && <p style={{ fontSize: 12, color: '#8F8F8F', marginTop: 10, fontWeight: 600 }}>₹{income.toLocaleString('en-IN')} per month</p>}
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#5A5A5A', fontSize: 22, fontWeight: 400 }}>₹</span>
                <input type="number" value={form.savings_target} onChange={e => setForm({ ...form, savings_target: e.target.value })}
                  style={{ ...inputStyle, paddingLeft: 44, fontSize: 28, fontWeight: 900, height: 72 }} placeholder="15,000"
                  onFocus={e => e.target.style.borderColor = 'rgba(207,240,8,0.40)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
              {savings > 0 && income > 0 && (
                <div style={{ marginTop: 18, background: 'rgba(207,240,8,0.05)', border: '1px solid rgba(207,240,8,0.18)', borderRadius: 18, padding: '20px 22px' }}>
                  {[
                    { label: 'Income',  value: `₹${income.toLocaleString('en-IN')}`,  color: '#fff' },
                    { label: 'Savings', value: `−₹${savings.toLocaleString('en-IN')}`, color: '#CFF008' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                      <span style={{ color: '#8F8F8F', fontWeight: 500 }}>{r.label}</span>
                      <span style={{ color: r.color, fontWeight: 700 }}>{r.value}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: 'rgba(207,240,8,0.15)', marginBottom: 14 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                    <span style={{ color: '#fff', fontWeight: 700 }}>Your margin</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#CFF008' }}>₹{margin.toLocaleString('en-IN')}</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#8F8F8F', marginTop: 8, fontWeight: 600 }}>{savRate}% savings rate</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#CFF008',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px', fontSize: 32, animation: 'float 3s ease-in-out infinite', color: '#131313',
                boxShadow: '0 8px 32px rgba(207,240,8,0.30)',
              }}>✓</div>
              <p style={{ fontSize: 17, color: '#8F8F8F', lineHeight: 1.7, fontWeight: 500 }}>
                Your margin is <span style={{ color: '#CFF008', fontWeight: 900, fontSize: 20 }}>₹{margin.toLocaleString('en-IN')}/month</span><br/>
                That's what you're allowed to spend.
              </p>
            </div>
          )}
        </div>

        <button className="btn-primary" onClick={next} disabled={!canNext() || loading}
          style={{ width: '100%', marginTop: 36, padding: '18px', fontSize: 16, fontWeight: 800, opacity: (!canNext() || loading) ? 0.5 : 1, letterSpacing: '0.3px' }}>
          {loading ? 'Setting up...' : step === 3 ? 'Open dashboard →' : 'Continue →'}
        </button>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{
            width: '100%', marginTop: 12, padding: '12px',
            fontSize: 13, color: '#5A5A5A', background: 'transparent', border: 'none',
            cursor: 'pointer', fontFamily: 'Urbanist, sans-serif', fontWeight: 600,
          }}>
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
