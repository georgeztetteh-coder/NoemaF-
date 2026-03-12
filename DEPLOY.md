# Noema — Deployment Guide
## From zero to live on Vercel in ~30 minutes

---

## What You're Building
A full-stack web app with:
- AI-powered underwriting analysis (Anthropic API)
- Real US Census data by ZIP code
- Database storing every assessment (Supabase)
- User authentication for firms (Supabase Auth)
- Deployed live on Vercel

---

## Step 1 — Install Node.js (5 minutes)
1. Go to nodejs.org
2. Download the LTS version (green button)
3. Install it — just click through the prompts
4. Open Terminal (Mac) or Command Prompt (Windows)
5. Type: `node --version`
6. You should see something like `v20.11.0` — that means it worked

---

## Step 2 — Set Up GitHub (5 minutes)
1. Go to github.com and create a free account if you don't have one
2. Download GitHub Desktop from desktop.github.com (easier than command line)
3. Sign in to GitHub Desktop
4. Click "Create New Repository"
   - Name: `noema`
   - Make it Private
   - Click Create Repository
5. Click "Show in Finder/Explorer" — remember this folder location

---

## Step 3 — Add the Code (2 minutes)
1. Copy ALL the files from this folder into your GitHub repository folder
2. In GitHub Desktop you'll see all the files listed as changes
3. At the bottom left type "Initial commit" in the Summary box
4. Click "Commit to main"
5. Click "Push origin" (top right)
6. Your code is now on GitHub

---

## Step 4 — Set Up Supabase (10 minutes)
1. Go to supabase.com → Sign up free
2. Click "New Project"
   - Organization: Your name
   - Name: `noema`
   - Database Password: Create a strong password (SAVE THIS)
   - Region: US East (closest to NYC)
3. Wait ~2 minutes for it to spin up
4. Click "SQL Editor" in the left sidebar
5. Click "New Query"
6. Open the file `supabase-schema.sql` from this folder
7. Copy ALL of it and paste into the SQL Editor
8. Click "Run" — you should see "Success"

Now get your Supabase keys:
1. Click "Settings" (gear icon, bottom left)
2. Click "API"
3. Copy and save these three values:
   - Project URL → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → this is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret)

---

## Step 5 — Get Your Census API Key (2 minutes)
1. Go to api.census.gov/data/key_signup.html
2. Fill in your name and email
3. They email you a key instantly
4. Save it — this is your `CENSUS_API_KEY`

---

## Step 6 — Deploy to Vercel (5 minutes)
1. Go to vercel.com → Sign up with your GitHub account
2. Click "Add New Project"
3. Find your `noema` repository and click "Import"
4. Before clicking Deploy, click "Environment Variables"
5. Add each variable one by one:
   - `ANTHROPIC_API_KEY` → your Anthropic key
   - `NEXT_PUBLIC_SUPABASE_URL` → from Step 4
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → from Step 4
   - `SUPABASE_SERVICE_ROLE_KEY` → from Step 4
   - `CENSUS_API_KEY` → from Step 5
6. Click "Deploy"
7. Wait ~2 minutes
8. Vercel gives you a live URL like `noema-george.vercel.app`

---

## Step 7 — Add Your Domain (optional, 5 minutes)
1. Buy `noema.ai` or `trynoema.com` on Namecheap (~$10-15/year)
2. In Vercel → Your Project → Settings → Domains
3. Add your domain and follow the DNS instructions
4. Live in ~10 minutes

---

## What Each File Does (learn this)

| File | What it does |
|---|---|
| `pages/api/analyze.js` | The brain — takes applicant data, calls Census API, calls Anthropic AI, saves to database |
| `pages/api/auth.js` | Handles firm login and signup |
| `pages/api/assessments.js` | Fetches a firm's assessment history |
| `lib/census.js` | Pulls real demographic data from US Census Bureau by ZIP code |
| `lib/supabase.js` | Connects to your database |
| `supabase-schema.sql` | Creates your database tables |
| `.env.local` | Stores your secret API keys (never share this file) |

---

## When You're Stuck
Come back to Claude and say:
"I'm at Step X of the Noema deployment and I'm seeing this error: [paste error]"

I'll fix it with you line by line.

---

## After It's Live
- Add the URL to your portfolio website
- Add it to your Common App activities list
- Screenshot the live dashboard for your college applications
- You now have a real deployed fintech product

---

*Built by George Tetteh — Noema v0.1*
