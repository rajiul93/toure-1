'use client'

import { getDefaultTourConfig } from '@/lib/tour-config'
import type { ResolvedTourConfig } from '@/lib/tour-config.types'
import { createContext, useContext } from 'react'

const TourConfigContext = createContext<ResolvedTourConfig>(getDefaultTourConfig())

export function TourConfigProvider({
  config,
  children,
}: {
  config: ResolvedTourConfig
  children: React.ReactNode
}) {
  return <TourConfigContext.Provider value={config}>{children}</TourConfigContext.Provider>
}

export function useTourConfig() {
  return useContext(TourConfigContext)
}
