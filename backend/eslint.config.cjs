const tsPlugin = require('@typescript-eslint/eslint-plugin/use-at-your-own-risk/raw-plugin');
const eslintConfigPrettier = require('eslint-config-prettier/flat');
const globals = require('globals');

const tsRecommended = tsPlugin.flatConfigs['flat/recommended'];

module.exports = [
  ...tsRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  eslintConfigPrettier,
];
