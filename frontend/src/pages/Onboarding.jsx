// Onboarding.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profile as profileApi } from '../api/client'

const STEPS = [
  { title: 'Welcome', sub: "Let's set up your financial profile" },
  { title: 'Income', sub: 'Your take-home pay this month' },
  { title: 'Savings', sub: 'This gets protected first, every month' },
  { title: "You're set", sub: 'Your margin is ready' },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ city: '', occupation: '', monthly_income: '', savings_target: '' })
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const user = JSON.parse(localStorage.getItem('margin_user') || '{}')
  const income = parseFloat(form.monthly_income) || 0
  const savings = parseFloat(form.savings_target) || 0
  const margin = income - savings
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--night)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div className="orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle,rgba(124,108,240,0.12),transparent)', top: -200, right: -100 }} />
      <div className="orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(0,212,170,0.08),transparent)', bottom: -100, left: -50 }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, overflow: 'hidden', background: 'var(--glass2)' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,var(--violet),var(--teal))', width: i <= step ? '100%' : '0%', transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          ))}
        </div>

        <div key={step} className="fade-up">
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--violet),var(--indigo))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff' }}>{step + 1}</div>
            <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Step {step + 1} of {STEPS.length}</span>
          </div>

          <h1 className="syne" style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', color: 'var(--text)', marginBottom: 6 }}>{STEPS[step].title}</h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 32, fontWeight: 300 }}>{STEPS[step].sub}</p>

          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6, display: 'block' }}>City (optional)</label>
                <input className="input-field" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6, display: 'block' }}>What do you do?</label>
                <input className="input-field" value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} placeholder="Finance Student" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 18, fontWeight: 300 }}>₹</span>
                <input className="input-field" type="number" value={form.monthly_income} onChange={e => setForm({ ...form, monthly_income: e.target.value })}
                  style={{ paddingLeft: 36, fontSize: 24, fontWeight: 500, height: 64 }} placeholder="65,000" />
              </div>
              {income > 0 && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>₹{income.toLocaleString('en-IN')} per month</p>}
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 18, fontWeight: 300 }}>₹</span>
                <input className="input-field" type="number" value={form.savings_target} onChange={e => setForm({ ...form, savings_target: e.target.value })}
                  style={{ paddingLeft: 36, fontSize: 24, fontWeight: 500, height: 64 }} placeholder="15,000" />
              </div>
              {savings > 0 && income > 0 && (
                <div style={{ marginTop: 16, background: 'var(--violet3)', border: '0.5px solid rgba(124,108,240,0.25)', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: 'var(--muted)' }}>Income</span>
                    <span style={{ color: 'var(--text)' }}>₹{income.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                    <span style={{ color: 'var(--muted)' }}>Savings</span>
                    <span style={{ color: 'var(--violet2)' }}>−₹{savings.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ height: '0.5px', background: 'rgba(124,108,240,0.2)', marginBottom: 12 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 500 }}>
                    <span style={{ color: 'var(--text)' }}>Your margin</span>
                    <span className="gradient-text syne" style={{ fontSize: 18, fontWeight: 700 }}>₹{margin.toLocaleString('en-IN')}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{savRate}% savings rate</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--teal2)', border: '0.5px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28, animation: 'float 3s ease-in-out infinite' }}>✓</div>
              <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7 }}>
                Your margin is <span className="syne" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: 18 }}>₹{margin.toLocaleString('en-IN')}/month</span><br/>
                That's what you're allowed to spend.
              </p>
            </div>
          )}
        </div>

        <button className="btn-primary" onClick={next} disabled={!canNext() || loading}
          style={{ width: '100%', marginTop: 32, padding: '16px', fontSize: 15, opacity: (!canNext() || loading) ? 0.5 : 1 }}>
          {loading ? 'Setting up...' : step === 3 ? 'Open dashboard →' : 'Continue →'}
        </button>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{ width: '100%', marginTop: 10, padding: '10px', fontSize: 13, color: 'var(--faint)', background: 'transparent', border: 'none' }}>
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}
