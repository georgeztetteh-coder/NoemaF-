import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { firmId, limit = 20, offset = 0 } = req.query

  if (!firmId) {
    return res.status(400).json({ error: 'firmId required' })
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error, count } = await supabaseAdmin
      .from('assessments')
      .select('*', { count: 'exact' })
      .eq('firm_id', firmId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ assessments: data, total: count })

  } catch (err) {
    console.error('Assessments fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch assessments' })
  }
}
