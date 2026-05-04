// Script de migración — ejecuta todos los schemas SQL en Supabase
// Uso: node scripts/migrate.mjs TU_PASSWORD_AQUI

import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Client } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const password = process.argv[2]
if (!password) {
  console.error('❌  Uso: node scripts/migrate.mjs TU_PASSWORD')
  process.exit(1)
}

const client = new Client({
  connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.bhvwhnjvcggehwnijgno.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
})

const schemas = [
  'schema-core.sql',
  'schema-bpm.sql',
  'schema-finance.sql',
  'schema-compliance.sql',
  'schema-audit.sql',
  'seed.sql',
]

async function run() {
  console.log('🔌  Conectando a Supabase...')
  await client.connect()
  console.log('✅  Conectado\n')

  for (const file of schemas) {
    const filePath = path.join(__dirname, '..', 'supabase', file)
    const sql = fs.readFileSync(filePath, 'utf8')
    console.log(`⏳  Ejecutando ${file}...`)
    try {
      await client.query(sql)
      console.log(`✅  ${file} OK`)
    } catch (err) {
      console.error(`❌  Error en ${file}:`, err.message)
      await client.end()
      process.exit(1)
    }
  }

  console.log('\n🎉  Todos los schemas ejecutados correctamente')
  console.log('\nAhora creá tu usuario admin en Supabase → Authentication → Users')
  await client.end()
}

run().catch(err => {
  console.error('Error fatal:', err.message)
  process.exit(1)
})
