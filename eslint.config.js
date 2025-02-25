
module.exports = {
  files: ['**/*.js'],
  languageOptions: {
    sourceType: 'commonjs',
    globals: require('globals').node,
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'no-debugger': 'off',
    'eqeqeq': 'off',
    'semi': 'off',
    'quotes': 'off',
    'no-empty': 'off',
    'no-undef': 'off',
  },
  // Không kế thừa cấu hình mặc định
};
