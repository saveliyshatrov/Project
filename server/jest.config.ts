import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { useESM: false }],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    moduleDirectories: ['node_modules', 'src'],
};

export default config;
