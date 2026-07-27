import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coveragePathIgnorePatterns: ['/node_modules/', '/generated/'],
  moduleNameMapper: {
    // Tests already run in jsdom, so use the browser build directly. The
    // isomorphic wrapper only exists to bundle jsdom for Node, and its ESM
    // dependencies are not transformable by Jest.
    '^isomorphic-dompurify$': 'dompurify',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/generated/'],
}

export default createJestConfig(config)
