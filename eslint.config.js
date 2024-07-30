
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
    // 'no-unused-vars': 'off',
    // 'no-console': 'off',
    // 'no-debugger': 'off',
    // 'eqeqeq': 'off',
    // 'semi': 'off',
    // 'quotes': 'off',
  },
  ...pluginJs.configs.recommended,
};
