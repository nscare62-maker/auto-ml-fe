import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    checks: {},
  }

  // 1. Verify PostgreSQL Database (pg / Drizzle pool)
  try {
    const startTime = Date.now()
    const pgRes = await pool.query(
      "SELECT current_database() as database, version(), (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count;"
    )
    const tablesRes = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name LIMIT 15;"
    )
    results.checks.postgres = {
      status: 'connected',
      latencyMs: Date.now() - startTime,
      database: pgRes.rows[0].database,
      version: pgRes.rows[0].version.split(' on ')[0],
      totalTables: parseInt(pgRes.rows[0].table_count, 10),
      sampleTables: tablesRes.rows.map((r: { table_name: string }) => r.table_name),
    }
  } catch (err: any) {
    results.status = 'error'
    results.checks.postgres = {
      status: 'failed',
      error: err.message,
    }
  }

  // 2. Verify Supabase Client SDK (@supabase/supabase-js)
  try {
    const startTime = Date.now()
    const { count, error, status } = await supabase
      .from('datasets')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    results.checks.supabaseSdk = {
      status: 'connected',
      latencyMs: Date.now() - startTime,
      projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      httpStatus: status,
      datasetsCount: count,
    }
  } catch (err: any) {
    results.status = 'error'
    results.checks.supabaseSdk = {
      status: 'failed',
      error: err.message,
    }
  }

  return NextResponse.json(results, {
    status: results.status === 'ok' ? 200 : 500,
  })
}
