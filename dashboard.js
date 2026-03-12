import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [recentAssessments, setRecentAssessments] = useState([])
  const [stats, setStats] = useState({ today: 0, avgScore: 0, approvalRate: 0 })

  // Form state
  const [form, setForm] = useState({
    firstName: '', lastName: '', age: '', zip: '',
    empStatus: '', empDuration: '', income: '', industry: '',
    loanAmount: '', loanPurpose: '', loanHistory: '',
    existingDebt: '', expenses: '', dependents: '', context: ''
  })

  useEffect(() => {
    const stored = localStorage.getItem('noema_user')
    if (!stored) { router.push('/login'); return }
    const u = JSON.parse(stored)
    setUser(u)
    fetchAssessments(u.id)
  }, [])

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function fetchAssessments(firmId) {
    try {
      const res = await fetch(`/api/assessments?firmId=${firmId}&limit=10`)
      const data = await res.json()
      if (data.assessments) {
        setRecentAssessments(data.assessments)
        // Calculate stats
        const today = data.assessments.filter(a => {
          const d = new Date(a.created_at)
          const now = new Date()
          return d.toDateString() === now.toDateString()
        }).length
        const avg = data.assessments.length
          ? Math.round(data.assessments.reduce((s, a) => s + a.noema_score, 0) / data.assessments.length)
          : 0
        const approved = data.assessments.filter(a => a.noema_score >= 60).length
        const rate = data.assessments.length
          ? Math.round((approved / data.assessments.length) * 100)
          : 0
        setStats({ today, avgScore: avg, approvalRate: rate })
      }
    } catch (err) {
      console.error('Failed to fetch assessments:', err)
    }
  }

  async function runAnalysis() {
    if (!form.empStatus || !form.income || !form.loanAmount || !form.loanHistory) {
      alert('Please fill in employment status, income, loan amount, and loan history.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, firmId: user?.id })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult(data)
      if (user) fetchAssessments(user.id)

    } catch (err) {
      alert('Analysis failed: ' + err.message)
    }

    setLoading(false)
  }

  function signOut() {
    localStorage.removeItem('noema_user')
    router.push('/login')
  }

  const scoreColor = result
    ? result.score >= 70 ? '#10b981' : result.score >= 50 ? '#f59e0b' : '#ef4444'
    : '#4a4a6a'

  const circumference = 326.7
  const scoreOffset = result ? circumference - (result.score / 100) * circumference : circumference

  return (
    <>
      <Head>
        <title>Noema — Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
      </Head>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{
          --bg:#0a0a0f;--surface:#111118;--surface2:#16161f;
          --border:#1e1e2e;--border2:#2a2a3e;
          --accent:#4f6ef7;--accent2:#7c3aed;--accent-glow:rgba(79,110,247,0.15);
          --text:#e8e8f0;--text2:#8888aa;--text3:#4a4a6a;
          --green:#10b981;--yellow:#f59e0b;--red:#ef4444;
          --green-bg:rgba(16,185,129,0.08);--yellow-bg:rgba(245,158,11,0.08);--red-bg:rgba(239,68,68,0.08);
        }
        body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden;}
        body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 50% at 20% 0%,rgba(79,110,247,0.07) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 100%,rgba(124,58,237,0.05) 0%,transparent 60%);pointer-events:none;z-index:0;}
        .app{position:relative;z-index:1;display:flex;min-height:100vh;}
        .sidebar{width:240px;min-height:100vh;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:28px 0;position:fixed;top:0;left:0;bottom:0;}
        .logo{padding:0 24px 32px;border-bottom:1px solid var(--border);margin-bottom:24px;}
        .logo-mark{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#4f6ef7,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .logo-sub{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);font-family:'DM Mono',monospace;margin-top:2px;}
        .nav-section{padding:0 12px;margin-bottom:8px;}
        .nav-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);font-family:'DM Mono',monospace;padding:0 12px;margin-bottom:6px;}
        .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;font-size:13.5px;color:var(--text2);cursor:pointer;transition:all 0.15s;margin-bottom:2px;}
        .nav-item:hover{background:var(--surface2);color:var(--text);}
        .nav-item.active{background:var(--accent-glow);color:var(--accent);border:1px solid rgba(79,110,247,0.2);}
        .nav-icon{font-size:15px;width:18px;text-align:center;}
        .sidebar-footer{margin-top:auto;padding:20px 24px 0;border-top:1px solid var(--border);}
        .firm-badge{display:flex;align-items:center;gap:10px;}
        .firm-avatar{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;font-family:'Syne',sans-serif;}
        .firm-name{font-size:13px;font-weight:500;color:var(--text);}
        .firm-role{font-size:11px;color:var(--text3);cursor:pointer;}
        .firm-role:hover{color:var(--red);}
        .main{margin-left:240px;flex:1;padding:40px 48px;max-width:calc(100vw - 240px);}
        .page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:40px;}
        .page-title{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;letter-spacing:-0.5px;}
        .page-subtitle{font-size:13.5px;color:var(--text2);margin-top:4px;}
        .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;}
        .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px 22px;}
        .stat-label{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);font-family:'DM Mono',monospace;margin-bottom:10px;}
        .stat-value{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;letter-spacing:-1px;}
        .stat-change{font-size:12px;color:var(--green);margin-top:4px;}
        .content-grid{display:grid;grid-template-columns:1fr 380px;gap:24px;align-items:start;}
        .card{background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
        .card-header{padding:22px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
        .card-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:600;}
        .card-badge{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;font-family:'DM Mono',monospace;padding:4px 10px;border-radius:20px;background:var(--accent-glow);color:var(--accent);border:1px solid rgba(79,110,247,0.2);}
        .card-body{padding:28px;}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:24px;}
        .form-group{display:flex;flex-direction:column;gap:7px;}
        .form-group.full{grid-column:1/-1;}
        .form-label{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--text3);font-family:'DM Mono',monospace;}
        .form-input,.form-select{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:13.5px;color:var(--text);font-family:'DM Sans',sans-serif;transition:border-color 0.15s,box-shadow 0.15s;outline:none;width:100%;}
        .form-input:focus,.form-select:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(79,110,247,0.1);}
        .form-select option{background:var(--surface);}
        .form-hint{font-size:11px;color:var(--text3);}
        .section-divider{border:none;border-top:1px solid var(--border);margin:24px 0;}
        .section-title{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);font-family:'DM Mono',monospace;margin-bottom:18px;}
        .btn{padding:9px 18px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
        .btn-primary{background:var(--accent);color:white;box-shadow:0 0 20px rgba(79,110,247,0.3);}
        .btn-primary:hover:not(:disabled){background:#3d5ce8;box-shadow:0 0 30px rgba(79,110,247,0.5);transform:translateY(-1px);}
        .btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
        .result-panel{display:flex;flex-direction:column;gap:16px;}
        .score-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px;text-align:center;position:relative;overflow:hidden;}
        .score-card.has-score::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--accent2));}
        .score-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--text3);font-family:'DM Mono',monospace;margin-bottom:16px;}
        .score-ring{width:120px;height:120px;margin:0 auto 16px;position:relative;}
        .score-ring svg{transform:rotate(-90deg);}
        .score-number{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;}
        .score-big{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;letter-spacing:-2px;line-height:1;}
        .score-max{font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;}
        .score-rating{font-size:13px;font-weight:600;padding:5px 16px;border-radius:20px;display:inline-block;margin-bottom:8px;}
        .rating-high{background:var(--green-bg);color:var(--green);}
        .rating-medium{background:var(--yellow-bg);color:var(--yellow);}
        .rating-low{background:var(--red-bg);color:var(--red);}
        .score-desc{font-size:12px;color:var(--text2);line-height:1.5;}
        .factors-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
        .factor-item{padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:14px;}
        .factor-item:last-child{border-bottom:none;}
        .factor-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;background:rgba(79,110,247,0.08);color:var(--accent);}
        .factor-info{flex:1;}
        .factor-name{font-size:12.5px;font-weight:500;margin-bottom:3px;}
        .factor-val{font-size:11px;color:var(--text2);font-family:'DM Mono',monospace;}
        .factor-bar-wrap{width:60px;height:4px;background:var(--border);border-radius:2px;overflow:hidden;}
        .factor-bar{height:100%;border-radius:2px;transition:width 1s ease;}
        .analysis-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
        .analysis-body{padding:20px;font-size:13px;line-height:1.75;color:var(--text2);max-height:280px;overflow-y:auto;}
        .census-badge{display:inline-flex;align-items:center;gap:5px;font-size:10px;padding:3px 10px;border-radius:20px;background:rgba(16,185,129,0.08);color:#10b981;border:1px solid rgba(16,185,129,0.2);font-family:'DM Mono',monospace;margin-bottom:10px;}
        .empty-state{padding:40px 28px;text-align:center;color:var(--text3);}
        .empty-icon{font-size:32px;margin-bottom:12px;}
        .empty-title{font-size:14px;font-weight:500;color:var(--text2);margin-bottom:6px;}
        .empty-desc{font-size:12px;line-height:1.6;}
        .loading-dots{display:flex;gap:6px;align-items:center;justify-content:center;padding:40px;}
        .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 1.2s ease-in-out infinite;}
        .dot:nth-child(2){animation-delay:0.2s;}
        .dot:nth-child(3){animation-delay:0.4s;}
        @keyframes pulse{0%,100%{opacity:0.2;transform:scale(0.8);}50%{opacity:1;transform:scale(1.2);}}
        .recent-card{margin-top:24px;}
        table{width:100%;border-collapse:collapse;font-size:13px;}
        th{text-align:left;padding:12px 20px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);font-family:'DM Mono',monospace;font-weight:400;border-bottom:1px solid var(--border);}
        td{padding:14px 20px;border-bottom:1px solid var(--border);color:var(--text2);}
        tr:last-child td{border-bottom:none;}
        .td-name{color:var(--text);font-weight:500;}
        .badge{font-size:10px;padding:3px 10px;border-radius:20px;font-weight:500;}
        .badge-green{background:var(--green-bg);color:var(--green);}
        .badge-yellow{background:var(--yellow-bg);color:var(--yellow);}
        .badge-red{background:var(--red-bg);color:var(--red);}
        .mono{font-family:'DM Mono',monospace;font-size:12px;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .fade-in{animation:fadeIn 0.4s ease forwards;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}
      `}</style>

      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark">Noema</div>
            <div className="logo-sub">Underwriting Intelligence</div>
          </div>
          <div className="nav-section">
            <div className="nav-label">Workspace</div>
            <div className="nav-item active"><span className="nav-icon">⬡</span> New Assessment</div>
            <div className="nav-item"><span className="nav-icon">◫</span> All Applications</div>
            <div className="nav-item"><span className="nav-icon">◈</span> Analytics</div>
          </div>
          <div className="nav-section" style={{marginTop:16}}>
            <div className="nav-label">Tools</div>
            <div className="nav-item"><span className="nav-icon">◎</span> Census Lookup</div>
            <div className="nav-item"><span className="nav-icon">◧</span> Risk Models</div>
            <div className="nav-item"><span className="nav-icon">⊞</span> Batch Import</div>
          </div>
          <div className="sidebar-footer">
            <div className="firm-badge">
              <div className="firm-avatar">{user?.email?.[0]?.toUpperCase() || 'F'}</div>
              <div>
                <div className="firm-name">{user?.email?.split('@')[0] || 'Your Firm'}</div>
                <div className="firm-role" onClick={signOut}>Sign out</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="page-header">
            <div>
              <div className="page-title">New Assessment</div>
              <div className="page-subtitle">Submit applicant data for AI-powered underwriting analysis</div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Assessments Today</div>
              <div className="stat-value">{stats.today}</div>
              <div className="stat-change" style={{color:'var(--text2)'}}>This session</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg Score</div>
              <div className="stat-value">{stats.avgScore || '—'}</div>
              <div className="stat-change" style={{color:'var(--text2)'}}>All time</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Approval Rate</div>
              <div className="stat-value">{stats.approvalRate ? stats.approvalRate + '%' : '—'}</div>
              <div className="stat-change" style={{color:'var(--text2)'}}>Score ≥ 60</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Census Data</div>
              <div className="stat-value" style={{fontSize:20,paddingTop:4}}>Live</div>
              <div className="stat-change">◈ ZIP enrichment on</div>
            </div>
          </div>

          <div className="content-grid">
            <div>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Applicant Profile</div>
                  <div className="card-badge">ML Model v2.1</div>
                </div>
                <div className="card-body">
                  <div className="section-title">Personal Information</div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input className="form-input" placeholder="John" value={form.firstName} onChange={e=>update('firstName',e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input className="form-input" placeholder="Smith" value={form.lastName} onChange={e=>update('lastName',e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input className="form-input" type="number" placeholder="34" value={form.age} onChange={e=>update('age',e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">ZIP Code</label>
                      <input className="form-input" placeholder="10001" maxLength={5} value={form.zip} onChange={e=>update('zip',e.target.value)}/>
                    </div>
                  </div>

                  <hr className="section-divider"/>
                  <div className="section-title">Employment & Income</div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Employment Status</label>
                      <select className="form-select" value={form.empStatus} onChange={e=>update('empStatus',e.target.value)}>
                        <option value="">Select status</option>
                        <option value="full-time">Full-Time Employed</option>
                        <option value="part-time">Part-Time Employed</option>
                        <option value="self-employed">Self-Employed</option>
                        <option value="contract">Contract / Freelance</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duration (months)</label>
                      <input className="form-input" type="number" placeholder="36" value={form.empDuration} onChange={e=>update('empDuration',e.target.value)}/>
                      <span className="form-hint">Time at current employer</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Annual Income ($)</label>
                      <input className="form-input" type="number" placeholder="65000" value={form.income} onChange={e=>update('income',e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry</label>
                      <select className="form-select" value={form.industry} onChange={e=>update('industry',e.target.value)}>
                        <option value="">Select industry</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="retail">Retail / Service</option>
                        <option value="construction">Construction / Trades</option>
                        <option value="government">Government</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <hr className="section-divider"/>
                  <div className="section-title">Loan & Credit Profile</div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Loan Amount ($)</label>
                      <input className="form-input" type="number" placeholder="25000" value={form.loanAmount} onChange={e=>update('loanAmount',e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Loan Purpose</label>
                      <select className="form-select" value={form.loanPurpose} onChange={e=>update('loanPurpose',e.target.value)}>
                        <option value="">Select purpose</option>
                        <option value="business">Business Expansion</option>
                        <option value="startup">Startup Capital</option>
                        <option value="equipment">Equipment Purchase</option>
                        <option value="real-estate">Real Estate</option>
                        <option value="personal">Personal</option>
                        <option value="debt-consolidation">Debt Consolidation</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Prior Loan History</label>
                      <select className="form-select" value={form.loanHistory} onChange={e=>update('loanHistory',e.target.value)}>
                        <option value="">Select history</option>
                        <option value="excellent">Excellent — No defaults</option>
                        <option value="good">Good — Minor late payments</option>
                        <option value="fair">Fair — Some defaults, resolved</option>
                        <option value="poor">Poor — Active defaults</option>
                        <option value="none">No prior history</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Existing Debt ($)</label>
                      <input className="form-input" type="number" placeholder="8000" value={form.existingDebt} onChange={e=>update('existingDebt',e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Monthly Expenses ($)</label>
                      <input className="form-input" type="number" placeholder="3200" value={form.expenses} onChange={e=>update('expenses',e.target.value)}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dependents</label>
                      <input className="form-input" type="number" placeholder="1" min="0" value={form.dependents} onChange={e=>update('dependents',e.target.value)}/>
                    </div>
                    <div className="form-group full">
                      <label className="form-label">Additional Context (optional)</label>
                      <input className="form-input" placeholder="e.g. Recently started a second income stream, owns property..." value={form.context} onChange={e=>update('context',e.target.value)}/>
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={runAnalysis} disabled={loading} style={{width:'100%',padding:13,fontSize:14}}>
                    {loading ? 'Analyzing...' : 'Run Noema Analysis'}
                  </button>
                </div>
              </div>

              {/* Recent assessments */}
              <div className="card recent-card">
                <div className="card-header">
                  <div className="card-title">Recent Assessments</div>
                  <div className="card-badge">{recentAssessments.length} total</div>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table>
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Loan Amount</th>
                        <th>Score</th>
                        <th>Rating</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAssessments.length === 0 ? (
                        <tr><td colSpan={5} style={{textAlign:'center',color:'var(--text3)',padding:'32px'}}>No assessments yet — run your first analysis above</td></tr>
                      ) : recentAssessments.map(a => (
                        <tr key={a.id}>
                          <td className="td-name">{a.applicant_name || 'Unknown'}</td>
                          <td className="mono">{a.loan_amount ? '$' + parseInt(a.loan_amount).toLocaleString() : '—'}</td>
                          <td className="mono">{a.noema_score}</td>
                          <td>
                            <span className={`badge ${a.risk_rating === 'Low Risk' ? 'badge-green' : a.risk_rating === 'Medium Risk' ? 'badge-yellow' : 'badge-red'}`}>
                              {a.risk_rating}
                            </span>
                          </td>
                          <td className="mono" style={{color:'var(--text3)'}}>
                            {new Date(a.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Result panel */}
            <div className="result-panel">
              <div className={`score-card ${result ? 'has-score' : ''}`}>
                <div className="score-label">Noema Risk Score</div>
                <div className="score-ring">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#1e1e2e" strokeWidth="8"/>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#sg)" strokeWidth="8"
                      strokeLinecap="round" strokeDasharray="326.7"
                      strokeDashoffset={scoreOffset} style={{transition:'stroke-dashoffset 1.2s ease'}}/>
                    <defs>
                      <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f6ef7"/>
                        <stop offset="100%" stopColor="#7c3aed"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="score-number">
                    <div className="score-big" style={{color: result ? scoreColor : 'var(--text3)'}}>
                      {result ? result.score : '—'}
                    </div>
                    <div className="score-max">/100</div>
                  </div>
                </div>
                {result && (
                  <div className={`score-rating ${result.score >= 70 ? 'rating-high' : result.score >= 50 ? 'rating-medium' : 'rating-low'}`} style={{marginBottom:10}}>
                    {result.rating}
                  </div>
                )}
                <div className="score-desc">
                  {result ? result.summary : 'Submit an applicant profile to generate an AI-powered risk score and underwriting recommendation.'}
                </div>
                {result?.censusData && (
                  <div style={{marginTop:12}}>
                    <span className="census-badge">◈ Census Enriched</span>
                  </div>
                )}
              </div>

              {/* Factors */}
              <div className="factors-card">
                <div className="card-header">
                  <div className="card-title">Factor Breakdown</div>
                </div>
                {loading ? (
                  <div className="loading-dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>
                ) : result ? (
                  result.factors.map((f, i) => {
                    const barColor = f.score >= 70 ? 'var(--green)' : f.score >= 50 ? 'var(--yellow)' : 'var(--red)'
                    const icons = ['◷','◈','◎','◧','◫','⬡']
                    return (
                      <div className="factor-item fade-in" key={i} style={{animationDelay:`${i*0.08}s`}}>
                        <div className="factor-icon">{icons[i]}</div>
                        <div className="factor-info">
                          <div className="factor-name">{f.name}</div>
                          <div className="factor-val">{f.note}</div>
                        </div>
                        <div>
                          <div className="factor-bar-wrap">
                            <div className="factor-bar" style={{width:`${f.score}%`,background:barColor}}/>
                          </div>
                          <div style={{fontSize:10,color:'var(--text3)',textAlign:'right',marginTop:3,fontFamily:"'DM Mono',monospace"}}>{f.score}</div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">◈</div>
                    <div className="empty-title">No data yet</div>
                    <div className="empty-desc">Factor scores appear after analysis</div>
                  </div>
                )}
              </div>

              {/* Analysis */}
              <div className="analysis-card">
                <div className="card-header">
                  <div className="card-title">AI Analysis</div>
                  <div className="card-badge">{loading ? 'Processing' : result ? 'Complete' : 'Awaiting Input'}</div>
                </div>
                {loading ? (
                  <div className="loading-dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>
                ) : result ? (
                  <div className="analysis-body fade-in">{result.analysis}</div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">⬡</div>
                    <div className="empty-title">Analysis will appear here</div>
                    <div className="empty-desc">Noema generates a detailed written assessment of repayment likelihood, risk factors, and recommendations.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
