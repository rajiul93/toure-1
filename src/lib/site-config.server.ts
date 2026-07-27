import 'server-only'

import { getSiteConfigFromDB } from '@/lib/services/site-settings.service'

export async function getSiteConfig() {
  return getSiteConfigFromDB()
}
