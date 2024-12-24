import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/types/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'src/lib/db/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'src/lib/auth/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    }
  },
  coverageDirectory: 'coverage',
  testMatch: [
    '<rootDir>/src/__tests__/**/*.{spec,test}.{ts,tsx}',
    '<rootDir>/src/lib/**/*.{spec,test}.{ts,tsx}',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  roots: ['<rootDir>/src'],
  modulePaths: ['<rootDir>/src'],
  testTimeout: 10000
}

export default createJestConfig(config) 