import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Exportamos uma função que recebe o diretório raiz de quem a chamou
export const createNodeConfig = (tsconfigRootDir) => {
    return tseslint.config(
        {
            ignores: ['eslint.config.mjs', 'eslint.config.js', 'dist/**', 'node_modules/**'],
        },
        eslint.configs.recommended,
        ...tseslint.configs.recommendedTypeChecked,
        eslintPluginPrettierRecommended,
        {
            languageOptions: {
                globals: {
                    ...globals.node,
                    ...globals.jest,
                },
                sourceType: 'module', // Módulo moderno
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir, // Injetado dinamicamente
                },
            },
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-floating-promises': 'warn',
                '@typescript-eslint/no-unsafe-argument': 'warn',
                'prettier/prettier': ['error', { endOfLine: 'auto' }],
                'no-process-env': 'off'
            },
        }
    );
};

export default createNodeConfig;