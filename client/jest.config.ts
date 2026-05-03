import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: '.',
    testMatch: ['<rootDir>/__tests__/**/*.test.ts', '<rootDir>/__tests__/**/*.test.tsx'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: false }],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^@store/(.*)$': '<rootDir>/src/store/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
};

export default config;
