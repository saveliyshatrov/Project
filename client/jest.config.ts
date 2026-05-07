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
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@widget/(.*)$': '<rootDir>/src/widget/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!**/__tests__/**',
        '!**/dist/**',
        '!src/**/*.desktop.tsx',
        '!src/**/*.mobile.tsx',
        '!src/index.tsx',
        '!src/widget/**/*.tsx',
        '!src/widget/**/controller.ts',
        '!**/types.*',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};

export default config;
