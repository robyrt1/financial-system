import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import { baseConfig } from './base.js';

export const reactConfig = [
    ...baseConfig,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser
            }
        },
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            'react-refresh': reactRefreshPlugin
        },
        rules: {
            ...reactHooksPlugin.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            'react/react-in-jsx-scope': 'off'
        }
    }
];

export default reactConfig;