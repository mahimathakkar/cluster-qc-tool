#!/usr/bin/env ts-node
/**
 * Promote a user to admin role.
 * Usage: npx ts-node scripts/set-admin.ts <email>
 */

import { createClient } from '@supabase/supabase-js'

const email = process.argv[2]

if (!email) {
  console.error('Usage: npx ts-node scripts/set-admin.ts <email>')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.')
  console.error('Run: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/set-admin.ts <email>')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('email', email)
    .select()

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error(`No user found with email: ${email}`)
    console.error('Make sure the user has signed up first.')
    process.exit(1)
  }

  console.log(`✓ ${email} is now an admin.`)
}

main()
