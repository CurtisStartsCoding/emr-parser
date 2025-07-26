module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.ts'],
  testTimeout: 60000,
  maxWorkers: 1,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  globalTeardown: '<rootDir>/test/setup/global-teardown.js',
}; 