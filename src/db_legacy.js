const { createClient } = require('@supabase/supabase-js')
const { Pool } = require('pg')
require('dotenv').config()

// Kết nối trực tiếp qua Supabase JS Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Hoặc kết nối trực tiếp qua PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

module.exports = {
  supabase,
  pool
}