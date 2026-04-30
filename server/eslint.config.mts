import js from '@eslint/js';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
// @ts-ignore
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.browser },
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'warn',
        },
    },
    tsEslint.configs.recommended,
]);
