import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const { type, data } = payload

  if (type === 'user.created' || type === 'user.updated') {
    const {
      id: clerk_id,
      email_addresses,
      username,
      first_name,
      image_url,
    } = data

    const email = email_addresses?.[0]?.email_address || ''
    const generatedUsername = username || first_name?.toLowerCase().replace(/\s+/g, '') || `user_${Date.now()}`

    const { error } = await supabaseAdmin().from('users').upsert(
      {
        clerk_id,
        email,
        username: generatedUsername,
        avatar_url: image_url || null,
      },
      { onConflict: 'clerk_id' }
    )

    if (error) {
      console.error('User sync error:', error)
      return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
