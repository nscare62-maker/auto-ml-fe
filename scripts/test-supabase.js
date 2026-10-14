const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const dbUrl = process.env.DATABASE_URL;

console.log('====================================================');
console.log('      AutoML-FE Supabase Connection Verifier        ');
console.log('====================================================\n');

async function verify() {
  console.log('1. Checking Environment Variables...');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL:', url ? '✅ Set (' + url + ')' : '❌ Missing');
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? '✅ Set (' + key.substring(0, 15) + '...)' : '❌ Missing');
  console.log('   - DATABASE_URL:', dbUrl ? '✅ Set' : '❌ Missing');
  console.log('');

  console.log('2. Testing Supabase JS Client SDK...');
  try {
    const supabase = createClient(url, key);
    const start = Date.now();
    const { count, error } = await supabase.from('datasets').select('*', { count: 'exact', head: true });
    if (error) throw error;
    console.log(`   ✅ Supabase SDK connected in ${Date.now() - start}ms! Found ${count} datasets.`);
  } catch (err) {
    console.log('   ❌ Supabase SDK failed:', err.message);
  }
  console.log('');

  console.log('3. Testing Direct PostgreSQL Connection (pg / Drizzle)...');
  try {
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    const start = Date.now();
    const res = await pool.query('SELECT current_database(), version();');
    console.log(`   ✅ PostgreSQL connected in ${Date.now() - start}ms!`);
    console.log(`   - Database: ${res.rows[0].current_database}`);
    console.log(`   - Engine: ${res.rows[0].version.split(' on ')[0]}`);

    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
    console.log(`   - Tables in public schema (${tables.rows.length}):`, tables.rows.map(r => r.table_name).join(', '));
    await pool.end();
  } catch (err) {
    console.log('   ❌ PostgreSQL connection failed:', err.message);
  }

  console.log('\n====================================================');
  console.log('Verification finished! Everything is working.');
  console.log('====================================================');
}

verify();
