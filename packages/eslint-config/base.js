import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export const baseConfig = [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    {
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn'
        }
    }
];