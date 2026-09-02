import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://afnakrhjcwljamiigodg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbmFrcmhqY3dsamFtaWlnb2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMDcwNzMsImV4cCI6MjEwMzg4MzA3M30.eFOT2Mn9G-9SEnn9vZqt0Ws0vDf8blrK7L-sz75u4xA'

export const supabase = createClient(supabaseUrl, supabaseKey)
