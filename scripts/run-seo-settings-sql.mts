import 'dotenv/config'
import fs from 'node:fs'
import pg from 'pg'

async function main() {
  const sql = fs.readFileSync('prisma/sql/add-seo-settings-table.sql', 'utf8')
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

  try {
    await pool.query(sql)
    console.log('SeoSettings table created or already exists')
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
