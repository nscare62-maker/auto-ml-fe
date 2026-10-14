import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'

export const pool = new Pool({
  connectionString,
  ssl:
    connectionString?.includes('supabase') || connectionString?.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : undefined,
})
export const db = drizzle(pool, { schema })
