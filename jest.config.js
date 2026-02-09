/** @type {import('jest').Config} */
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',

  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { useESM: true }],
  },

  extensionsToTreatAsEsm: ['.ts'],

  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/dto/**',
    '!src/**/entities/**',
    '!src/migrations/**',
    '!src/interceptors/**',
  ],
};
