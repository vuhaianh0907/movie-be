module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-member-accessibility': 'warn',
    '@typescript-eslint/no-misused-promises': 0,
    '@typescript-eslint/no-floating-promises': 0,
    '@typescript-eslint/no-unused-vars': 'off',
    'max-len': [
      'warn',
      {
        code: 100,
      },
    ],
    'comma-dangle': ['warn', 'always-multiline'],
    'no-console': 1,
    'no-extra-boolean-cast': 0,
    semi: 1,
    indent: ['warn', 2],
    quotes: ['warn', 'single'],
  },
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.node', '.ts'],
    },
  },
};
