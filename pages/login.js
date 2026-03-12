import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const router = useRouter()
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firmName, setFirmName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!email || !password) return setError('Please fill in all fields')
    if (mode === 'signup' && !firmName) return setError('Please enter your firm name')

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: mode, email, password, firmName })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setLoading(false)
        return
      }

      if (mode === 'signup') {
        setError('')
        setMode('login')
        setError('Account created — please log in')
        setLoading(false)
        return
      }

      // Store session
      localStorage.setItem('noema_user', JSON.stringify(data.user))
      router.push('/dashboard')

    } catch (err) {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Noema — Sign In</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap" rel="stylesheet"/>
      </Head>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0a0a0f;
          color: #e8e8f0;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse 80% 50% at 20% 0%, rgba(79,110,247,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse 60% 40% at 80% 100%, rgba(124,58,237,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .wrap {
          width: 100%;
          max-width: 420px;
          padding: 24px;
          position: relative;
          z-index: 1;
        }
        .logo {
          text-align: center;
          margin-bottom: 40px;
        }
        .logo-mark {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #4f6ef7, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo-sub {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #4a4a6a;
          font-family: 'DM Mono', monospace;
          margin-top: 4px;
        }
        .card {
          background: #111118;
          border: 1px solid #1e1e2e;
          border-radius: 16px;
          padding: 32px;
        }
        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .card-sub {
          font-size: 13px;
          color: #8888aa;
          margin-bottom: 28px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #4a4a6a;
          font-family: 'DM Mono', monospace;
          display: block;
          margin-bottom: 7px;
        }
        .form-input {
          width: 100%;
          background: #0a0a0f;
          border: 1px solid #1e1e2e;
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 14px;
          color: #e8e8f0;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .form-input:focus {
          border-color: #4f6ef7;
          box-shadow: 0 0 0 3px rgba(79,110,247,0.1);
        }
        .btn {
          width: 100%;
          padding: 13px;
          background: #4f6ef7;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          margin-top: 8px;
          box-shadow: 0 0 20px rgba(79,110,247,0.3);
          transition: all 0.15s;
        }
        .btn:hover:not(:disabled) {
          background: #3d5ce8;
          transform: translateY(-1px);
          box-shadow: 0 0 30px rgba(79,110,247,0.5);
        }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error {
          font-size: 12.5px;
          color: #ef4444;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 16px;
        }
        .success {
          color: #10b981;
          background: rgba(16,185,129,0.08);
          border-color: rgba(16,185,129,0.2);
        }
        .toggle {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: #8888aa;
        }
        .toggle span {
          color: #4f6ef7;
          cursor: pointer;
          font-weight: 500;
        }
        .toggle span:hover { text-decoration: underline; }
        .divider {
          border: none;
          border-top: 1px solid #1e1e2e;
          margin: 24px 0;
        }
        .trust {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 24px;
        }
        .trust-item {
          font-size: 11px;
          color: #4a4a6a;
          font-family: 'DM Mono', monospace;
          display: flex;
          align-items: center;
          gap: 5px;
        }
      `}</style>

      <div className="wrap">
        <div className="logo">
          <div className="logo-mark">Noema</div>
          <div className="logo-sub">Underwriting Intelligence</div>
        </div>

        <div className="card">
          <div className="card-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</div>
          <div className="card-sub">
            {mode === 'login' ? 'Sign in to your firm dashboard' : 'Start your free underwriting workspace'}
          </div>

          {error && (
            <div className={`error ${error.includes('created') ? 'success' : ''}`}>
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Firm Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Apex Actuarial LLC"
                value={firmName}
                onChange={e => setFirmName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@firm.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button className="btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="toggle">
            {mode === 'login' ? (
              <>No account? <span onClick={() => { setMode('signup'); setError('') }}>Sign up free</span></>
            ) : (
              <>Already have an account? <span onClick={() => { setMode('login'); setError('') }}>Sign in</span></>
            )}
          </div>
        </div>

        <div className="trust">
          <div className="trust-item">⬡ AI-Powered</div>
          <div className="trust-item">◈ Census Enriched</div>
          <div className="trust-item">◧ SOC 2 Ready</div>
        </div>
      </div>
    </>
  )
}
