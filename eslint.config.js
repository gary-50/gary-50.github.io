const js = require('@eslint/js');
const globals = require('globals');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
    { ignores: ['node_modules/**', '.git/**', '.claude/**'] },
    js.configs.recommended,
    eslintConfigPrettier,
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'script',
            globals: globals.browser,
        },
        rules: {
            'no-console': 'off',
        },
    },
    {
        files: ['eslint.config.js'],
        languageOptions: {
            globals: {
                ...globals.node,
                require: 'readonly',
                module: 'readonly',
            },
        },
    },
];
