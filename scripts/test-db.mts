import 'dotenv/config'
import { prisma } from '../src/lib/db.ts'

const result = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`

console.log('Neon PostgreSQL connection OK:', result[0]?.ok === 1)

await prisma.$disconnect()
