'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function saveUserProfile({
  username,
  bio,
  email,
  avatarUrl,
}: {
  username: string
  bio: string
  email: string
  avatarUrl: string | null
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = supabaseAdmin()

  // Check username is not taken by another user
  const { data: existing } = await supabase
    .from('users')
    .select('id, clerk_id')
    .eq('username', username)
    .single()

  if (existing && existing.clerk_id !== userId) {
    throw new Error('Username already taken')
  }

  const { error } = await supabase.from('users').upsert(
    {
      clerk_id: userId,
      username,
      bio: bio || null,
      email,
      avatar_url: avatarUrl || null,
    },
    { onConflict: 'clerk_id' }
  )

  if (error) throw new Error(error.message)

  return { success: true }
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { userId } = await auth()

  const { data } = await supabaseAdmin()
    .from('users')
    .select('id, clerk_id')
    .eq('username', username)
    .single()

  // Available if no row, or if it belongs to current user
  if (!data) return true
  if (userId && data.clerk_id === userId) return true
  return false
}