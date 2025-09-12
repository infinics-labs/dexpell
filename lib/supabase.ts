import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Better error handling for missing environment variables
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Only create clients if we have the required variables
let supabase: any = null
let supabaseAdmin: any = null

if (supabaseUrl && supabaseAnonKey) {
  // Client for browser
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

  // Admin client for server-side operations
  if (supabaseServiceKey) {
    supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)
  } else {
    console.warn('Missing SUPABASE_SERVICE_ROLE_KEY - admin operations will not work')
    supabaseAdmin = supabase // Fallback to regular client
  }
} else {
  console.error('Supabase clients not initialized - missing environment variables')
}

export { supabase, supabaseAdmin }
