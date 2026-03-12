-- Run this SQL in your Supabase SQL Editor
-- Go to: supabase.com → Your Project → SQL Editor → New Query → Paste this → Run

-- Firms table (one row per actuarial firm)
CREATE TABLE IF NOT EXISTS firms (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  firm_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments table (one row per loan applicant analysis)
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  applicant_name TEXT,
  age INTEGER,
  zip_code TEXT,
  employment_status TEXT,
  employment_duration_months INTEGER,
  annual_income NUMERIC,
  industry TEXT,
  loan_amount NUMERIC,
  loan_purpose TEXT,
  loan_history TEXT,
  existing_debt NUMERIC,
  monthly_expenses NUMERIC,
  dependents INTEGER DEFAULT 0,
  noema_score INTEGER NOT NULL,
  risk_rating TEXT NOT NULL,
  summary TEXT,
  analysis TEXT,
  factors JSONB,
  census_data JSONB,
  census_enriched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) - firms can only see their own assessments
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;

-- Policy: firms can only read/write their own data
CREATE POLICY "Firms can view own assessments"
  ON assessments FOR SELECT
  USING (firm_id = auth.uid());

CREATE POLICY "Firms can insert own assessments"
  ON assessments FOR INSERT
  WITH CHECK (firm_id = auth.uid());

CREATE POLICY "Firms can view own profile"
  ON firms FOR SELECT
  USING (id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessments_firm_id ON assessments(firm_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_score ON assessments(noema_score);
