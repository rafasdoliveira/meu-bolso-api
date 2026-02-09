import ts from 'typescript';

/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  globals: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',

  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.json', diagnostics: true }],
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
