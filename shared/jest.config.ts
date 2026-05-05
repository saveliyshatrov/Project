import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { useESM: false }],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^(\\.{1,2}/.*/createResolver)$': '$1.server',
        '^(\\.{1,2}/.*/resolveUser/index)$': '$1.server',
        '^(\\.{1,2}/.*/resolveUsers/index)$': '$1.server',
    },
    moduleFileExtensions: ['server.ts', 'client.ts', 'ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleDirectories: ['node_modules', 'src'],
    collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!**/__tests__/**', '!**/dist/**', '!src/**/*.client.ts'],
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
