import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
// @ts-ignore - defineConfig might not be typed correctly in this context

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
