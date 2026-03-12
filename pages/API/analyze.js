import Anthropic from '@anthropic-ai/sdk'
import { getCensusData } from '../../lib/census'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Server-side Supabase client with service role for writing assessments
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    firmId,
    firstName, lastName, age, zip,
    empStatus, empDuration, income, industry,
    loanAmount, loanPurpose, loanHistory,
    existingDebt, expenses, dependents, context
  } = req.body

  if (!empStatus || !income || !loanAmount || !loanHistory) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Step 1: Pull real Census data for this ZIP code
    const censusData = zip ? await getCensusData(zip) : null

    // Step 2: Build prompt with Census context enrichment
    const name = [firstName, lastName].filter(Boolean).join(' ') || 'Applicant'
    const debtToIncome = income ? ((parseFloat(existingDebt || 0) / parseFloat(income)) * 100).toFixed(1) : 'N/A'
    const monthlyIncome = income ? (parseFloat(income) / 12).toFixed(0) : 'N/A'
    const monthlyDebtPayment = existingDebt ? (parseFloat(existingDebt) / 60).toFixed(0) : '0'

    const censusContext = censusData
      ? `\nCensus Bureau Data for applicant ZIP (${zip}): ${censusData.context}`
      : ''

    const prompt = `You are Noema, an AI underwriting engine for actuarial firms. Analyze this loan applicant and return a JSON object only — no markdown, no explanation outside the JSON.

Applicant Data:
- Name: ${name}
- Age: ${age || 'Not provided'}
- ZIP Code: ${zip || 'Not provided'}
- Employment Status: ${empStatus}
- Employment Duration: ${empDuration ? empDuration + ' months' : 'Not provided'}
- Annual Income: ${income ? '$' + parseInt(income).toLocaleString() : 'Not provided'}
- Monthly Income: $${monthlyIncome}
- Industry: ${industry || 'Not provided'}
- Loan Amount Requested: ${loanAmount ? '$' + parseInt(loanAmount).toLocaleString() : 'Not provided'}
- Loan Purpose: ${loanPurpose || 'Not provided'}
- Prior Loan History: ${loanHistory}
- Existing Debt: ${existingDebt ? '$' + parseInt(existingDebt).toLocaleString() : 'Not provided'}
- Estimated Monthly Debt Payment: $${monthlyDebtPayment}
- Monthly Expenses: ${expenses ? '$' + parseInt(expenses).toLocaleString() : 'Not provided'}
- Dependents: ${dependents || '0'}
- Debt-to-Income Ratio: ${debtToIncome}%
- Additional Context: ${context || 'None'}
${censusContext}

Return ONLY this JSON structure:
{
  "score": <integer 0-100>,
  "rating": <"Low Risk" | "Medium Risk" | "High Risk">,
  "summary": <2-sentence summary of overall risk profile>,
  "analysis": <4-6 sentence detailed professional analysis covering repayment likelihood, key risk factors, mitigating factors, census context if available, and underwriting recommendation>,
  "factors": [
    {"name": "Employment Stability", "score": <0-100>, "note": "<brief note>"},
    {"name": "Income Adequacy", "score": <0-100>, "note": "<brief note>"},
    {"name": "Debt Burden", "score": <0-100>, "note": "<brief note>"},
    {"name": "Loan Purpose", "score": <0-100>, "note": "<brief note>"},
    {"name": "Credit History", "score": <0-100>, "note": "<brief note>"},
    {"name": "Repayment Capacity", "score": <0-100>, "note": "<brief note>"}
  ],
  "censusEnriched": ${censusData ? 'true' : 'false'}
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = response.content.map(b => b.text || '').join('')
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    // Step 3: Save assessment to Supabase
    const assessment = {
      firm_id: firmId || null,
      applicant_name: name,
      age: age ? parseInt(age) : null,
      zip_code: zip || null,
      employment_status: empStatus,
      employment_duration_months: empDuration ? parseInt(empDuration) : null,
      annual_income: income ? parseFloat(income) : null,
      industry: industry || null,
      loan_amount: loanAmount ? parseFloat(loanAmount) : null,
      loan_purpose: loanPurpose || null,
      loan_history: loanHistory,
      existing_debt: existingDebt ? parseFloat(existingDebt) : null,
      monthly_expenses: expenses ? parseFloat(expenses) : null,
      dependents: dependents ? parseInt(dependents) : 0,
      noema_score: result.score,
      risk_rating: result.rating,
      summary: result.summary,
      analysis: result.analysis,
      factors: result.factors,
      census_data: censusData,
      census_enriched: result.censusEnriched,
      created_at: new Date().toISOString()
    }

    const { data: saved, error: dbError } = await supabaseAdmin
      .from('assessments')
      .insert(assessment)
      .select()
      .single()

    if (dbError) {
      console.error('DB save error:', dbError)
      // Don't fail the request if DB save fails — still return result
    }

    return res.status(200).json({
      ...result,
      assessmentId: saved?.id || null,
      censusData: censusData || null
    })

  } catch (err) {
    console.error('Analysis error:', err)
    return res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
}
