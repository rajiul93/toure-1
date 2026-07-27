'use client'

import { getDefaultSiteConfig } from '@/lib/site-config'
import type { ResolvedSiteConfig } from '@/lib/site-config.types'
import { createContext, useContext } from 'react'

const SiteConfigContext = createContext<ResolvedSiteConfig>(getDefaultSiteConfig())

export function SiteConfigProvider({
  config,
  children,
}: {
  config: ResolvedSiteConfig
  children: React.ReactNode
}) {
  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfig() {
  return useContext(SiteConfigContext)
}
