import js from '@eslint/js'
import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import prettierPlugin from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactRefreshPlugin from 'eslint-plugin-react-refresh'

export default tseslint.config([
    globalIgnores(['dist', 'node_modules', 'vite.config.ts']),
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            'react-refresh': reactRefreshPlugin,
            prettier: prettierPlugin,
        },
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            // React base
            ...reactPlugin.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'react/jsx-uses-vars': 'error',
            'react/display-name': 'off',

            // Hooks
            ...reactHooksPlugin.configs.recommended.rules,
            'react/no-unstable-nested-components': [
                'warn',
                {
                    allowAsProps: true,
                    customValidators: [],
                },
            ],

            // TypeScript & misc
            'no-shadow': 'off',
            'no-undef': 'off',
            'no-unused-expressions': 'off',
            '@typescript-eslint/no-shadow': ['error'],
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                    allowTaggedTemplates: true,
                },
            ],

            // Prettier
            'prettier/prettier': ['warn'],
        },
    },
])
