import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://afnakrhjcwljamiigodg.supabase.co'
const supabaseKey = 'sb_publishable_i5oDuhmBbQ7MSlhINyVDsA_8Tu3Bckx'

export const supabase = createClient(supabaseUrl, supabaseKey)
