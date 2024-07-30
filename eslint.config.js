// .eslintrc.js
const pluginJs = require('@eslint/js');
const globals = require('globals');

module.exports = {
  files: ['**/*.js'],
  languageOptions: {
    sourceType: 'commonjs',
    globals: globals.node,
  },
  rules: {
    // Quy tắc cơ bản
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'no-debugger': 'warn',
    'eqeqeq': ['error', 'always'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
  },
  ...pluginJs.configs.recommended,
};
