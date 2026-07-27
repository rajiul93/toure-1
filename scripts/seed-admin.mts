/**
 * One-time bootstrap for the first admin user.
 *
 * Loads `.env.local` then `.env` automatically — set:
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 *   NEON_AUTH_BASE_URL
 *
 * Usage: pnpm seed:admin
 *
 * After seeding, set role to admin in Neon SQL Editor:
 *   UPDATE neon_auth."user" SET role = 'admin' WHERE email = 'your@email.com';
 */
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const name = process.env.SEED_ADMIN_NAME ?? 'Admin'
const email = process.env.SEED_ADMIN_EMAIL
const password = process.env.SEED_ADMIN_PASSWORD
const baseUrl = process.env.NEON_AUTH_BASE_URL?.replace(/\/$/, '')

if (!baseUrl) {
  console.error('Set NEON_AUTH_BASE_URL in .env')
  process.exit(1)
}

if (!email || !password) {
  console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env')
  process.exit(1)
}

const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

const signUpUrl = `${baseUrl}/sign-up/email`

const response = await fetch(signUpUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: siteOrigin,
  },
  body: JSON.stringify({ name, email, password }),
})

const payload = (await response.json().catch(() => null)) as {
  user?: { email?: string }
  message?: string
  error?: string
} | null

if (!response.ok) {
  console.error(
    'Sign-up failed:',
    payload?.message ?? payload?.error ?? response.statusText,
  )
  process.exit(1)
}

console.log('User created:', payload?.user?.email ?? email)
console.log(
  'Promote to admin in Neon SQL Editor:\n' +
    `  UPDATE neon_auth."user" SET role = 'admin' WHERE email = '${email}';`,
)
