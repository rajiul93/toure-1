/**
 * Pre-deploy environment validation.
 * Run: pnpm exec tsx scripts/deploy-check.mts
 */
import { config } from 'dotenv'
import { resolveAuthEnv } from '../src/lib/auth/auth-env.ts'
import { resolveSiteUrl } from '../src/lib/site-config.ts'

config()

const errors: string[] = []
const warnings: string[] = []

try {
  resolveAuthEnv(process.env)
} catch (error) {
  errors.push(error instanceof Error ? error.message : String(error))
}

try {
  const url = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, 'production')
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    warnings.push(
      '[deploy] NEXT_PUBLIC_SITE_URL points at localhost — canonicals and sitemap will be wrong in production.',
    )
  }
} catch (error) {
  errors.push(error instanceof Error ? error.message : String(error))
}

if (!process.env.DATABASE_URL?.trim()) {
  errors.push('[deploy] DATABASE_URL is required.')
}

if (!process.env.R2_PUBLIC_URL?.trim()) {
  warnings.push('[deploy] R2_PUBLIC_URL is unset — remote blog images will not optimize through next/image.')
}

for (const warning of warnings) {
  console.warn(warning)
}

if (errors.length > 0) {
  console.error('\nDeploy check failed:\n')
  for (const error of errors) {
    console.error(`  • ${error}`)
  }
  process.exit(1)
}

console.log('Deploy check passed.')
