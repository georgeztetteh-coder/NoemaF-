import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, email, password, firmName } = req.body

  try {
    if (action === 'signup') {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) return res.status(400).json({ error: authError.message })

      // Create firm profile
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      await supabaseAdmin.from('firms').insert({
        id: authData.user.id,
        email,
        firm_name: firmName || 'My Firm',
        created_at: new Date().toISOString()
      })

      return res.status(200).json({ user: authData.user, message: 'Account created successfully' })
    }

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return res.status(401).json({ error: error.message })
      return res.status(200).json({ user: data.user, session: data.session })
    }

    return res.status(400).json({ error: 'Invalid action' })

  } catch (err) {
    console.error('Auth error:', err)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}

